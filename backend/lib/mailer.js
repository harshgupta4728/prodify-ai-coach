const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'harshgupta4728@gmail.com',
    pass: process.env.EMAIL_PASS || 'pfjh ueik nuao koty'
  }
});

module.exports = transporter;
