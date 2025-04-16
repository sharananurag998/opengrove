import Link from 'next/link';
import { Product, Creator, User } from '@/generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface ProductWithCreator extends Product {
  creator: Creator & {
    user: Pick<User, 'name' | 'email'>;
  };
  _count?: {
    reviews: number;
    lineItems: number;
  };
}

interface ProductCardProps {
  product: ProductWithCreator;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: Decimal | number | null | undefined) => {
    if (!price) return 'Free';
    const numericPrice = price instanceof Decimal ? price.toNumber() : Number(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD',
    }).format(numericPrice);
  };

  const productUrl = `/products/${product.slug}`;

  return (
    <Link href={productUrl} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        <div className="aspect-w-16 aspect-h-9 relative">
          {product.coverImage ? (
            <img
              src={product.coverImage}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">No image available</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {product.description || 'No description available'}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {product.type.replace('_', ' ').toLowerCase()}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              by {product.creator.user.name || product.creator.username}
            </span>
            {product._count && (
              <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                {product._count.lineItems > 0 && (
                  <span>{product._count.lineItems} sales</span>
                )}
                {product._count.reviews > 0 && (
                  <span>{product._count.reviews} reviews</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}