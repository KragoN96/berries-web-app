let transporter = null;

async function sendViaSMTP({ to, subject, html }) {
  const nodemailer = require("nodemailer");

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  await transporter.sendMail({
    from: `"Berries Lost & Found" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

async function sendViaSendGrid({ to, subject, html }) {
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const from = process.env.SENDGRID_FROM || process.env.SMTP_USER;

  await sgMail.send({
    to,
    from,
    subject,
    html,
  });
}

async function sendEmail(payload) {
  // Prioritize SendGrid if configured
  if (process.env.SENDGRID_API_KEY) {
    return sendViaSendGrid(payload);
  }
  return sendViaSMTP(payload);
}

module.exports = { sendEmail };
