import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole } from '@/generated/prisma';
import { refreshDownloadLink } from '@/lib/utils/download-links';

interface RouteParams {
  params: {
    linkId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== UserRole.CUSTOMER) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { linkId } = params;

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

    // Check if the download link belongs to this customer
    const downloadLink = await prisma.downloadLink.findFirst({
      where: {
        id: linkId,
        order: {
          customerId: customer.id,
        },
      },
    });

    if (!downloadLink) {
      return NextResponse.json(
        { message: 'Download link not found or unauthorized' },
        { status: 404 }
      );
    }

    // Refresh the download link
    const refreshedLink = await refreshDownloadLink(linkId, 7); // 7 days for refreshed links

    return NextResponse.json(refreshedLink);
  } catch (error) {
    console.error('Error refreshing download link:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}