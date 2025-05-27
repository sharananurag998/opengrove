import Stripe from 'stripe';

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// Types for Stripe integration
export interface CheckoutSessionData {
  items: Array<{
    productId: string;
    versionId?: string;
    quantity: number;
    price: number;
    name: string;
    description?: string;
    image?: string;
  }>;
  customerId?: string;
  customerEmail: string;
  affiliateId?: string;
  discountId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentData {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrRetrieveCustomer(
  email: string,
  name?: string,
  customerId?: string
): Promise<Stripe.Customer> {
  // If we have a Stripe customer ID, try to retrieve the customer
  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer.deleted) {
        return customer as Stripe.Customer;
      }
    } catch (error) {
      console.error('Error retrieving customer:', error);
    }
  }

  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      source: 'opengrove',
    },
  });
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(data: CheckoutSessionData): Promise<Stripe.Checkout.Session> {
  const {
    items,
    customerId,
    customerEmail,
    affiliateId,
    discountId,
    metadata = {},
  } = data;

  // Use INR for Indian Stripe accounts, USD otherwise
  const currency = process.env.STRIPE_CURRENCY || 'inr';
  
  // Create line items for Stripe
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
    price_data: {
      currency: currency,
      product_data: {
        name: item.name,
        description: item.description,
        images: item.image ? [item.image] : undefined,
        metadata: {
          productId: item.productId,
          versionId: item.versionId || '',
        },
      },
      unit_amount: Math.round(item.price * 100), // Convert to smallest currency unit
    },
    quantity: item.quantity,
  }));

  // Prepare session metadata
  const sessionMetadata: Record<string, string> = {
    ...metadata,
    source: 'opengrove',
  };

  if (affiliateId) {
    sessionMetadata.affiliateId = affiliateId;
  }

  if (discountId) {
    sessionMetadata.discountId = discountId;
  }

  // Add product and version IDs to metadata for order creation
  sessionMetadata.items = JSON.stringify(
    items.map(item => ({
      productId: item.productId,
      versionId: item.versionId,
      quantity: item.quantity,
      price: item.price,
    }))
  );

  // Create the checkout session
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/checkout/cancel`,
    metadata: sessionMetadata,
    invoice_creation: {
      enabled: true,
    },
    automatic_tax: {
      enabled: false,
    },
    billing_address_collection: 'required',
    // For Indian regulations - collect shipping for physical products
    shipping_address_collection: items.some(() => 
      metadata.productType === 'PHYSICAL' || metadata.productType === 'BUNDLE'
    ) ? {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IE', 'JP', 'SG', 'HK', 'KR', 'TW'],
    } : undefined,
    // Add description for Indian export regulations
    payment_intent_data: {
      description: `Purchase from OpenGrove: ${items.map(item => item.name).join(', ')}`,
    },
  };

  // Use customer ID if available, otherwise use email
  if (customerId) {
    sessionConfig.customer = customerId;
  } else if (customerEmail) {
    sessionConfig.customer_email = customerEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return session;
}

/**
 * Create a payment intent for custom payment flows
 */
export async function createPaymentIntent(data: PaymentIntentData): Promise<Stripe.PaymentIntent> {
  const { amount, currency = 'usd', customerId, metadata = {} } = data;

  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    customer: customerId,
    metadata: {
      ...metadata,
      source: 'opengrove',
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

/**
 * Retrieve a checkout session
 */
export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer'],
  });
}

/**
 * Retrieve a payment intent
 */
export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Handle webhook event construction and verification
 */
export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Error constructing webhook event:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
    reason: reason || 'requested_by_customer',
  };

  if (amount) {
    refundParams.amount = Math.round(amount * 100); // Convert to cents
  }

  return await stripe.refunds.create(refundParams);
}

/**
 * Create a customer portal session
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Handle subscription creation (for future use)
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      ...metadata,
      source: 'opengrove',
    },
  });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription> {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

export default stripe;