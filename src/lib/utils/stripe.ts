import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get or initialize the Stripe.js client for the frontend
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  
  return stripePromise;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert amount to Stripe format (cents)
 */
export function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert Stripe amount (cents) to regular format
 */
export function fromStripeAmount(amount: number): number {
  return amount / 100;
}

/**
 * Validate Stripe webhook event type
 */
export function isValidWebhookEvent(eventType: string): boolean {
  const validEvents = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'charge.refunded',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ];
  
  return validEvents.includes(eventType);
}

/**
 * Get Stripe dashboard URL for an object
 */
export function getStripeDashboardUrl(
  objectType: 'payment' | 'customer' | 'subscription' | 'session',
  objectId: string,
  testMode = true
): string {
  const baseUrl = 'https://dashboard.stripe.com';
  const mode = testMode ? '/test' : '';
  
  switch (objectType) {
    case 'payment':
      return `${baseUrl}${mode}/payments/${objectId}`;
    case 'customer':
      return `${baseUrl}${mode}/customers/${objectId}`;
    case 'subscription':
      return `${baseUrl}${mode}/subscriptions/${objectId}`;
    case 'session':
      return `${baseUrl}${mode}/checkout/sessions/${objectId}`;
    default:
      return baseUrl;
  }
}