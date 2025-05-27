import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { UserRole, ProductType, PricingModel } from '@/generated/prisma';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  price: z.number().min(0),
  type: z.nativeEnum(ProductType),
  pricingModel: z.nativeEnum(PricingModel),
  published: z.boolean(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        files: true,
        versions: {
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            lineItems: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== UserRole.CREATOR) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = updateProductSchema.parse(body);

    // Get the creator profile
    const creator = await prisma.creator.findUnique({
      where: { userId: session.user.id },
    });

    if (!creator) {
      return NextResponse.json(
        { message: 'Creator profile not found' },
        { status: 404 }
      );
    }

    // Check if the product belongs to this creator
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: id,
        creatorId: creator.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the product
    const product = await prisma.product.update({
      where: { id: id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        type: data.type,
        pricingModel: data.pricingModel,
        published: data.published,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== UserRole.CREATOR) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the creator profile
    const creator = await prisma.creator.findUnique({
      where: { userId: session.user.id },
    });

    if (!creator) {
      return NextResponse.json(
        { message: 'Creator profile not found' },
        { status: 404 }
      );
    }

    // Check if the product belongs to this creator
    const product = await prisma.product.findFirst({
      where: {
        id: id,
        creatorId: creator.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}