'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { Navbar } from '@/components/navbar';
import { 
  CheckCircleIcon, 
  ArrowDownTrayIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface OrderDetails {
  id: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    productName: string;
    versionName?: string;
    quantity: number;
    price: number;
    downloadUrl?: string;
    productType: string;
  }>;
  customerEmail: string;
  total: number;
  createdAt: string;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    // Clear the cart on successful checkout
    clearCart();

    // Fetch order details
    fetchOrderDetails();
  }, [sessionId, clearCart, router]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/session/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      setOrderDetails(data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please check your email for confirmation.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Thank you for your purchase!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your order has been confirmed and is being processed.
            </p>
          </div>

          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          ) : orderDetails ? (
            <>
              {/* Order details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Order #{orderDetails.orderNumber}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Placed on {new Date(orderDetails.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        ${orderDetails.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order items */}
                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.productName}
                          </h3>
                          {item.versionName && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.versionName}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="ml-4">
                          {item.productType === 'DIGITAL' && item.downloadUrl && (
                            <Link
                              href={item.downloadUrl}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                              Download
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Email confirmation */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <EnvelopeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Confirmation Email
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        We've sent a confirmation email to <span className="font-medium">{orderDetails.customerEmail}</span> with your order details and download links.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Download instructions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Download Your Files
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Digital products are available for immediate download. Click the download button next to each item above.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important notes */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Important Information
                </h3>
                <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>Download links will expire in 7 days for security reasons</li>
                  <li>You can always access your purchases from your account dashboard</li>
                  <li>If you have any issues, please contact support</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Unable to load order details. Please check your email for confirmation.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}