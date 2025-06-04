import { sendEmail } from './resend';
import { getOrderConfirmationTemplate } from './templates/order-confirmation';
import { getDownloadReadyTemplate } from './templates/download-ready';
import { getWelcomeTemplate } from './templates/welcome';
import { getPasswordResetTemplate } from './templates/password-reset';

export * from './resend';

interface OrderData {
  id: string;
  orderNumber: string;
  totalAmount: any;
  discountAmount?: any;
  currency: string;
  createdAt: Date;
  customer?: {
    user: {
      name: string | null;
      email: string;
    };
  } | null;
  customerEmail?: string | null;
  items: Array<{
    product: {
      name: string;
    };
    quantity: number;
    price: any;
  }>;
}

export async function sendOrderConfirmationEmail(order: OrderData) {
  const customerEmail = order.customer?.user?.email || order.customerEmail;
  const customerName = order.customer?.user?.name || 'Customer';

  if (!customerEmail) {
    console.error('No customer email found for order:', order.id);
    return { success: false, error: 'No customer email' };
  }

  const formatPrice = (amount: any, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(parseFloat(amount.toString()) / 100);
  };

  const subtotal = order.items.reduce((sum, item) => {
    return sum + parseFloat(item.price.toString());
  }, 0);

  const { html, text } = getOrderConfirmationTemplate({
    customerName,
    orderNumber: order.orderNumber,
    orderDate: new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(order.createdAt),
    items: order.items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: formatPrice(item.price, order.currency),
    })),
    subtotal: formatPrice(subtotal, order.currency),
    discount: order.discountAmount ? formatPrice(order.discountAmount, order.currency) : undefined,
    total: formatPrice(order.totalAmount, order.currency),
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/customer/orders/${order.id}`,
  });

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation #${order.orderNumber} - OpenGrove`,
    html,
    text,
  });
}

export async function sendDownloadReadyEmail(
  order: OrderData,
  products: Array<{ name: string; coverImage?: string | null }>
) {
  const customerEmail = order.customer?.user?.email || order.customerEmail;
  const customerName = order.customer?.user?.name || 'Customer';

  if (!customerEmail) {
    console.error('No customer email found for order:', order.id);
    return { success: false, error: 'No customer email' };
  }

  const { html, text } = getDownloadReadyTemplate({
    customerName,
    orderNumber: order.orderNumber,
    products: products.map(p => ({
      name: p.name,
      coverImage: p.coverImage || undefined,
    })),
    downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/customer/downloads`,
    expiresIn: '30 days',
  });

  return sendEmail({
    to: customerEmail,
    subject: `Your downloads are ready! - OpenGrove`,
    html,
    text,
  });
}

export async function sendWelcomeEmail(user: { name: string | null; email: string }) {
  const { html, text } = getWelcomeTemplate({
    userName: user.name || 'there',
    userEmail: user.email,
    loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin`,
  });

  return sendEmail({
    to: user.email,
    subject: 'Welcome to OpenGrove! 🎉',
    html,
    text,
  });
}

export async function sendPasswordResetEmail(
  user: { name: string | null; email: string },
  resetToken: string
) {
  const { html, text } = getPasswordResetTemplate({
    userName: user.name || 'there',
    resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`,
    expiresIn: '1 hour',
  });

  return sendEmail({
    to: user.email,
    subject: 'Reset your password - OpenGrove',
    html,
    text,
  });
}