# Email Notification Setup Guide

## Step 1: Install Dependencies
```bash
npm install express cors nodemailer
```

## Step 2: Configure Gmail
1. Go to your Gmail account settings
2. Enable 2-factor authentication
3. Generate an "App Password":
   - Go to Security → App passwords
   - Select "Mail" and your device
   - Copy the generated password

## Step 3: Update server.js
Replace these lines in `server.js`:
```javascript
user: 'your-email@gmail.com', // Replace with your Gmail
pass: 'your-app-password' // Replace with your Gmail app password
```

## Step 4: Start the Backend Server
```bash
node server.js
```

## Step 5: Test the System
1. Start your React app: `npm run dev`
2. Go to the Planner section
3. Click "Test Notification" button
4. Check your email inbox

## Troubleshooting
- Make sure both frontend and backend are running
- Check console for error messages
- Verify Gmail app password is correct
- Ensure CORS is properly configured

## Features
- ✅ Real email notifications
- ✅ Beautiful HTML email templates
- ✅ Task deadline reminders
- ✅ Test notification system
- ✅ Browser notifications 