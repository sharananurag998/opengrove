'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { CartItem as CartItemType } from '@/types/cart';
import { useCart } from '@/contexts/cart-context';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <div className="flex items-start space-x-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
        {item.product.coverImage ? (
          <Image
            src={item.product.coverImage}
            alt={item.product.name}
            fill
            className="object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-xs">No image</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            <Link
              href={`/creators/${item.creator.username}/products/${item.product.slug}`}
              className="hover:underline"
            >
              {item.product.name}
            </Link>
          </h3>
          {item.version && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Version: {item.version.name}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            by <Link href={`/creators/${item.creator.username}`} className="hover:underline">
              {item.creator.username}
            </Link>
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white px-2">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Increase quantity"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
            <button
              onClick={handleRemove}
              className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              aria-label="Remove item"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}