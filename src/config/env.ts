import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  BREVO_API_KEY: z.string().min(1, "BREVO_API_KEY is required"),
  BREVO_SENDER_EMAIL: z
    .string()
    .email("BREVO_SENDER_EMAIL must be a valid email"),
  BREVO_SENDER_NAME: z.string().min(1, "BREVO_SENDER_NAME is required"),

  ALLOWED_ORIGINS: z.string().min(1, "ALLOWED_ORIGINS is required"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  allowedOrigins: parsed.data.ALLOWED_ORIGINS.split(",").map((origin) =>
    origin.trim(),
  ),
  isProduction: parsed.data.NODE_ENV === "production",
};
