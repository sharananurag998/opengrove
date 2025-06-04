interface DownloadReadyData {
  customerName: string;
  orderNumber: string;
  products: Array<{
    name: string;
    coverImage?: string;
  }>;
  downloadUrl: string;
  expiresIn: string;
}

export function getDownloadReadyTemplate(data: DownloadReadyData): { html: string; text: string } {
  const productsHtml = data.products.map(product => `
    <div style="display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #e5e7eb;">
      ${product.coverImage ? `
        <img src="${product.coverImage}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; margin-right: 16px;">
      ` : ''}
      <div>
        <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
          ${product.name}
        </h3>
      </div>
    </div>
  `).join('');

  const productsText = data.products.map(product => `- ${product.name}`).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Downloads Are Ready</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 32px; margin-bottom: 32px; text-align: center;">
          <div style="width: 64px; height: 64px; background-color: #3b82f6; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
          <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">
            Your Downloads Are Ready!
          </h1>
          <p style="color: #6b7280; margin: 0;">
            Hi ${data.customerName}, your digital products are ready to download.
          </p>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
            Order #${data.orderNumber}
          </h2>
          <div style="border-radius: 6px; overflow: hidden; border: 1px solid #e5e7eb;">
            ${productsHtml}
          </div>
        </div>

        <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Important:</strong> Your download links will expire in ${data.expiresIn}. Each file can be downloaded up to 5 times.
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${data.downloadUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Download Your Files
          </a>
        </div>

        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
            Download Tips:
          </h3>
          <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
            <li>Save your files to a secure location on your device</li>
            <li>Make a backup copy for safekeeping</li>
            <li>If you have issues downloading, try a different browser</li>
            <li>Contact support if your links expire - we can refresh them</li>
          </ul>
        </div>

        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">
            Thank you for your purchase!
          </p>
          <p style="margin: 0;">
            © ${new Date().getFullYear()} OpenGrove. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Your Downloads Are Ready!

Hi ${data.customerName}, your digital products are ready to download.

Order #${data.orderNumber}

Products:
${productsText}

Important: Your download links will expire in ${data.expiresIn}. Each file can be downloaded up to 5 times.

Download your files: ${data.downloadUrl}

Download Tips:
- Save your files to a secure location on your device
- Make a backup copy for safekeeping
- If you have issues downloading, try a different browser
- Contact support if your links expire - we can refresh them

Thank you for your purchase!

© ${new Date().getFullYear()} OpenGrove. All rights reserved.
  `.trim();

  return { html, text };
}