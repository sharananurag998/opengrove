import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-session';
import { prisma } from '@/lib/db/prisma';
import { UserRole } from '@/generated/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
    fileId: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId, fileId } = await params;
    
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
        { error: 'Forbidden: Only creators can delete files' },
        { status: 403 }
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
        { error: 'Product not found or you do not have permission' },
        { status: 404 }
      );
    }

    // Check if file exists and belongs to the product
    const file = await prisma.productFile.findFirst({
      where: {
        id: fileId,
        productId: productId
      }
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete the file record from database
    // Note: In a production environment, you would also delete the file from MinIO/S3
    await prisma.productFile.delete({
      where: {
        id: fileId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}