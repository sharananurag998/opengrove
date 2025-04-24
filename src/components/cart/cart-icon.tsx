'use client';

import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/cart-context';

interface CartIconProps {
  onClick: () => void;
  className?: string;
}

export function CartIcon({ onClick, className = '' }: CartIconProps) {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${className}`}
      aria-label="Shopping cart"
    >
      <ShoppingCartIcon className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}