import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Find order by Stripe session ID
    const order = await prisma.order.findFirst({
      where: {
        stripeSessionId: sessionId,
        // If user is logged in, ensure they own the order
        ...(session?.user?.id && { userId: session.user.id }),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                slug: true,
              },
            },
            version: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        customer: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Format order data for the frontend
    const orderDetails = {
      id: order.id,
      orderNumber: order.orderNumber,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        versionName: item.version?.name,
        quantity: item.quantity,
        price: Number(item.price),
        productType: item.product.type,
        // Generate download URL for digital products
        downloadUrl: item.product.type === 'DIGITAL' 
          ? `/api/downloads/${order.id}/${item.id}`
          : undefined,
      })),
      customerEmail: order.customer?.email || order.customerEmail,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
    };

    return NextResponse.json(orderDetails);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}