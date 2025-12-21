// sendEmail.js - Production-ready email sending with proper error handling

// ✅ Require modules at the TOP to avoid runtime errors
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");

let transporter = null;

/**
 * Send email via SMTP (fallback method)
 */
async function sendViaSMTP({ to, subject, html }) {
  try {
    if (!transporter) {
      console.log("[SMTP] Creating transporter...");
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });
    }

    console.log(`[SMTP] Sending email to ${to}...`);
    const info = await transporter.sendMail({
      from: `"Berries Lost & Found" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("[SMTP] ✓ Email sent successfully:", info.messageId);
    return { success: true, method: "SMTP", messageId: info.messageId };
  } catch (error) {
    console.error("[SMTP] ✗ Failed to send email:", error.message);
    throw new Error(`SMTP Error: ${error.message}`);
  }
}

/**
 * Send email via SendGrid (preferred method)
 */
async function sendViaSendGrid({ to, subject, html }) {
  try {
    // Validate environment variables
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY not configured");
    }

    if (!process.env.SENDGRID_FROM) {
      throw new Error("SENDGRID_FROM not configured");
    }

    console.log("[SendGrid] Configuring API key...");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const from = process.env.SENDGRID_FROM;
    console.log(`[SendGrid] Sending email to ${to} from ${from}...`);

    // SendGrid send with timeout
    const sendPromise = sgMail.send({
      to,
      from,
      subject,
      html,
    });

    // Add 15-second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SendGrid timeout after 15s")), 15000)
    );

    const response = await Promise.race([sendPromise, timeoutPromise]);

    console.log("[SendGrid] ✓ Email sent successfully");
    console.log("[SendGrid] Response status:", response[0]?.statusCode);
    
    return { 
      success: true, 
      method: "SendGrid", 
      statusCode: response[0]?.statusCode 
    };
  } catch (error) {
    // Enhanced error logging for SendGrid
    console.error("[SendGrid] ✗ Failed to send email");
    console.error("[SendGrid] Error message:", error.message);
    
    if (error.response) {
      console.error("[SendGrid] Status code:", error.response.statusCode);
      console.error("[SendGrid] Response body:", JSON.stringify(error.response.body));
    }

    throw new Error(`SendGrid Error: ${error.message}`);
  }
}

/**
 * Main email sending function with automatic fallback
 */
async function sendEmail(payload) {
  const { to, subject, html } = payload;

  // Validate payload
  if (!to || !subject || !html) {
    throw new Error("Missing required email fields: to, subject, or html");
  }

  console.log(`\n[Email] Attempting to send email to: ${to}`);
  console.log(`[Email] Subject: ${subject}`);

  // Try SendGrid first if configured
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
    try {
      console.log("[Email] Using SendGrid...");
      return await sendViaSendGrid(payload);
    } catch (error) {
      console.error("[Email] SendGrid failed:", error.message);
      console.error("[Email] Checking for SMTP fallback...");
      
      // Fallback to SMTP if configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log("[Email] Falling back to SMTP...");
        return await sendViaSMTP(payload);
      }
      
      // No fallback available
      console.error("[Email] No fallback available, throwing error");
      throw error;
    }
  }

  // No SendGrid, try SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log("[Email] Using SMTP...");
    return await sendViaSMTP(payload);
  }

  // No email service configured
  throw new Error("No email service configured (neither SendGrid nor SMTP)");
}

module.exports = { sendEmail };