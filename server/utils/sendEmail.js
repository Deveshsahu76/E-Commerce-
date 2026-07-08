const nodemailer = require("nodemailer");

let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_PASS are required for sending emails.");
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user,
      pass,
    },
    family: 4,
    requireTLS: port === 587,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
    tls: {
      servername: host,
      minVersion: "TLSv1.2",
    },
  });

  return cachedTransporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  const from = process.env.SMTP_FROM || `ShopSphere <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return true;
};

module.exports = sendEmail;