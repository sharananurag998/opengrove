import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/services/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, type = 'test' } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Email recipient is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'test':
        result = await sendEmail({
          to,
          subject: 'Test Email from OpenGrove',
          html: `
            <h1>Test Email</h1>
            <p>This is a test email from OpenGrove to verify the email configuration.</p>
            <p>If you received this email, your email setup is working correctly!</p>
            <p>Sent at: ${new Date().toISOString()}</p>
          `,
          text: `Test Email\n\nThis is a test email from OpenGrove to verify the email configuration.\n\nIf you received this email, your email setup is working correctly!\n\nSent at: ${new Date().toISOString()}`,
        });
        break;

      case 'order':
        // Test order confirmation email with sample data
        const { sendOrderConfirmationEmail } = await import('@/lib/services/email');
        const sampleOrder = {
          id: 'test-order-123',
          orderNumber: 'TEST-2024-001',
          totalAmount: 9900,
          currency: 'USD',
          createdAt: new Date(),
          customerEmail: to,
          items: [
            {
              product: { name: 'Sample Digital Product' },
              quantity: 1,
              price: 9900,
            },
          ],
        };
        result = await sendOrderConfirmationEmail(sampleOrder as any);
        break;

      case 'welcome':
        // Test welcome email
        const { sendWelcomeEmail } = await import('@/lib/services/email');
        result = await sendWelcomeEmail({ name: 'Test User', email: to });
        break;

      case 'download':
        // Test download ready email
        const { sendDownloadReadyEmail } = await import('@/lib/services/email');
        const sampleOrderForDownload = {
          id: 'test-order-456',
          orderNumber: 'TEST-2024-002',
          totalAmount: 4900,
          currency: 'USD',
          createdAt: new Date(),
          customerEmail: to,
          items: [],
        };
        const sampleProducts = [
          { name: 'Digital Asset Pack', coverImage: null },
          { name: 'Premium Template', coverImage: null },
        ];
        result = await sendDownloadReadyEmail(sampleOrderForDownload as any, sampleProducts);
        break;

      case 'password':
        // Test password reset email
        const { sendPasswordResetEmail } = await import('@/lib/services/email');
        result = await sendPasswordResetEmail(
          { name: 'Test User', email: to },
          'test-reset-token-123456'
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json(
        { message: 'Email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}