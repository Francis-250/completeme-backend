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
import { sendEmail } from "./mailer";
import {
  resetPasswordOtpTemplate,
  resetPasswordTemplate,
  verificationOtpTemplate,
} from "../utils/email.temp";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: Array.from(
    new Set([
      ...(process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((o) =>
            o.trim().replace(/\/$/, ""),
          )
        : []),
      ...(process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL.trim().replace(/\/$/, "")]
        : []),
      ...(process.env.NODE_ENV !== "production"
        ? [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            ...(process.env.PORT
              ? [
                  `http://localhost:${process.env.PORT}`,
                  `http://127.0.0.1:${process.env.PORT}`,
                ]
              : []),
          ]
        : []),
    ]),
  ),
  advanced: {
    useSecureCookies:
      process.env.NODE_ENV === "production" ||
      Boolean(process.env.BETTER_AUTH_URL?.startsWith("https://")),
    defaultCookieAttributes:
      process.env.NODE_ENV === "production" ||
      Boolean(process.env.BETTER_AUTH_URL?.startsWith("https://"))
        ? {
            sameSite: "none",
            secure: true,
            partitioned: true,
          }
        : {
            sameSite: "lax",
            secure: false,
          },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
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
      defaultRole: "CUSTOMER",
      adminRoles: ["ADMIN"],
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
            subject: "Your sign-in code — completeme",
          });
        } else if (type === "email-verification") {
          await sendEmail({
            to: email,
            ...verificationOtpTemplate({
              username: email,
              otp,
              expiresInMinutes: 5,
            }),
            subject: "Verify your email — completeme",
          });
        } else if (type === "forget-password") {
          await sendEmail({
            to: email,
            ...resetPasswordOtpTemplate({
              username: email,
              otp,
              expiresInMinutes: 20,
            }),
            subject: "Reset your password code — completeme",
          });
        }
      },
    }),
    twoFactor(),
    openAPI(),
  ],
});

export type Session = typeof auth.$Infer.Session;
