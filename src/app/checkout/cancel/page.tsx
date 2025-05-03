'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { Navbar } from '@/components/navbar';
import { 
  XCircleIcon,
  ShoppingCartIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function CheckoutCancelPage() {
  const router = useRouter();
  const { items } = useCart();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Cancel message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <XCircleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Checkout Cancelled
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your order was not completed. Your cart items are still saved.
            </p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Cart status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ShoppingCartIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Your Cart is Safe
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Don't worry! Your cart still contains {items.length} {items.length === 1 ? 'item' : 'items'}. 
                    You can return to checkout anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Need Help?
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    If you experienced any issues during checkout, please{' '}
                    <Link href="/contact" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      contact our support team
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Common reasons */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Common reasons for cancelled checkouts:
            </h3>
            <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>Changed your mind about the purchase</li>
              <li>Want to add or remove items from your cart</li>
              <li>Need to verify payment information</li>
              <li>Decided to compare prices or products</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {items.length > 0 ? (
              <>
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeftIcon className="mr-2 h-5 w-5" />
                  Return to Cart
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </>
            ) : (
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </Link>
            )}
          </div>

          {/* Promo */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              New to OpenGrove?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Get 10% off your first purchase with code <span className="font-mono font-medium text-gray-700 dark:text-gray-300">WELCOME10</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}