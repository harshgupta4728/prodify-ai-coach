const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const transporter = require('../lib/mailer');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  }
  if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
router.post('/send-otp', async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ error: 'Email and purpose are required.' });
    }

    if (!['signup', 'signin'].includes(purpose)) {
      return res.status(400).json({ error: 'Invalid purpose. Must be signup or signin.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (purpose === 'signup' && existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    if (purpose === 'signin' && !existingUser) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    // Delete any existing OTPs for this email+purpose
    await Otp.deleteMany({ email: email.toLowerCase(), purpose });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save hashed OTP
    await new Otp({ email: email.toLowerCase(), otp, purpose }).save();

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'harshgupta4728@gmail.com',
      to: email,
      subject: purpose === 'signup' ? 'Prodify - Verify Your Email' : 'Prodify - Sign In OTP',
      html: getOtpEmailHtml(otp, purpose),
    });

    res.json({ message: 'OTP sent successfully to ' + email });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// Signin with OTP
router.post('/signin-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), purpose: 'signin' });
    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });
    }

    const isValid = await otpRecord.compareOtp(otp);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Delete used OTP
    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'signin' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Signin OTP error:', error);
    res.status(500).json({ error: 'Server error during OTP signin. Please try again.' });
  }
});

// Signup (with OTP verification)
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    const { name, email, password, otp } = req.body;

    // Validate required fields
    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        error: 'Name, email, password, and OTP are required.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email address.'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email.'
      });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), purpose: 'signup' });
    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });
    }

    const isOtpValid = await otpRecord.compareOtp(otp);
    if (!isOtpValid) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Delete used OTP
    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'signup' });

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
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

    res.status(500).json({ 
      error: 'Server error during signup. Please try again.',
      details: error.message 
    });
  }
});

// Signin
router.post('/signin', async (req, res) => {
  try {
    console.log('Signin request received:', req.body);
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required.' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid email or password.' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        error: 'Invalid email or password.' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    res.status(500).json({ 
      error: 'Server error during signin. Please try again.',
      details: error.message 
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      name, 
      bio, 
      university,
      major,
      graduationYear,
      location,
      portfolio
    } = req.body;

    console.log('Profile update request:', req.body);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (university !== undefined) user.university = university;
    if (major !== undefined) user.major = major;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (location !== undefined) user.location = location;
    if (portfolio !== undefined) user.portfolio = portfolio;

    console.log('Saving user with data:', user.toObject());

    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser._id);

    res.json({
      message: 'Profile updated successfully',
      user: savedUser.toJSON()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ') 
      });
    }
    res.status(500).json({ error: 'Server error during profile update: ' + error.message });
  }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Import Task model
    const Task = require('../models/Task');

    // Delete all tasks associated with the user
    await Task.deleteMany({ userId: req.user._id });

    // Delete the user
    await User.findByIdAndDelete(req.user._id);

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error during account deletion.' });
  }
});

// Upload profile picture
router.post('/profile-picture', auth, upload.single('profilePicture'), handleMulterError, async (req, res) => {
  try {
    console.log('Profile picture upload initiated for user:', req.user._id);
    console.log('Request file:', req.file);

    if (!req.file) {
      console.log('No file uploaded in request');
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found:', req.user._id);
      return res.status(404).json({ error: 'User not found.' });
    }

    console.log('User found:', user._id);
    console.log('Uploaded file info:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      console.log('Deleting old profile picture:', user.profilePicture);
      try {
        // Extract filename from the stored path
        const filename = user.profilePicture.split('/').pop();
        if (filename) {
          const oldPicturePath = path.join(__dirname, '..', 'uploads', filename);
          if (fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
            console.log('Old profile picture deleted successfully');
          }
        }
      } catch (deleteError) {
        console.log('Error deleting old profile picture (non-critical):', deleteError.message);
      }
    }

    // Update user's profile picture
    user.profilePicture = `/uploads/${req.file.filename}`;
    console.log('Saving user with new profile picture path:', user.profilePicture);
    
    await user.save();
    console.log('User saved successfully');

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    console.error('Error stack:', error.stack);
    
    // Delete uploaded file if there was an error
    if (req.file) {
      try {
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Cleaned up uploaded file after error');
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError.message);
      }
    }
    
    res.status(500).json({ 
      error: 'Server error during profile picture upload.',
      details: error.message 
    });
  }
});

// Remove profile picture
router.delete('/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    console.log('Removing profile picture for user:', user._id);
    console.log('Current profile picture path:', user.profilePicture);

    // Delete profile picture file if it exists
    if (user.profilePicture) {
      // Extract filename from the stored path (e.g., "/uploads/profile-123.jpg" -> "profile-123.jpg")
      const filename = user.profilePicture.split('/').pop();
      console.log('Extracted filename:', filename);
      
      if (filename) {
        const picturePath = path.join(__dirname, '..', 'uploads', filename);
        console.log('Full picture path:', picturePath);
        
        if (fs.existsSync(picturePath)) {
          console.log('File exists, deleting...');
          fs.unlinkSync(picturePath);
          console.log('File deleted successfully');
        } else {
          console.log('File does not exist at path:', picturePath);
        }
      }
    } else {
      console.log('No profile picture to remove');
    }

    // Remove profile picture from user
    user.profilePicture = '';
    await user.save();
    console.log('Profile picture removed from database');

    res.json({
      message: 'Profile picture removed successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Profile picture removal error:', error);
    res.status(500).json({ 
      error: 'Server error during profile picture removal.',
      details: error.message 
    });
  }
});

module.exports = router; 