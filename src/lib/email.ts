import "server-only";
import nodemailer from "nodemailer";

type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function getEmailSettings() {
  return {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || "465"),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      "support@archeryoutlet.net",
  };
}

export function emailIsConfigured() {
  const settings = getEmailSettings();

  return Boolean(settings.host && settings.port && settings.user && settings.pass);
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  const settings = getEmailSettings();

  if (!emailIsConfigured()) {
    console.log("Email not configured. Skipping email:", subject);
    return {
      skipped: true,
    };
  }

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465,
    auth: {
      user: settings.user,
      pass: settings.pass,
    },
  });

  await transporter.sendMail({
    from: `"Archery Outlet" <${settings.from}>`,
    to,
    subject,
    text,
    html,
  });

  return {
    skipped: false,
  };
}
