import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/get-session';
import { UserRole } from '@/generated/prisma';
import { prisma } from '@/lib/db/prisma';

export default async function CreatorProductsPage() {
  const user = await requireRole(UserRole.CREATOR);

  const creator = await prisma.creator.findUnique({
    where: { userId: user.id },
    include: {
      products: {
        include: {
          _count: {
            select: {
              lineItems: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!creator) {
    redirect('/dashboard/creator');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Products
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your products and inventory
            </p>
          </div>
          <Link
            href="/dashboard/creator/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Product
          </Link>
        </div>

        {creator.products.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first product to start selling
            </p>
            <Link
              href="/dashboard/creator/products/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Product
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {creator.products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/dashboard/creator/products/${product.id}`}
                    className="block hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {product.coverImage ? (
                          <img
                            src={product.coverImage}
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-gray-400 dark:text-gray-300 text-xs">No image</span>
                          </div>
                        )}
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>${product.price}</span>
                            <span>•</span>
                            <span>{product._count.lineItems} sales</span>
                            <span>•</span>
                            <span>{product._count.reviews} reviews</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.published
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {product.published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-gray-400">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}