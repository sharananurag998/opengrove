import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/services/stripe';

/**
 * Test endpoint to verify Stripe integration
 * GET /api/stripe/test
 */
export async function GET(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'Stripe secret key not configured',
        configured: false,
      }, { status: 500 });
    }

    // Try to retrieve account information
    const account = await stripe.accounts.retrieve();

    return NextResponse.json({
      status: 'success',
      message: 'Stripe integration is working',
      configured: true,
      account: {
        id: account.id,
        type: account.type,
        country: account.country,
        created: account.created ? new Date(account.created * 1000).toISOString() : null,
        testMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'),
      },
    });
  } catch (error) {
    console.error('Stripe test error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      configured: !!process.env.STRIPE_SECRET_KEY,
    }, { status: 500 });
  }
}