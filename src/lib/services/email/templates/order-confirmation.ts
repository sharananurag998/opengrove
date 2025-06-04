interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  subtotal: string;
  discount?: string;
  total: string;
  orderUrl: string;
}

export function getOrderConfirmationTemplate(data: OrderConfirmationData): { html: string; text: string } {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.name}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${item.price}
      </td>
    </tr>
  `).join('');

  const itemsText = data.items.map(item => 
    `- ${item.name} (x${item.quantity}): ${item.price}`
  ).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 32px; margin-bottom: 32px;">
          <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">
            Order Confirmed!
          </h1>
          <p style="color: #6b7280; margin: 0;">
            Thank you for your purchase, ${data.customerName}
          </p>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
            Order Details
          </h2>
          <p style="margin: 0 0 8px 0;">
            <strong>Order Number:</strong> #${data.orderNumber}
          </p>
          <p style="margin: 0;">
            <strong>Order Date:</strong> ${data.orderDate}
          </p>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
            Order Items
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: left; font-weight: 600;">Item</th>
                <th style="padding: 12px; text-align: center; font-weight: 600;">Quantity</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">Subtotal:</td>
                <td style="padding: 12px; text-align: right;">${data.subtotal}</td>
              </tr>
              ${data.discount ? `
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">Discount:</td>
                <td style="padding: 12px; text-align: right; color: #059669;">-${data.discount}</td>
              </tr>
              ` : ''}
              <tr style="border-top: 2px solid #e5e7eb;">
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: 700; font-size: 18px;">Total:</td>
                <td style="padding: 12px; text-align: right; font-weight: 700; font-size: 18px;">${data.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${data.orderUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            View Order Details
          </a>
        </div>

        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">
            If you have any questions about your order, please contact our support team.
          </p>
          <p style="margin: 0;">
            © ${new Date().getFullYear()} OpenGrove. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Order Confirmed!

Thank you for your purchase, ${data.customerName}

Order Details:
Order Number: #${data.orderNumber}
Order Date: ${data.orderDate}

Order Items:
${itemsText}

Subtotal: ${data.subtotal}
${data.discount ? `Discount: -${data.discount}\n` : ''}Total: ${data.total}

View your order details: ${data.orderUrl}

If you have any questions about your order, please contact our support team.

© ${new Date().getFullYear()} OpenGrove. All rights reserved.
  `.trim();

  return { html, text };
}