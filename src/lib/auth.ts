import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import {
  admin,
  emailOTP,
  lastLoginMethod,
  openAPI,
  phoneNumber,
  twoFactor,
  username,
} from "better-auth/plugins";
import { sendEmail } from "./brevo";
import {
  resetPasswordTemplate,
  verificationOtpTemplate,
} from "../utils/email.temp";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 3,
    maxPasswordLength: 100,

    sendResetPassword: async ({ user, url }) => {
      const template = resetPasswordTemplate({
        username: user.name ?? user.email,
        resetUrl: url,
      });
      await sendEmail({ to: user.email, ...template });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    phoneNumber(),
    username(),
    admin({
      defaultRole: "customer"
    }),
    lastLoginMethod(),
    emailOTP({
      otpLength: 6,
      expiresIn: 20 * 60,
      sendVerificationOnSignUp: true,
      allowedAttempts: 3,

      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await sendEmail({
            to: email,
            ...verificationOtpTemplate({
              username: email,
              otp,
              expiresInMinutes: 5,
            }),
            subject: "Your sign-in code — StrokeCheck",
          });
        } else if (type === "email-verification") {
          await sendEmail({
            to: email,
            ...verificationOtpTemplate({
              username: email,
              otp,
              expiresInMinutes: 5,
            }),
            subject: "Verify your email — StrokeCheck",
          });
        } else if (type === "forget-password") {
          await sendEmail({
            to: email,
            ...verificationOtpTemplate({
              username: email,
              otp,
              expiresInMinutes: 5,
            }),
            subject: "Reset your password — StrokeCheck",
          });
        }
      },
    }),
    twoFactor(),
    openAPI(),
  ],
});

export type Session = typeof auth.$Infer.Session;
