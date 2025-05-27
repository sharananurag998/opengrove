import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { constructWebhookEvent, retrieveCheckoutSession } from '@/lib/services/stripe';
import { prisma } from '@/lib/db/prisma';
import { OrderStatus, PaymentStatus, ProductType } from '@/generated/prisma';

// Disable body parsing, as we need the raw body for webhook verification
export const runtime = 'nodejs';

async function generateLicenseKey(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 4; i++) {
    if (i > 0) key += '-';
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return key;
}

async function generateDownloadToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function generateOrderNumber(): Promise<string> {
  // Generate order number format: OG-YYYYMMDD-XXXXXX
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate random 6-character alphanumeric suffix
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `OG-${year}${month}${day}-${suffix}`;
}

async function createOrderFromSession(session: Stripe.Checkout.Session) {
  try {
    // Parse metadata
    const metadata = session.metadata || {};
    const items = JSON.parse(metadata.items || '[]');
    const userId = metadata.userId !== 'guest' ? metadata.userId : null;
    const affiliateId = metadata.affiliateId || null;
    const discountId = metadata.discountId || null;

    // Get customer ID if user is logged in
    let customerId: string | null = null;
    if (userId) {
      const customer = await prisma.customer.findUnique({
        where: { userId },
      });
      customerId = customer?.id || null;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: await generateOrderNumber(),
        customerId,
        userId,
        email: session.customer_email || session.customer_details?.email || '',
        customerEmail: session.customer_email || session.customer_details?.email || '',
        status: OrderStatus.PROCESSING,
        totalAmount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
        total: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
        currency: session.currency?.toUpperCase() || 'USD',
        affiliateId,
        discountId,
        stripeSessionId: session.id,
        metadata: {
          stripeSessionId: session.id,
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
          customerDetails: session.customer_details ? JSON.parse(JSON.stringify(session.customer_details)) : null,
        },
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            versionId: item.versionId || null,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        payment: {
          create: {
            gateway: 'stripe',
            transactionId: session.payment_intent as string,
            status: PaymentStatus.COMPLETED,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || 'USD',
            metadata: {
              stripeSessionId: session.id,
            },
          },
        },
      },
    });

    // Fetch the order with all relations
    const orderWithRelations = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                files: true,
                creator: true,
              },
            },
            version: {
              include: {
                files: true,
              },
            },
          },
        },
        affiliate: true,
      },
    });

    // Generate license keys for products that require them
    const licenseKeys = [];
    for (const lineItem of orderWithRelations!.items) {
      if (lineItem.product.requiresLicense) {
        for (let i = 0; i < lineItem.quantity; i++) {
          const licenseKey = await prisma.licenseKey.create({
            data: {
              orderId: order.id,
              key: await generateLicenseKey(),
              maxActivations: 3, // Default max activations
              expiresAt: null, // No expiration by default
            },
          });
          licenseKeys.push(licenseKey);
        }
      }
    }

    // Generate download links for digital products
    const downloadLinks = [];
    const uniqueProducts = new Set<string>();
    
    for (const lineItem of orderWithRelations!.items) {
      if (lineItem.product.type === ProductType.DIGITAL && !uniqueProducts.has(lineItem.productId)) {
        uniqueProducts.add(lineItem.productId);
        
        const downloadLink = await prisma.downloadLink.create({
          data: {
            orderId: order.id,
            token: await generateDownloadToken(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            maxDownloads: 5,
          },
        });
        downloadLinks.push(downloadLink);
      }
    }

    // Update discount usage count
    if (discountId) {
      await prisma.discount.update({
        where: { id: discountId },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });
    }

    // Update affiliate statistics
    if (orderWithRelations!.affiliateId) {
      await prisma.affiliate.update({
        where: { id: orderWithRelations!.affiliateId },
        data: {
          totalSales: {
            increment: 1,
          },
          totalEarnings: {
            increment: orderWithRelations!.totalAmount.toNumber() * 0.1, // 10% commission - this should be configurable
          },
        },
      });
    }

    // Mark order as completed
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.COMPLETED,
      },
    });

    // TODO: Send order confirmation email with download links and license keys
    // This would integrate with your email service

    // TODO: Trigger webhook to creator if they have webhooks configured
    // This would notify the creator of a new sale

    console.log(`Order ${order.id} created successfully from Stripe session ${session.id}`);
    
    return order;
  } catch (error) {
    console.error('Error creating order from session:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Construct and verify the webhook event
    let event: Stripe.Event;
    try {
      event = await constructWebhookEvent(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Check if we've already processed this session
        const existingOrder = await prisma.order.findFirst({
          where: {
            metadata: {
              path: ['stripeSessionId'],
              equals: session.id,
            },
          },
        });

        if (existingOrder) {
          console.log(`Order already exists for session ${session.id}`);
          return NextResponse.json({ received: true });
        }

        // Retrieve the full session with line items
        const fullSession = await retrieveCheckoutSession(session.id);
        
        // Create the order
        await createOrderFromSession(fullSession);
        
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update payment status if needed
        const payment = await prisma.payment.findUnique({
          where: { transactionId: paymentIntent.id },
        });

        if (payment && payment.status !== PaymentStatus.COMPLETED) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.COMPLETED,
              updatedAt: new Date(),
            },
          });
        }
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update payment status
        const payment = await prisma.payment.findUnique({
          where: { transactionId: paymentIntent.id },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.FAILED,
              updatedAt: new Date(),
            },
          });

          // Update order status
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: OrderStatus.FAILED,
              updatedAt: new Date(),
            },
          });
        }
        
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        // Find and update the payment
        const payment = await prisma.payment.findFirst({
          where: {
            transactionId: charge.payment_intent as string,
          },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.REFUNDED,
              updatedAt: new Date(),
            },
          });

          // Update order status
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: OrderStatus.REFUNDED,
              updatedAt: new Date(),
            },
          });
        }
        
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        // Handle subscription events (for future implementation)
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription event ${event.type} for ${subscription.id}`);
        // TODO: Implement subscription handling
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}