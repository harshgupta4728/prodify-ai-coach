# Prodify AI Coach

An AI-powered study companion for mastering Data Structures and Algorithms with personalized recommendations and progress tracking.

## 🚀 Live Demo

**URL**: https://lovable.dev/projects/b0baf44b-8394-4bb1-afe0-baa2d80a322e

## 📋 Project Overview

Prodify AI Coach is a full-stack web application designed to help students and developers master Data Structures and Algorithms through personalized learning experiences. The platform integrates with popular coding platforms like LeetCode and GeeksForGeeks to provide comprehensive progress tracking and study planning.

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router DOM** for routing
- **React Hook Form** with Zod validation
- **TanStack Query** for data fetching
- **Radix UI** for accessible components

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email notifications

## ✨ Features

- ✅ User authentication (signup/login)
- ✅ JWT token-based sessions
- ✅ User profile management
- ✅ LeetCode and GeeksForGeeks profile integration
- ✅ Modern, responsive UI
- ✅ Real-time form validation
- ✅ Toast notifications
- ✅ Persistent login sessions
- ✅ Task management and planning
- ✅ Progress tracking and analytics
- ✅ Email notifications

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/prodify-ai-coach.git
   cd prodify-ai-coach
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create `.env` files in both root and backend directories:
   
   **Root `.env`:**
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```
   
   **Backend `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/prodify-ai-coach
   JWT_SECRET=your_jwt_secret_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   PORT=3001
   ```

5. **Start the development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
prodify-ai-coach/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and API
│   └── assets/            # Static assets
├── backend/               # Backend source code
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   └── server.js          # Main server file
├── public/                # Public assets
└── docs/                  # Documentation
```

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- TypeScript for type safety

## 🚀 Deployment

### Using Lovable
Simply open [Lovable](https://lovable.dev/projects/b0baf44b-8394-4bb1-afe0-baa2d80a322e) and click on Share -> Publish.

### Manual Deployment
1. Build the frontend: `npm run build`
2. Deploy the backend to your preferred hosting service
3. Update environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@prodify-ai-coach.com or create an issue in the GitHub repository.

---

**Made with ❤️ for the developer community**
