import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generatePresignedUrl } from '@/lib/services/minio';

interface RouteParams {
  params: {
    linkId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { linkId } = params;

    // Find the download link
    const downloadLink = await prisma.downloadLink.findUnique({
      where: { token: linkId },
      include: {
        order: {
          include: {
            lineItems: {
              include: {
                product: {
                  include: {
                    files: true,
                    versions: {
                      include: {
                        files: true,
                      },
                    },
                  },
                },
                version: {
                  include: {
                    files: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Check if link exists
    if (!downloadLink) {
      return NextResponse.json(
        { error: 'Invalid download link' },
        { status: 404 }
      );
    }

    // Check if link is expired
    if (new Date() > downloadLink.expiresAt) {
      return NextResponse.json(
        { error: 'Download link has expired' },
        { status: 410 } // Gone
      );
    }

    // Check download limit
    if (downloadLink.downloads >= downloadLink.maxDownloads) {
      return NextResponse.json(
        { error: 'Download limit exceeded' },
        { status: 429 } // Too Many Requests
      );
    }

    // Check if order is completed
    if (downloadLink.order.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Order is not completed' },
        { status: 403 }
      );
    }

    // Get product ID from query parameter if multiple products
    const productId = request.nextUrl.searchParams.get('productId');
    
    // Collect all files for digital products in the order
    const filesToDownload: { key: string; fileName: string; productName: string }[] = [];
    
    for (const lineItem of downloadLink.order.lineItems) {
      if (lineItem.product.type === 'DIGITAL') {
        // If productId is specified, only include files for that product
        if (productId && lineItem.productId !== productId) {
          continue;
        }

        // Get files from specific version if available, otherwise from product
        const files = lineItem.version?.files || lineItem.product.files;
        
        for (const file of files) {
          // Extract the file key from the URL
          // Assuming fileUrl format: http://endpoint:port/bucket/key
          const urlParts = file.fileUrl.split('/');
          const bucketIndex = urlParts.findIndex(part => part === process.env.MINIO_BUCKET_NAME);
          const fileKey = urlParts.slice(bucketIndex + 1).join('/');
          
          filesToDownload.push({
            key: fileKey,
            fileName: file.fileName,
            productName: lineItem.product.name,
          });
        }
      }
    }

    // If no files found
    if (filesToDownload.length === 0) {
      return NextResponse.json(
        { error: 'No downloadable files found' },
        { status: 404 }
      );
    }

    // If only one file, generate presigned URL and redirect
    if (filesToDownload.length === 1) {
      const file = filesToDownload[0];
      
      // Generate presigned URL with 1 hour expiry
      const presignedUrl = await generatePresignedUrl(file.key, 3600);
      
      // Increment download count
      await prisma.downloadLink.update({
        where: { id: downloadLink.id },
        data: {
          downloads: {
            increment: 1,
          },
        },
      });

      // Log download for analytics
      console.log(`Download initiated for order ${downloadLink.order.id}, file: ${file.fileName}`);

      // Redirect to the presigned URL
      return NextResponse.redirect(presignedUrl);
    }

    // If multiple files, return a JSON response with all presigned URLs
    const downloadUrls = await Promise.all(
      filesToDownload.map(async (file) => ({
        productName: file.productName,
        fileName: file.fileName,
        url: await generatePresignedUrl(file.key, 3600),
      }))
    );

    // Increment download count
    await prisma.downloadLink.update({
      where: { id: downloadLink.id },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });

    // Return JSON response with multiple download URLs
    return NextResponse.json({
      downloads: downloadUrls,
      remainingDownloads: downloadLink.maxDownloads - downloadLink.downloads - 1,
      expiresAt: downloadLink.expiresAt,
    });

  } catch (error) {
    console.error('Error processing download request:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}