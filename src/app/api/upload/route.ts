import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-session';
import { prisma } from '@/lib/db/prisma';
import { uploadFile } from '@/lib/services/minio';
import { UserRole } from '@/generated/prisma';

// File size limits in bytes
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for digital products

// Allowed MIME types for digital products
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  
  // Video
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  
  // Code/Text files
  'application/javascript',
  'application/json',
  'application/xml',
  'text/html',
  'text/css',
  
  // Other digital products
  'application/epub+zip', // eBooks
  'application/x-mobipocket-ebook', // Kindle
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a creator
    if (user.role !== UserRole.CREATOR) {
      return NextResponse.json(
        { error: 'Forbidden: Only creators can upload files' },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const productId = formData.get('productId') as string | null;
    const versionId = formData.get('versionId') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to the creator
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        creator: {
          userId: user.id
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or you do not have permission to upload files to this product' },
        { status: 404 }
      );
    }

    // If versionId is provided, validate it belongs to the product
    if (versionId) {
      const version = await prisma.productVersion.findFirst({
        where: {
          id: versionId,
          productId: productId
        }
      });

      if (!version) {
        return NextResponse.json(
          { error: 'Version not found or does not belong to this product' },
          { status: 404 }
        );
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to MinIO
    const uploadResult = await uploadFile(
      buffer,
      file.name,
      productId,
      file.type
    );

    // Save file information to database
    const productFile = await prisma.productFile.create({
      data: {
        productId,
        versionId: versionId || null,
        fileName: file.name,
        fileUrl: uploadResult.url,
        fileSize: BigInt(file.size),
        mimeType: file.type,
      },
      select: {
        id: true,
        productId: true,
        versionId: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        version: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    // Convert BigInt to string for JSON serialization
    const response = {
      ...productFile,
      fileSize: productFile.fileSize.toString(),
    };

    return NextResponse.json({
      success: true,
      file: response,
      uploadDetails: {
        key: uploadResult.key,
        size: uploadResult.size,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('File upload error:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('MinIO') || error.message.includes('upload')) {
        return NextResponse.json(
          { error: 'File storage service error. Please try again later.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}