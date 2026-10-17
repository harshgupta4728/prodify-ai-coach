// Must load first: validates environment variables and exits if a secret is missing
const config = require('./lib/config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const auth = require('./middleware/auth');
const sanitize = require('./middleware/sanitize');
const { emailPerUser } = require('./middleware/rateLimiters');
const { escapeHtml } = require('./lib/validate');
const transporter = require('./lib/mailer');
const Progress = require('./models/Progress');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const progressRoutes = require('./routes/progress');
const topicRoutes = require('./routes/topics');
const codeRoutes = require('./routes/code');

const app = express();

// Render's proxies sit in front of the app; this decides what req.ip (used for rate limits) is
app.set('trust proxy', config.trustProxy);

// Middleware
app.use(helmet({
  // The frontend is on another origin and shows profile pictures from /uploads
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({ origin: config.clientOrigins }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(sanitize);

// Profile pictures. Note: Render's disk is wiped on every deploy and restart, so these
// need object storage (Cloudinary, S3, R2) before launch.
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir, { index: false, dotfiles: 'deny' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/code', codeRoutes);

// Planner reminder emails. Always sent to the signed-in user's own address, so the
// endpoint can't be used to send mail to anyone else.
app.post('/api/send-email', auth, emailPerUser, async (req, res) => {
  const { subject, body } = req.body;

  if (!subject || !body || typeof subject !== 'string' || typeof body !== 'string' ||
      subject.length > 200 || body.length > 5000) {
    return res.status(400).json({
      success: false,
      error: 'Subject (up to 200 characters) and body (up to 5000 characters) are required.'
    });
  }

  try {
    const info = await transporter.sendMail({
      to: req.user.email,
      subject,
      html: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${escapeHtml(body)}</div>`
    });

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Email sending error:', error.message);
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
    // The caller's own IP as the server sees it, and the proxy chain it came through,
    // for checking TRUST_PROXY
    clientIp: req.ip,
    forwardedFor: req.headers['x-forwarded-for'] || null,
    timestamp: new Date().toISOString()
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Last-resort error handler: full details go to the logs, never to the client
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid request data.' });
  }
  console.error(`${req.method} ${req.originalUrl} failed:`, err);
  res.status(500).json({ error: 'Server error.' });
});

const start = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    await Progress.ensureUniqueUserIndex();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/api/health`);
  });

  // Render sends SIGTERM before replacing an instance: finish open requests, then exit
  const shutdown = () => {
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

start();
