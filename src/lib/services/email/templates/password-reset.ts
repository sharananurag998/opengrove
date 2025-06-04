interface PasswordResetData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

export function getPasswordResetTemplate(data: PasswordResetData): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 32px; margin-bottom: 32px; text-align: center;">
          <div style="width: 64px; height: 64px; background-color: #ef4444; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">
            Reset Your Password
          </h1>
          <p style="color: #6b7280; margin: 0;">
            We received a request to reset your password
          </p>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
          <p style="color: #4b5563; margin: 0 0 16px 0;">
            Hi ${data.userName},
          </p>
          <p style="color: #4b5563; margin: 0 0 24px 0;">
            Someone requested a password reset for your OpenGrove account. If this was you, click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${data.resetUrl}" style="display: inline-block; background-color: #ef4444; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0; text-align: center;">
            Or copy and paste this link in your browser:
          </p>
          <p style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #6b7280; margin: 0;">
            ${data.resetUrl}
          </p>
        </div>

        <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Important:</strong> This password reset link will expire in ${data.expiresIn}. If you need a new link, please request another password reset.
          </p>
        </div>

        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
          <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
            Didn't request this?
          </h3>
          <p style="color: #4b5563; margin: 0 0 8px 0; font-size: 14px;">
            If you didn't request a password reset, you can safely ignore this email. Your password won't be changed unless you click the link above and create a new one.
          </p>
          <p style="color: #4b5563; margin: 0; font-size: 14px;">
            For security, we recommend:
          </p>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
            <li>Using a unique password for your OpenGrove account</li>
            <li>Enabling two-factor authentication when available</li>
            <li>Never sharing your password with anyone</li>
          </ul>
        </div>

        <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 32px;">
          <p style="margin: 0 0 8px 0;">
            Need help? Contact us at <a href="mailto:support@opengrove.com" style="color: #3b82f6; text-decoration: none;">support@opengrove.com</a>
          </p>
          <p style="margin: 0;">
            © ${new Date().getFullYear()} OpenGrove. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Reset Your Password

Hi ${data.userName},

Someone requested a password reset for your OpenGrove account. If this was you, click the link below to create a new password.

Reset your password: ${data.resetUrl}

Important: This password reset link will expire in ${data.expiresIn}. If you need a new link, please request another password reset.

Didn't request this?
If you didn't request a password reset, you can safely ignore this email. Your password won't be changed unless you click the link above and create a new one.

For security, we recommend:
- Using a unique password for your OpenGrove account
- Enabling two-factor authentication when available
- Never sharing your password with anyone

Need help? Contact us at support@opengrove.com

© ${new Date().getFullYear()} OpenGrove. All rights reserved.
  `.trim();

  return { html, text };
}