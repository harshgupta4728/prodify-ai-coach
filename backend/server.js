require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = '7330048cc03ef1ed6e501a74eb93728ea08c33bab53e0ac5cfdb1d1f2667d2d3';
  console.log('Warning: Using default JWT_SECRET. Please set JWT_SECRET in your .env file for production.');
}

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: 'https://prodify-ai-coach-frontend.onrender.com',
  credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://harshgupta4728:harshgupta4728@prodify.pafygw3.mongodb.net/?retryWrites=true&w=majority&appName=prodify', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'harshgupta4728@gmail.com',
    pass: process.env.EMAIL_PASS || 'uhso efjj zfaq zgfa'
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    
    console.log('=== BACKEND EMAIL DEBUG ===');
    console.log('📨 Received email request:', { to, subject, bodyLength: body?.length });
    console.log('📧 Email will be sent TO:', to);
    console.log('📤 Email will be sent FROM:', process.env.EMAIL_USER || 'harshgupta4728@gmail.com');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'harshgupta4728@gmail.com',
      to: to,
      subject: subject,
      html: body
    };

    console.log('📋 Mail options:', mailOptions);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Recipient:', to);
    console.log('=== END BACKEND EMAIL DEBUG ===');
    
    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {

  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'OK', 
    message: 'Prodify AI Coach Backend is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.post('/api/test', (req, res) => {
  console.log('Test endpoint called with body:', req.body);
  res.json({ 
    message: 'Test endpoint working',
    body: req.body
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 