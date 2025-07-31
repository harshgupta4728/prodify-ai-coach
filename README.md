# Prodify AI Coach

An AI-powered study companion for mastering Data Structures and Algorithms with personalized recommendations and progress tracking.

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
- **Lucide React** for modern icons
- **Sonner** for toast notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email notifications
- **CORS** for cross-origin requests

## ✨ Features

### 🔐 Authentication & User Management
- ✅ Secure user registration and login system
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Persistent login sessions
- ✅ User profile management with comprehensive details

### 📊 Dashboard & Analytics
- ✅ Personalized dashboard overview
- ✅ Progress tracking and statistics
- ✅ Practice history visualization
- ✅ Streak tracking for consistent learning
- ✅ Real-time data updates

### 🎯 Task Management
- ✅ Create, edit, and manage study tasks
- ✅ Priority-based task categorization (low, medium, high, urgent)
- ✅ Deadline tracking with notifications
- ✅ Time tracking for study sessions
- ✅ Difficulty levels (easy, medium, hard)
- ✅ Task tagging system
- ✅ Completion status tracking

### 🔗 Platform Integration
- ✅ LeetCode profile integration
- ✅ GeeksForGeeks profile integration
- ✅ Profile editors for both platforms
- ✅ Direct links to coding profiles

### 🎨 Modern UI/UX
- ✅ Responsive design for all devices
- ✅ Dark/light theme support
- ✅ Toast notifications for user feedback
- ✅ Loading states and error handling
- ✅ Accessible components with ARIA support
- ✅ Modern card-based layout
- ✅ Interactive sidebar navigation

### 📧 Communication
- ✅ Email notifications system
- ✅ Task reminders via email
- ✅ Gmail SMTP integration
- ✅ Automated email sending

### 🔧 Development Features
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Hot module replacement
- ✅ Environment-based configuration
- ✅ Modular component architecture

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
│   │   ├── auth/          # Authentication components
│   │   ├── dashboard/     # Dashboard components
│   │   └── ui/            # Reusable UI components
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
- TypeScript for type safety
- Consistent code formatting

## 🚀 Deployment

### Manual Deployment
1. Build the frontend: `npm run build`
2. Deploy the backend to your preferred hosting service (Heroku, Railway, etc.)
3. Update environment variables for production
4. Set up MongoDB Atlas for database

### Deployment Options
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean
- **Database**: MongoDB Atlas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support, create an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ for the developer community**
