interface WelcomeData {
  userName: string;
  userEmail: string;
  loginUrl: string;
}

export function getWelcomeTemplate(data: WelcomeData): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to OpenGrove</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 48px 32px; margin-bottom: 32px; text-align: center; color: white;">
          <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 16px 0;">
            Welcome to OpenGrove!
          </h1>
          <p style="font-size: 18px; margin: 0; opacity: 0.9;">
            Your journey as a digital creator starts here
          </p>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
          <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">
            Hi ${data.userName}! 👋
          </h2>
          <p style="color: #4b5563; margin: 0 0 16px 0;">
            Thank you for joining OpenGrove! We're excited to have you as part of our creator community.
          </p>
          <p style="color: #4b5563; margin: 0;">
            Your account has been created with the email: <strong>${data.userEmail}</strong>
          </p>
        </div>

        <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
            🚀 Get Started
          </h3>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            <li style="margin-bottom: 12px;">
              <strong>Browse Products:</strong> Discover amazing digital products from talented creators
            </li>
            <li style="margin-bottom: 12px;">
              <strong>Become a Creator:</strong> Share your own digital products with the world
            </li>
            <li style="margin-bottom: 12px;">
              <strong>Join the Community:</strong> Connect with other creators and customers
            </li>
            <li>
              <strong>Secure Purchases:</strong> Buy with confidence using our secure payment system
            </li>
          </ul>
        </div>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${data.loginUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Go to Your Dashboard
          </a>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
            Need Help?
          </h3>
          <p style="color: #4b5563; margin: 0 0 8px 0; font-size: 14px;">
            Our support team is here to help you get the most out of OpenGrove.
          </p>
          <p style="color: #4b5563; margin: 0; font-size: 14px;">
            • Check out our <a href="#" style="color: #3b82f6; text-decoration: none;">Help Center</a><br>
            • Email us at <a href="mailto:support@opengrove.com" style="color: #3b82f6; text-decoration: none;">support@opengrove.com</a>
          </p>
        </div>

        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">
            Follow us on social media for updates and creator spotlights!
          </p>
          <p style="margin: 0;">
            © ${new Date().getFullYear()} OpenGrove. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Welcome to OpenGrove!

Hi ${data.userName}! 👋

Thank you for joining OpenGrove! We're excited to have you as part of our creator community.

Your account has been created with the email: ${data.userEmail}

🚀 Get Started:
- Browse Products: Discover amazing digital products from talented creators
- Become a Creator: Share your own digital products with the world
- Join the Community: Connect with other creators and customers
- Secure Purchases: Buy with confidence using our secure payment system

Go to your dashboard: ${data.loginUrl}

Need Help?
Our support team is here to help you get the most out of OpenGrove.
• Check out our Help Center
• Email us at support@opengrove.com

Follow us on social media for updates and creator spotlights!

© ${new Date().getFullYear()} OpenGrove. All rights reserved.
  `.trim();

  return { html, text };
}