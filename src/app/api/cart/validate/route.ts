import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

const cartItemSchema = z.object({
  productId: z.string(),
  versionId: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

const validateCartSchema = z.object({
  items: z.array(cartItemSchema),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = validateCartSchema.parse(body);

    const validationResults = await Promise.all(
      items.map(async (item) => {
        try {
          // Fetch product with versions
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: {
              versions: item.versionId ? {
                where: { id: item.versionId },
              } : false,
            },
          });

          if (!product) {
            return {
              itemId: `${item.productId}-${item.versionId || 'default'}`,
              valid: false,
              error: 'Product not found',
            };
          }

          if (!product.published) {
            return {
              itemId: `${item.productId}-${item.versionId || 'default'}`,
              valid: false,
              error: 'Product is not available',
            };
          }

          // Check version if specified
          if (item.versionId && product.versions) {
            const version = Array.isArray(product.versions) ? product.versions[0] : null;
            if (!version) {
              return {
                itemId: `${item.productId}-${item.versionId || 'default'}`,
                valid: false,
                error: 'Product version not found',
              };
            }

            const currentPrice = Number(version.price);
            if (currentPrice !== item.price) {
              return {
                itemId: `${item.productId}-${item.versionId || 'default'}`,
                valid: false,
                error: 'Price has changed',
                updatedPrice: currentPrice,
              };
            }
          } else {
            // Check main product price
            const currentPrice = Number(product.price || 0);
            if (currentPrice !== item.price) {
              return {
                itemId: `${item.productId}-${item.versionId || 'default'}`,
                valid: false,
                error: 'Price has changed',
                updatedPrice: currentPrice,
              };
            }
          }

          return {
            itemId: `${item.productId}-${item.versionId || 'default'}`,
            valid: true,
          };
        } catch (error) {
          console.error('Error validating cart item:', error);
          return {
            itemId: `${item.productId}-${item.versionId || 'default'}`,
            valid: false,
            error: 'Failed to validate item',
          };
        }
      })
    );

    const allValid = validationResults.every(result => result.valid);

    return NextResponse.json({
      valid: allValid,
      items: validationResults,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid cart data', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error validating cart:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}