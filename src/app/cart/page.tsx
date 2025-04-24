'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { CartItem } from '@/components/cart/cart-item';
import { Navbar } from '@/components/navbar';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { items, getSubtotal, getTax, getTotal, validateCart, clearCart } = useCart();
  
  const subtotal = getSubtotal();
  const taxRate = 0.08; // 8% tax rate - this could be dynamic based on location
  const tax = getTax(taxRate);
  const total = getTotal(taxRate);

  // Validate cart on mount
  useEffect(() => {
    validateCart();
  }, [validateCart]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Cart Items ({items.length})
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Clear Cart
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>

                {/* Continue shopping */}
                <div className="mt-6">
                  <Link
                    href="/products"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tax ({(taxRate * 100).toFixed(0)}%)
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        ${tax.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          Total
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Link
                      href="/checkout"
                      className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                      Proceed to Checkout
                    </Link>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Secure checkout powered by Stripe
                      </p>
                    </div>
                  </div>

                  {/* Promo code */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Have a promo code?
                        </span>
                        <span className="ml-6 flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </span>
                      </summary>
                      <div className="mt-4">
                        <form className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Enter promo code"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            Apply
                          </button>
                        </form>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}