import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/get-session';
import { UserRole } from '@/generated/prisma';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';

export default async function CustomerDashboardPage() {
  const user = await requireRole(UserRole.CUSTOMER);

  const customer = await prisma.customer.findUnique({
    where: { userId: user.id },
    include: {
      orders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          lineItems: {
            include: {
              product: {
                select: {
                  name: true,
                  type: true,
                  coverImage: true,
                },
              },
            },
          },
        },
      },
      subscriptions: {
        where: { status: 'active' },
        include: {
          product: {
            select: {
              name: true,
              coverImage: true,
            },
          },
        },
      },
      following: {
        include: {
          creator: {
            select: {
              username: true,
              avatar: true,
              bio: true,
            },
          },
        },
      },
      _count: {
        select: {
          orders: true,
          subscriptions: { where: { status: 'active' } },
          following: true,
        },
      },
    },
  });

  if (!customer) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {user.name || user.email}!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Purchases
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {customer._count.orders}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Active Subscriptions
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {customer._count.subscriptions}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Following
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {customer._count.following}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/browse"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Browse Products
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Discover new digital products
            </p>
          </Link>
          <Link
            href="/dashboard/customer/library"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              My Library
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Access your purchased products
            </p>
          </Link>
          <Link
            href="/dashboard/customer/subscriptions"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Manage Subscriptions
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View and manage your subscriptions
            </p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Orders
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            {customer.orders.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No orders yet. Start browsing products!
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {customer.orders.map((order) => (
                  <li key={order.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Order #{order.id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.lineItems.length} item(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Link
                          href={`/dashboard/customer/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Following Creators */}
        {customer.following.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Creators You Follow
              </h3>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {customer.following.map((follow) => (
                  <li key={follow.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {follow.creator.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={follow.creator.avatar}
                              alt={follow.creator.username}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {follow.creator.username[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/${follow.creator.username}`}
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600"
                          >
                            @{follow.creator.username}
                          </Link>
                          {follow.creator.bio && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {follow.creator.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}