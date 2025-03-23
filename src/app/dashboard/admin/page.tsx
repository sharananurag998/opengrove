import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/get-session';
import { UserRole } from '@/generated/prisma';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const user = await requireRole(UserRole.ADMIN);

  // Get platform statistics
  const [
    totalUsers,
    totalCreators,
    totalCustomers,
    totalProducts,
    totalOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.creator.count(),
    prisma.customer.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalRevenue = await prisma.order.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { totalAmount: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Platform overview and management
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Users
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {totalUsers}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {totalCreators} creators, {totalCustomers} customers
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Products
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {totalProducts}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Orders
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {totalOrders}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Revenue
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              ${totalRevenue._sum.totalAmount?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/dashboard/admin/users"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Manage Users
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View and manage all platform users
            </p>
          </Link>
          <Link
            href="/dashboard/admin/products"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Manage Products
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Review and moderate products
            </p>
          </Link>
          <Link
            href="/dashboard/admin/payouts"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Process Payouts
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage creator payouts
            </p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Orders
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            {recentOrders.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No orders yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order) => (
                  <li key={order.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Order #{order.id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.customer?.user.email || order.email}
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
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* System Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/admin/settings"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              System Settings
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Configure platform settings and integrations
            </p>
          </Link>
          <Link
            href="/dashboard/admin/analytics"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Platform Analytics
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View platform-wide metrics and trends
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}