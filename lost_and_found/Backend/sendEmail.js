const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html }) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY missing");
  }

  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject,
    html,
  };

  await sgMail.send(msg);
}

module.exports = { sendEmail };
