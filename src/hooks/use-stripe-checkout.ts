import { useState } from 'react';
import { getStripe } from '@/lib/utils/stripe';
import { CheckoutLineItem, CreateCheckoutResponse } from '@/types/stripe';

interface UseStripeCheckoutOptions {
  onSuccess?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

export function useStripeCheckout(options?: UseStripeCheckoutOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCheckout = async (
    items: CheckoutLineItem[],
    affiliateCode?: string,
    discountCode?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          affiliateCode,
          discountCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { checkoutUrl, sessionId }: CreateCheckoutResponse = await response.json();

      if (!checkoutUrl) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }

      options?.onSuccess?.(sessionId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      options?.onError?.(error);
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckout,
    isLoading,
    error,
  };
}