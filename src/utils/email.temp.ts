// ─── Reset Password ───────────────────────────────────────────
export const resetPasswordTemplate = ({
  username,
  resetUrl,
}: {
  username: string;
  resetUrl: string;
}) => ({
  subject: "Reset your password — MyApp",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 32px; border-radius: 8px;">
      <h2 style="color: #1a1a2e;">Reset your password</h2>
      <p>Hi ${username},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p style="color: #888; font-size: 13px;">Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
      <p style="color: #aaa; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `,
  text: `Reset your password\n\nHi ${username},\n\n${resetUrl}\n\nExpires in 1 hour.`,
});

// ─── Verification OTP ─────────────────────────────────────────
export const verificationOtpTemplate = ({
  username,
  otp,
  expiresInMinutes = 10,
}: {
  username: string;
  otp: string;
  expiresInMinutes?: number;
}) => ({
  subject: "Your verification code — MyApp",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 32px; border-radius: 8px;">
      <h2 style="color: #1a1a2e;">Your verification code</h2>
      <p>Hi ${username},</p>
      <div style="text-align: center; margin: 32px 0;">
        <div style="display: inline-block; background: #1a1a2e; color: #fff; font-size: 36px; font-weight: bold; letter-spacing: 12px; padding: 20px 36px; border-radius: 8px;">
          ${otp}
        </div>
      </div>
      <p style="text-align: center; color: #888; font-size: 13px;">Expires in <strong>${expiresInMinutes} minutes</strong>.</p>
      <p style="color: #aaa; font-size: 12px;">If you didn't request this, ignore this email.</p>
    </div>
  `,
  text: `Your code: ${otp}\n\nExpires in ${expiresInMinutes} minutes.`,
});