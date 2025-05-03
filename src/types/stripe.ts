import { Stripe } from 'stripe';

export interface StripeWebhookEvent extends Stripe.Event {
  data: {
    object: Stripe.Event.Data.Object;
  };
}

export interface CheckoutLineItem {
  productId: string;
  versionId?: string;
  quantity: number;
  price: number;
  name: string;
  description?: string;
  image?: string;
}

export interface CheckoutMetadata {
  userId?: string;
  affiliateId?: string;
  discountId?: string;
  discountCode?: string;
  affiliateCode?: string;
  items: string; // JSON stringified array of items
  [key: string]: string | undefined;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string | null;
  sessionId: string;
}

export interface StripeError {
  error: string;
  details?: any;
}