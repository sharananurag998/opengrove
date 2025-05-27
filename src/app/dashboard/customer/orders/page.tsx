import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import OrderList from "@/components/customer/order-list";

export const metadata = {
  title: "Order History - OpenGrove",
  description: "View your order history and download your purchases",
};

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
    search?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const page = parseInt(params.page || "1");
  const limit = 10;
  const offset = (page - 1) * limit;

  const where: any = {
    customerId: session.user.id,
  };

  if (params.status) {
    where.status = params.status;
  }

  if (params.search) {
    where.OR = [
      {
        orderNumber: {
          contains: params.search,
          mode: "insensitive",
        },
      },
      {
        items: {
          some: {
            product: {
              name: {
                contains: params.search,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ];
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
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
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <p className="mt-2 text-gray-600">
          View and manage your past orders
        </p>
      </div>

      <OrderList
        orders={orders}
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </div>
  );
}