import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole } from '@/generated/prisma';
import { getCustomerDownloadLinks } from '@/lib/utils/download-links';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== UserRole.CUSTOMER) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get customer profile
    const { prisma } = await import('@/lib/db/prisma');
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    });

    if (!customer) {
      return NextResponse.json(
        { message: 'Customer profile not found' },
        { status: 404 }
      );
    }

    // Get all download links for the customer
    const downloads = await getCustomerDownloadLinks(customer.id);

    return NextResponse.json(downloads);
  } catch (error) {
    console.error('Error fetching customer downloads:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}