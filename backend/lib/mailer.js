const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'a9ca43001@smtp-brevo.com',
    pass: process.env.SMTP_PASS || 'Gx6THErSZ18DJOmK'
  }
});

module.exports = transporter;
