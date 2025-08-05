# Prodify AI Coach - Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `config.env` and update the values as needed
   - Make sure MongoDB is running on `MONGODB_URI=mongodb+srv://harshgupta4728:harshgupta4728@prodify.pafygw3.mongodb.net/?retryWrites=true&w=majority&appName=prodify
`
   - Update JWT_SECRET for production

4. Start the backend server:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:3001`

## Frontend Setup

1. Navigate to the project root:
   ```bash
   cd ..
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## Testing the Integration

1. Open your browser and go to `http://localhost:5173`
2. Try creating a new account using the signup form
3. Try logging in with existing credentials
4. The authentication should work seamlessly between frontend and backend

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `GET /api/health` - Health check

## Features

- ✅ User registration with profile links
- ✅ User login with JWT authentication
- ✅ Automatic token management
- ✅ Persistent login sessions
- ✅ Profile management
- ✅ Secure password hashing
- ✅ Email integration ready

## Troubleshooting

1. **Backend not starting**: Check if MongoDB is running
2. **Frontend can't connect**: Ensure backend is running on port 3001
3. **CORS errors**: Backend has CORS enabled for development
4. **Authentication issues**: Check JWT_SECRET in backend config

## Production Deployment

1. Update environment variables for production
2. Use a production MongoDB instance
3. Set up proper CORS configuration
4. Use HTTPS in production
5. Update API base URL in frontend config 