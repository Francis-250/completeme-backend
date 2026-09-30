import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function requireEnv(...keys: string[]) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length)
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
}

function getTransport() {
  requireEnv("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD");
  const port = Number(process.env.SMTP_PORT);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const address = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER;
    if (!address)
      throw new Error("SMTP_FROM_EMAIL or SMTP_USER must be configured.");

    await getTransport().sendMail({
      from: { name: process.env.SMTP_FROM_NAME, address },
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error("SMTP email delivery failed:", error);
    return false;
  }
}

export async function sendEmailOrThrow(options: EmailOptions) {
  if (!(await sendEmail(options))) {
    throw new Error("Email delivery failed. Check the SMTP configuration.");
  }
}
