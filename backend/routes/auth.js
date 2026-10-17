const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../lib/config');
const User = require('../models/User');
const Otp = require('../models/Otp');
const Task = require('../models/Task');
const Progress = require('../models/Progress');
const Problem = require('../models/Problem');
const transporter = require('../lib/mailer');
const auth = require('../middleware/auth');
const { otpPerEmail, otpPerIp, loginPerEmail } = require('../middleware/rateLimiters');
const { normalizeEmail, isEmail, isNonEmptyString, isHttpUrl, pick } = require('../lib/validate');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');

// Raster images only (SVG can carry scripts). The stored extension comes from the
// checked type, never from the client's filename, so nobody can upload "x.html".
const IMAGE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: function (req, file, cb) {
    cb(null, `profile-${crypto.randomUUID()}${IMAGE_EXTENSIONS[file.mimetype]}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (IMAGE_EXTENSIONS[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP or GIF images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Deletes a file from uploads/ given its stored "/uploads/name.jpg" path or bare name
const removeUploadedFile = (storedPath) => {
  if (!storedPath) return;
  fs.promises.unlink(path.join(uploadDir, path.basename(storedPath))).catch(() => {});
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { algorithm: 'HS256', expiresIn: '7d' });
};

// User data sent to the client, plus whether this account may manage content
const toPublicUser = (user) => ({ ...user.toJSON(), isAdmin: auth.isAdminEmail(user.email) });

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const OTP_MAX_ATTEMPTS = 5;
const OTP_TTL_MS = 5 * 60 * 1000;

// Checks a submitted OTP. Each check uses up one attempt atomically, so even parallel
// guesses can't get past OTP_MAX_ATTEMPTS. Returns an error message, or null if valid.
const verifyOtp = async (email, purpose, otp) => {
  if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    return 'Please enter the 6-digit OTP.';
  }

  const otpRecord = await Otp.findOneAndUpdate(
    {
      email,
      purpose,
      attempts: { $lt: OTP_MAX_ATTEMPTS },
      // The TTL index only sweeps about once a minute, so check the age here too
      createdAt: { $gt: new Date(Date.now() - OTP_TTL_MS) }
    },
    { $inc: { attempts: 1 } },
    { new: true }
  );
  if (!otpRecord) {
    return 'OTP expired or not found. Please request a new one.';
  }

  if (!(await otpRecord.compareOtp(otp))) {
    const attemptsLeft = OTP_MAX_ATTEMPTS - otpRecord.attempts;
    return attemptsLeft > 0
      ? `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.`
      : 'Too many incorrect attempts. Please request a new OTP.';
  }

  // Delete used OTP
  await Otp.deleteMany({ email, purpose });
  return null;
};

// Generate OTP HTML email
const getOtpEmailHtml = (otp, purpose) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Prodify AI Coach</h1>
    </div>
    <div style="padding: 32px 24px; text-align: center;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">
        ${purpose === 'signup' ? 'Verify your email to create your account' : 'Use this code to sign in'}
      </p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1f2937;">${otp}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin: 0;">This code expires in <strong>5 minutes</strong></p>
      <p style="color: #9ca3af; font-size: 13px; margin: 16px 0 0;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>
`;

// Send OTP
router.post('/send-otp', otpPerIp, otpPerEmail, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ error: 'Email and purpose are required.' });
    }

    if (!['signup', 'signin'].includes(purpose)) {
      return res.status(400).json({ error: 'Invalid purpose. Must be signup or signin.' });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const existingUser = await User.exists({ email });

    if (purpose === 'signup' && existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    if (purpose === 'signin' && !existingUser) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    // Delete any existing OTPs for this email+purpose
    await Otp.deleteMany({ email, purpose });

    // 6-digit OTP from a cryptographically secure source
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Save hashed OTP
    await new Otp({ email, otp, purpose }).save();

    await transporter.sendMail({
      to: email,
      subject: purpose === 'signup' ? 'Prodify - Verify Your Email' : 'Prodify - Sign In OTP',
      html: getOtpEmailHtml(otp, purpose),
    });

    res.json({ message: 'OTP sent successfully to ' + email });
  } catch (error) {
    console.error('Send OTP error:', error.message);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// Signin with OTP
router.post('/signin-otp', loginPerEmail, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const otpError = await verifyOtp(email, 'signin', otp);
    if (otpError) {
      return res.status(400).json({ error: otpError });
    }

    const user = await User.findOneAndUpdate({ email }, { lastLogin: new Date() }, { new: true });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    res.json({
      message: 'Login successful',
      user: toPublicUser(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Signin OTP error:', error.message);
    res.status(500).json({ error: 'Server error during OTP signin. Please try again.' });
  }
});

// Signup (with OTP verification)
router.post('/signup', loginPerEmail, async (req, res) => {
  try {
    const { name, password, otp } = req.body;
    const email = normalizeEmail(req.body.email);

    // Validate required fields
    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        error: 'Name, email, password, and OTP are required.'
      });
    }

    if (!isNonEmptyString(name, 100)) {
      return res.status(400).json({ error: 'Please enter a name of at most 100 characters.' });
    }

    if (!isEmail(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email address.'
      });
    }

    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      return res.status(400).json({
        error: `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters long.`
      });
    }

    // Check if user already exists
    if (await User.exists({ email })) {
      return res.status(400).json({
        error: 'User already exists with this email.'
      });
    }

    const otpError = await verifyOtp(email, 'signup', otp);
    if (otpError) {
      return res.status(400).json({ error: otpError });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email,
      password,
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: toPublicUser(user),
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Signup error:', error.message);

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'User already exists with this email.'
      });
    }

    res.status(500).json({ error: 'Server error during signup. Please try again.' });
  }
});

// Signin
router.post('/signin', loginPerEmail, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    // Validate required fields
    if (!email || !password || typeof password !== 'string') {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    // Same message for unknown email and wrong password
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({
        error: 'Invalid email or password.'
      });
    }

    // Update last login (updateOne skips re-validating the whole document)
    user.lastLogin = new Date();
    await User.updateOne({ _id: user._id }, { lastLogin: user.lastLogin });

    res.json({
      message: 'Login successful',
      user: toPublicUser(user),
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Signin error:', error.message);
    res.status(500).json({ error: 'Server error during signin. Please try again.' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: toPublicUser(req.user)
  });
});

// Editable profile fields and their maximum lengths
const PROFILE_FIELDS = {
  name: 100,
  bio: 1000,
  university: 200,
  major: 200,
  graduationYear: 20,
  location: 200,
  portfolio: 500
};

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = pick(req.body, Object.keys(PROFILE_FIELDS));

    const invalidField = Object.keys(updates).find(
      (field) => typeof updates[field] !== 'string' || updates[field].length > PROFILE_FIELDS[field]
    );
    if (invalidField) {
      return res.status(400).json({ error: `${invalidField} must be text of at most ${PROFILE_FIELDS[invalidField]} characters.` });
    }
    if (updates.name !== undefined && !updates.name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty.' });
    }
    if (updates.portfolio && !isHttpUrl(updates.portfolio)) {
      return res.status(400).json({ error: 'Portfolio must be a full link starting with http:// or https://' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.set(updates);
    await user.save({ validateModifiedOnly: true });

    res.json({
      message: 'Profile updated successfully',
      user: toPublicUser(user)
    });

  } catch (error) {
    console.error('Update profile error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    res.status(500).json({ error: 'Server error during profile update.' });
  }
});

// Delete account and everything stored for it
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Task.deleteMany({ userId }),
      Progress.deleteMany({ userId }),
      Problem.deleteMany({ userId }),
      Otp.deleteMany({ email: req.user.email })
    ]);
    await User.findByIdAndDelete(userId);
    removeUploadedFile(req.user.profilePicture);

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error.message);
    res.status(500).json({ error: 'Server error during account deletion.' });
  }
});

// Upload profile picture
router.post('/profile-picture', auth, upload.single('profilePicture'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: `/uploads/${req.file.filename}` },
      { new: true }
    );
    if (!user) {
      removeUploadedFile(req.file.filename);
      return res.status(404).json({ error: 'User not found.' });
    }

    // Delete old profile picture if it exists
    removeUploadedFile(req.user.profilePicture);

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture,
      user: toPublicUser(user)
    });

  } catch (error) {
    console.error('Profile picture upload error:', error.message);
    if (req.file) {
      removeUploadedFile(req.file.filename);
    }
    res.status(500).json({ error: 'Server error during profile picture upload.' });
  }
});

// Remove profile picture
router.delete('/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { profilePicture: '' }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    removeUploadedFile(req.user.profilePicture);

    res.json({
      message: 'Profile picture removed successfully',
      user: toPublicUser(user)
    });

  } catch (error) {
    console.error('Profile picture removal error:', error.message);
    res.status(500).json({ error: 'Server error during profile picture removal.' });
  }
});

module.exports = router;
