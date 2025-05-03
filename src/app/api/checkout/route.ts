import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/auth-options';
import { createCheckoutSession, createOrRetrieveCustomer } from '@/lib/services/stripe';
import { prisma } from '@/lib/db/prisma';

// Validation schema for checkout request
const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      versionId: z.string().optional(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  affiliateCode: z.string().optional(),
  discountCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);
    const { items, affiliateCode, discountCode } = validatedData;

    // Fetch product details and validate items
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        published: true,
      },
      include: {
        versions: {
          where: {
            id: { in: items.map(item => item.versionId).filter(Boolean) as string[] },
          },
        },
        creator: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products not found or not published' },
        { status: 400 }
      );
    }

    // Build checkout items with pricing
    const checkoutItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      // Handle version-specific pricing if applicable
      let price = Number(product.price);
      let versionName = '';
      
      if (item.versionId && product.versions.length > 0) {
        const version = product.versions.find(v => v.id === item.versionId);
        if (version) {
          price = Number(version.price);
          versionName = ` - ${version.name}`;
        }
      }

      // Handle pay-what-you-want pricing
      if (product.pricingModel === 'PAY_WHAT_YOU_WANT') {
        // In a real implementation, you'd get the user's chosen price from the request
        price = Math.max(Number(product.minimumPrice) || 0, price);
      }

      return {
        productId: product.id,
        versionId: item.versionId,
        quantity: item.quantity,
        price,
        name: product.name + versionName,
        description: product.description?.substring(0, 200),
        image: product.coverImage || undefined,
      };
    });

    // Calculate total amount
    const totalAmount = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Handle discount code if provided
    let discountId: string | undefined;
    let discountAmount = 0;
    
    if (discountCode) {
      const discount = await prisma.discount.findUnique({
        where: { code: discountCode },
        include: {
          products: true,
        },
      });

      if (discount && discount.active && (!discount.expiresAt || discount.expiresAt > new Date())) {
        // Check if discount applies to any of the products
        const applicableProducts = checkoutItems.filter(item =>
          discount.products.length === 0 || // Applies to all products
          discount.products.some(dp => dp.productId === item.productId)
        );

        if (applicableProducts.length > 0) {
          // Check usage limit
          if (!discount.usageLimit || discount.usageCount < discount.usageLimit) {
            discountId = discount.id;
            
            // Calculate discount amount
            if (discount.type === 'percentage') {
              const applicableAmount = applicableProducts.reduce(
                (sum, item) => sum + (item.price * item.quantity),
                0
              );
              discountAmount = (applicableAmount * Number(discount.value)) / 100;
            } else {
              discountAmount = Number(discount.value);
            }
            
            // Ensure discount doesn't exceed total amount
            discountAmount = Math.min(discountAmount, totalAmount);
          }
        }
      }
    }

    // Handle affiliate code if provided
    let affiliateId: string | undefined;
    
    if (affiliateCode) {
      const affiliate = await prisma.affiliate.findUnique({
        where: { code: affiliateCode },
      });
      
      if (affiliate) {
        affiliateId = affiliate.id;
        
        // Track affiliate click
        await prisma.affiliateClick.create({
          data: {
            affiliateId: affiliate.id,
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || undefined,
            referrer: request.headers.get('referer') || undefined,
          },
        });
      }
    }

    // Get or create Stripe customer
    let stripeCustomerId: string | undefined;
    let customerEmail: string;
    
    if (session?.user?.email) {
      customerEmail = session.user.email;
      
      // Check if user has a customer profile with Stripe ID
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });
      
      if (customer?.stripeCustomerId) {
        stripeCustomerId = customer.stripeCustomerId;
      } else {
        // Create Stripe customer and update database
        const stripeCustomer = await createOrRetrieveCustomer(
          session.user.email,
          session.user.name || undefined,
          customer?.stripeCustomerId || undefined
        );
        
        if (customer) {
          await prisma.customer.update({
            where: { id: customer.id },
            data: { stripeCustomerId: stripeCustomer.id },
          });
        }
        
        stripeCustomerId = stripeCustomer.id;
      }
    } else {
      // Guest checkout - email will be collected by Stripe
      customerEmail = '';
    }

    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession({
      items: checkoutItems.map(item => ({
        ...item,
        price: item.price - (discountAmount * item.price / totalAmount), // Apply proportional discount
      })),
      customerId: stripeCustomerId,
      customerEmail,
      affiliateId,
      discountId,
      metadata: {
        userId: session?.user?.id || 'guest',
        discountCode: discountCode || '',
        affiliateCode: affiliateCode || '',
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}