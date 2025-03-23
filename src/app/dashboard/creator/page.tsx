import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/get-session';
import { UserRole } from '@/generated/prisma';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';

export default async function CreatorDashboardPage() {
  const user = await requireRole(UserRole.CREATOR);

  const creator = await prisma.creator.findUnique({
    where: { userId: user.id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          published: true,
          _count: {
            select: {
              lineItems: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          products: true,
          followers: true,
        },
      },
    },
  });

  if (!creator) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Creator Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {user.name || user.email}!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Products
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {creator._count.products}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Followers
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {creator._count.followers}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Sales
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {creator.products.reduce((sum, p) => sum + p._count.lineItems, 0)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Link
            href="/dashboard/creator/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Product
          </Link>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Your Products
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            {creator.products.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No products yet. Create your first product to get started!
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {creator.products.map((product) => (
                  <li key={product.id}>
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ${product.price?.toString() || '0'} • {product._count.lineItems} sales
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.published ? 'Published' : 'Draft'}
                        </span>
                        <Link
                          href={`/dashboard/creator/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/creator/analytics"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Analytics</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View your sales data and performance metrics
            </p>
          </Link>
          <Link
            href="/dashboard/creator/settings"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Settings</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage your profile and payment settings
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}