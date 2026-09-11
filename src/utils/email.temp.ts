export const resetPasswordTemplate = ({
  username,
  resetUrl,
}: {
  username: string;
  resetUrl: string;
}) => ({
  subject: "Reset your password — StrokeCheck",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 32px; border-radius: 8px;">
      <h2 style="color: #1a1a2e; margin-bottom: 8px;">Reset your password</h2>
      <p style="color: #444;">Hi ${username},</p>
      <p style="color: #444;">We received a request to reset your password. Click the button below to choose a new one.</p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}"
           style="background-color: #4f46e5; color: white; padding: 14px 28px;
                  border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Reset Password
        </a>
      </div>

      <p style="color: #888; font-size: 13px;">Or copy this link into your browser:</p>
      <p style="color: #4f46e5; font-size: 13px; word-break: break-all;">${resetUrl}</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 12px;">
        This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
      </p>
      <p style="color: #aaa; font-size: 12px;">— The StrokeCheck Team</p>
    </div>
  `,
  text: `Reset your password\n\nHi ${username},\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
});

export const forgotPasswordTemplate = ({
  username,
  resetUrl,
  expiresInMinutes = 60,
}: {
  username: string;
  resetUrl: string;
  expiresInMinutes?: number;
}) => ({
  subject: "Forgot your password? — StrokeCheck",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 32px; border-radius: 8px;">
      <h2 style="color: #1a1a2e;">Forgot your password?</h2>
      <p style="color: #444;">Hi ${username},</p>
      <p style="color: #444;">
        No worries — it happens! Click the button below and we'll help you set a new password.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}"
           style="background-color: #0ea5e9; color: white; padding: 14px 28px;
                  border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Set New Password
        </a>
      </div>

      <p style="color: #888; font-size: 13px;">Or paste this link in your browser:</p>
      <p style="color: #0ea5e9; font-size: 13px; word-break: break-all;">${resetUrl}</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 12px;">
        This link expires in <strong>${expiresInMinutes} minutes</strong>.
        If you didn't request this, your account is safe — just ignore this email.
      </p>
      <p style="color: #aaa; font-size: 12px;">— The StrokeCheck Team</p>
    </div>
  `,
  text: `Forgot your password?\n\nHi ${username},\n\nSet a new password here:\n${resetUrl}\n\nExpires in ${expiresInMinutes} minutes.`,
});

export const verificationOtpTemplate = ({
  username,
  otp,
  expiresInMinutes = 10,
}: {
  username: string;
  otp: string;
  expiresInMinutes?: number;
}) => ({
  subject: "Your verification code — StrokeCheck",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 32px; border-radius: 8px;">
      <h2 style="color: #1a1a2e;">Verify your email</h2>
      <p style="color: #444;">Hi ${username},</p>
      <p style="color: #444;">Use the code below to verify your email address:</p>

      <div style="text-align: center; margin: 32px 0;">
        <div style="display: inline-block; background: #1a1a2e; color: #fff;
                    font-size: 36px; font-weight: bold; letter-spacing: 12px;
                    padding: 20px 36px; border-radius: 8px;">
          ${otp}
        </div>
      </div>

      <p style="color: #888; font-size: 13px; text-align: center;">
        This code expires in <strong>${expiresInMinutes} minutes</strong>.
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 12px;">
        If you didn't create a StrokeCheck account, you can safely ignore this email.
      </p>
      <p style="color: #aaa; font-size: 12px;">— The StrokeCheck Team</p>
    </div>
  `,
  text: `Verify your email\n\nHi ${username},\n\nYour verification code is: ${otp}\n\nExpires in ${expiresInMinutes} minutes.`,
});
