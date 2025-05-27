'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { useStripeCheckout } from '@/hooks/use-stripe-checkout';
import { Navbar } from '@/components/navbar';
import { CartItem } from '@/components/cart/cart-item';
import { 
  ArrowLeftIcon, 
  ShieldCheckIcon, 
  LockClosedIcon,
  CreditCardIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getSubtotal, getTax, getTotal, validateCart } = useCart();
  const { createCheckout, isLoading } = useStripeCheckout();
  
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string; amount: number} | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState('');
  
  // Guest checkout form state
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const subtotal = getSubtotal();
  const taxRate = 0.08;
  const tax = getTax(taxRate);
  const discount = appliedDiscount?.amount || 0;
  const total = getTotal(taxRate) - discount;

  // Validate cart on mount
  useEffect(() => {
    validateCart();
  }, [validateCart]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && status !== 'loading') {
      router.push('/cart');
    }
  }, [items.length, status, router]);

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCode.trim()) return;
    
    setIsApplyingDiscount(true);
    setDiscountError('');
    
    try {
      // In a real implementation, this would validate the discount code
      // For now, we'll simulate a discount
      if (discountCode.toUpperCase() === 'SAVE10') {
        const discountAmount = subtotal * 0.1; // 10% discount
        setAppliedDiscount({ code: discountCode, amount: discountAmount });
        setDiscountCode('');
      } else {
        setDiscountError('Invalid discount code');
      }
    } catch (error) {
      setDiscountError('Failed to apply discount code');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountError('');
  };

  const handleCheckout = async () => {
    if (!session && (!guestEmail || !guestName)) {
      alert('Please provide your email and name for guest checkout');
      return;
    }
    
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    // Convert cart items to checkout line items
    const checkoutItems = items.map(item => ({
      productId: item.productId,
      versionId: item.versionId,
      quantity: item.quantity,
      price: item.price,
      name: item.product.name,
      description: undefined,
      image: item.product.coverImage || undefined,
    }));

    await createCheckout(
      checkoutItems,
      undefined, // affiliate code
      appliedDiscount?.code
    );
  };

  if (status === 'loading' || items.length === 0) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <Link href="/cart" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <span className="flex items-center justify-center w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full">
                  1
                </span>
                <span className="ml-2">Cart</span>
              </Link>
              <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                <span className="flex items-center justify-center w-8 h-8 border-2 border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-500 text-white rounded-full">
                  2
                </span>
                <span className="ml-2">Checkout</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                <span className="flex items-center justify-center w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full">
                  3
                </span>
                <span className="ml-2">Complete</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column - Customer information and payment */}
            <div className="space-y-6">
              {/* Back to cart link */}
              <Link
                href="/cart"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to cart
              </Link>

              {/* Customer information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Customer Information
                </h2>
                
                {session ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{session.user.email}</p>
                    </div>
                    {session.user.name && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">{session.user.name}</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Not you? <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Sign in</Link>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Already have an account? <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Sign in</Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Payment information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Method
                </h2>
                
                <div className="space-y-4">
                  <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCardIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Secure checkout with Stripe</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Credit card, debit card, and more</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <LockClosedIcon className="h-4 w-4" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>
                </div>
              </div>

              {/* Terms and conditions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>
            </div>

            {/* Right column - Order summary */}
            <div className="lg:sticky lg:top-6 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                {/* Order items */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="py-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                          {item.product.coverImage && (
                            <img
                              src={item.product.coverImage}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.product.name}
                          </h3>
                          {item.version && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.version.name}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount code */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  {!appliedDiscount ? (
                    <form onSubmit={handleApplyDiscount} className="space-y-2">
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            placeholder="Discount code"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isApplyingDiscount || !discountCode.trim()}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isApplyingDiscount ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                      {discountError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{discountError}</p>
                      )}
                    </form>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <div className="flex items-center">
                        <TagIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          {appliedDiscount.code} applied
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveDiscount}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Discount</span>
                      <span className="text-green-600 dark:text-green-400">-${appliedDiscount.amount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                    <span className="text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading || !agreeToTerms || (!session && (!guestEmail || !guestName))}
                  className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="h-5 w-5 mr-2" />
                      Complete Purchase
                    </>
                  )}
                </button>

                {/* Security badges */}
                <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-1" />
                    <span>SSL Secure</span>
                  </div>
                  <div className="flex items-center">
                    <img src="/stripe-badge.svg" alt="Powered by Stripe" className="h-5" />
                  </div>
                </div>

                {/* Notice for Indian regulations */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                    <strong>Note:</strong> For international payments, please use a card issued outside India and provide an address outside India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}