const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { normalizeEmail } = require('../lib/validate');

// Counters live in memory, which is fine for a single server instance. With several
// instances, switch to a shared store such as Redis.
const limiter = ({ message, ...options }) => rateLimit({
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: message },
  ...options,
});

const emailKey = (req) => normalizeEmail(req.body?.email);

// Every signed-in request, per user (applied by the auth middleware). Keyed by user
// rather than IP so a whole campus behind one IP address is not throttled together.
const userLimiter = limiter({
  windowMs: 5 * 60 * 1000,
  limit: 600,
  keyGenerator: (req) => `user:${req.user._id}`,
  message: 'Too many requests. Please wait a few minutes and try again.',
});

// OTP emails per address, so nobody can flood someone's inbox...
const otpPerEmail = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => `otp-email:${emailKey(req)}`,
  message: 'Too many codes requested for this email. Please try again in an hour.',
});

// ...and per IP, so one client can't use up the daily email quota across many addresses
const otpPerIp = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 50,
  keyGenerator: (req) => `otp-ip:${ipKeyGenerator(req.ip)}`,
  message: 'Too many codes requested. Please try again later.',
});

// Failed sign-in and OTP checks per account; successful requests are not counted
const loginPerEmail = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `login:${emailKey(req)}`,
  message: 'Too many failed attempts. Please wait 15 minutes and try again.',
});

// Planner reminder emails, per user
const emailPerUser = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  keyGenerator: (req) => `send-email:${req.user._id}`,
  message: 'Too many reminder emails. Please try again later.',
});

module.exports = { userLimiter, otpPerEmail, otpPerIp, loginPerEmail, emailPerUser };
