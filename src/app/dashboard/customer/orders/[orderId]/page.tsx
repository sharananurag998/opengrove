import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import OrderDetail from "@/components/customer/order-detail";

export const metadata = {
  title: "Order Details - OpenGrove",
  description: "View your order details and download your purchases",
};

interface OrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId: session.user.id,
    },
    include: {
      customer: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      items: {
        include: {
          product: {
            include: {
              creator: {
                select: {
                  id: true,
                  username: true,
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      payment: true,
      downloadLinks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <OrderDetail order={order} />
    </div>
  );
}