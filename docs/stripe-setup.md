# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment processing for OpenGrove.

## Prerequisites

1. A Stripe account (create one at https://stripe.com)
2. Access to your Stripe Dashboard

## Setup Steps

### 1. Get Your API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your test keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

### 3. Set Up Webhooks

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Add your webhook endpoint URL:
   - For local development: Use a tool like [ngrok](https://ngrok.com) or [Stripe CLI](https://stripe.com/docs/stripe-cli)
   - For production: `https://yourdomain.com/api/webhooks/stripe`
4. Select the following events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.subscription.created` (for future subscription support)
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** and add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 4. Local Development with Stripe CLI

For local webhook testing, install and use the Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI will display your webhook signing secret
# Copy it to your .env.local file
```

### 5. Test Your Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Create a test checkout session:
   ```bash
   # Use the test card number: 4242 4242 4242 4242
   # Any future expiry date and any CVC
   ```

3. Monitor webhook events in the Stripe Dashboard or CLI

## Integration Features

### Checkout API (`/api/checkout`)

- Validates cart items
- Applies discounts and affiliate tracking
- Creates Stripe checkout sessions
- Returns checkout URL for redirect

### Webhook Handler (`/api/webhooks/stripe`)

Handles the following events:
- **checkout.session.completed**: Creates orders, generates license keys, and download links
- **payment_intent.succeeded**: Updates payment status
- **payment_intent.payment_failed**: Marks orders as failed
- **charge.refunded**: Processes refunds

### Client-Side Hook (`useStripeCheckout`)

```typescript
import { useStripeCheckout } from '@/hooks/use-stripe-checkout';

function CheckoutButton() {
  const { createCheckout, isLoading } = useStripeCheckout();
  
  const handleCheckout = async () => {
    await createCheckout([
      {
        productId: 'prod_123',
        quantity: 1,
        price: 29.99,
        name: 'Digital Product',
      }
    ]);
  };
  
  return (
    <button onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Checkout'}
    </button>
  );
}
```

## Security Considerations

1. **Always validate webhook signatures** to ensure requests are from Stripe
2. **Use HTTPS in production** for all API endpoints
3. **Store sensitive keys securely** and never commit them to version control
4. **Implement idempotency** to prevent duplicate order creation
5. **Log all payment events** for audit trails

## Troubleshooting

### Common Issues

1. **Webhook signature verification fails**
   - Ensure you're using the raw request body
   - Check that the webhook secret is correct
   - Verify the endpoint URL matches exactly

2. **Checkout session creation fails**
   - Verify your API keys are correct
   - Check that products are published and have valid prices
   - Ensure customer email is provided

3. **Orders not being created**
   - Check webhook logs in Stripe Dashboard
   - Verify database connections
   - Check for duplicate order prevention logic

## Going to Production

1. Switch to live API keys (remove `test_` prefix)
2. Update webhook endpoints to production URLs
3. Enable Stripe's fraud prevention tools
4. Set up proper error monitoring and logging
5. Configure tax settings if applicable
6. Test the complete flow with real payments

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Best Practices](https://stripe.com/docs/development/best-practices)