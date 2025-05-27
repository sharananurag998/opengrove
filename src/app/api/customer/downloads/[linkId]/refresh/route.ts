import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{ linkId: string }>;
}

export async function POST(
  request: Request,
  { params }: RouteParams
) {
  const { linkId } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const downloadLink = await prisma.downloadLink.findUnique({
      where: {
        id: linkId,
      },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!downloadLink) {
      return NextResponse.json(
        { error: "Download link not found" },
        { status: 404 }
      );
    }

    if (downloadLink.order.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updatedLink = await prisma.downloadLink.update({
      where: {
        id: linkId,
      },
      data: {
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        downloads: 0, // Reset download count
      },
    });

    return NextResponse.json({
      success: true,
      expiresAt: updatedLink.expiresAt,
    });
  } catch (error) {
    console.error("Error refreshing download link:", error);
    return NextResponse.json(
      { error: "Failed to refresh download link" },
      { status: 500 }
    );
  }
}