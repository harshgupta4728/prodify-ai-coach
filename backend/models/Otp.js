const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['signup', 'signin'],
    required: true,
  },
  // Wrong guesses so far; the code stops working after 5
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Auto-delete after 5 minutes
  },
});

otpSchema.index({ email: 1, purpose: 1 });

// Hash OTP before saving
otpSchema.pre('save', async function (next) {
  if (!this.isModified('otp')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare OTP
otpSchema.methods.compareOtp = async function (candidateOtp) {
  return bcrypt.compare(candidateOtp, this.otp);
};

module.exports = mongoose.model('Otp', otpSchema);
