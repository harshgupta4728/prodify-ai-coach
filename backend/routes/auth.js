const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
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

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, leetcodeProfile, geeksforgeeksProfile } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required.' 
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email.' 
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      leetcodeProfile: leetcodeProfile || '',
      geeksforgeeksProfile: geeksforgeeksProfile || ''
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
      error: 'Server error during signup. Please try again.' 
    });
  }
});

// Signin
router.post('/signin', async (req, res) => {
  try {
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
    res.status(500).json({ 
      error: 'Server error during signin. Please try again.' 
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
      portfolio,
      leetcodeProfile, 
      geeksforgeeksProfile 
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
    if (leetcodeProfile !== undefined) user.leetcodeProfile = leetcodeProfile;
    if (geeksforgeeksProfile !== undefined) user.geeksforgeeksProfile = geeksforgeeksProfile;

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
router.post('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      // Extract filename from the stored path
      const filename = user.profilePicture.split('/').pop();
      if (filename) {
        const oldPicturePath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
    }

    // Update user's profile picture
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    
    // Delete uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(__dirname, '..', req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ error: 'Server error during profile picture upload.' });
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