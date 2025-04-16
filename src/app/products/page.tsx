import { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { ProductCard } from '@/components/product-card';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Products - OpenGrove',
  description: 'Discover amazing digital products from creators',
};

async function getPublishedProducts() {
  return await prisma.product.findMany({
    where: {
      published: true,
    },
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
      _count: {
        select: {
          reviews: true,
          lineItems: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function ProductsPage() {
  const products = await getPublishedProducts();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Browse through our collection of digital products created by talented creators
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No products available yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Check back soon for new products from our creators
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}