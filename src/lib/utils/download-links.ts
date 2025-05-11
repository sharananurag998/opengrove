import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

/**
 * Generate a secure download token
 */
export async function generateDownloadToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create download links for an order
 */
export async function createDownloadLinksForOrder(
  orderId: string,
  expiryDays: number = 30,
  maxDownloads: number = 5
) {
  try {
    // Get the order with line items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lineItems: {
          include: {
            product: true,
          },
        },
        downloadLinks: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if download links already exist
    if (order.downloadLinks.length > 0) {
      console.log(`Download links already exist for order ${orderId}`);
      return order.downloadLinks;
    }

    // Get unique digital products
    const digitalProducts = new Set<string>();
    for (const lineItem of order.lineItems) {
      if (lineItem.product.type === 'DIGITAL') {
        digitalProducts.add(lineItem.productId);
      }
    }

    // Create download links for each unique digital product
    const downloadLinks = [];
    for (const productId of digitalProducts) {
      const downloadLink = await prisma.downloadLink.create({
        data: {
          orderId,
          token: await generateDownloadToken(),
          expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
          maxDownloads,
        },
      });
      downloadLinks.push(downloadLink);
    }

    return downloadLinks;
  } catch (error) {
    console.error('Error creating download links:', error);
    throw error;
  }
}

/**
 * Refresh an expired download link
 */
export async function refreshDownloadLink(
  linkId: string,
  expiryDays: number = 7
) {
  try {
    const downloadLink = await prisma.downloadLink.findUnique({
      where: { id: linkId },
      include: {
        order: {
          include: {
            customer: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!downloadLink) {
      throw new Error('Download link not found');
    }

    // Check if the order belongs to the requesting user
    // This check should be done in the calling function with proper auth

    // Update the download link with new expiry
    const updatedLink = await prisma.downloadLink.update({
      where: { id: linkId },
      data: {
        token: await generateDownloadToken(), // Generate new token for security
        expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
        downloads: 0, // Reset download count
      },
    });

    return updatedLink;
  } catch (error) {
    console.error('Error refreshing download link:', error);
    throw error;
  }
}

/**
 * Get download URL for a link
 */
export function getDownloadUrl(token: string, productId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  let url = `${baseUrl}/api/downloads/${token}`;
  
  if (productId) {
    url += `?productId=${productId}`;
  }
  
  return url;
}

/**
 * Check if a download link is valid
 */
export async function validateDownloadLink(token: string): Promise<{
  valid: boolean;
  reason?: string;
  downloadLink?: any;
}> {
  try {
    const downloadLink = await prisma.downloadLink.findUnique({
      where: { token },
      include: {
        order: true,
      },
    });

    if (!downloadLink) {
      return { valid: false, reason: 'Download link not found' };
    }

    if (new Date() > downloadLink.expiresAt) {
      return { valid: false, reason: 'Download link has expired', downloadLink };
    }

    if (downloadLink.downloads >= downloadLink.maxDownloads) {
      return { valid: false, reason: 'Download limit exceeded', downloadLink };
    }

    if (downloadLink.order.status !== 'COMPLETED') {
      return { valid: false, reason: 'Order is not completed', downloadLink };
    }

    return { valid: true, downloadLink };
  } catch (error) {
    console.error('Error validating download link:', error);
    return { valid: false, reason: 'Failed to validate download link' };
  }
}

/**
 * Get all download links for a customer
 */
export async function getCustomerDownloadLinks(customerId: string) {
  try {
    const downloadLinks = await prisma.downloadLink.findMany({
      where: {
        order: {
          customerId,
          status: 'COMPLETED',
        },
      },
      include: {
        order: {
          include: {
            lineItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    coverImage: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group by product and enhance with download info
    const productDownloads = new Map();

    for (const link of downloadLinks) {
      for (const lineItem of link.order.lineItems) {
        if (lineItem.product.type === 'DIGITAL') {
          const productId = lineItem.product.id;
          
          if (!productDownloads.has(productId)) {
            productDownloads.set(productId, {
              product: lineItem.product,
              purchaseDate: link.order.createdAt,
              downloads: [],
            });
          }

          productDownloads.get(productId).downloads.push({
            linkId: link.id,
            token: link.token,
            expiresAt: link.expiresAt,
            downloads: link.downloads,
            maxDownloads: link.maxDownloads,
            isExpired: new Date() > link.expiresAt,
            isExhausted: link.downloads >= link.maxDownloads,
          });
        }
      }
    }

    return Array.from(productDownloads.values());
  } catch (error) {
    console.error('Error getting customer download links:', error);
    throw error;
  }
}