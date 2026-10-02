const nodemailer = require('nodemailer');

// Create reusable transporter object
let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Use configured SMTP or create an ethereal test account for local testing
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS !== 'secret_pass') {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Generate test account automatically for local development if not configured
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email Service] Mock Ethereal SMTP initialized for: ${testAccount.user}`);
    } catch (err) {
      console.warn('[Email Service Warning] Could not connect to Ethereal, falling back to console mailer.');
      transporter = {
        sendMail: async (options) => {
          console.log('[Console Email Dispatch]:', {
            to: options.to,
            subject: options.subject,
            text: options.text,
          });
          return { messageId: 'console-mock-' + Date.now() };
        },
      };
    }
  }

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"IEM Admissions Team" <admissions@iem.edu.in>',
      to,
      subject,
      text,
      html,
    });

    console.log(`[Email Dispatched] To: ${to} | Subject: "${subject}" | ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email Send Error]: ${error.message}`);
    // Don't crash request if email sending fails
    return null;
  }
};

module.exports = { sendEmail };
