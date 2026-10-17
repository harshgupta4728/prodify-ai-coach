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
- **Brevo** HTTP API for OTP and reminder emails
- **Helmet** and **express-rate-limit** for security headers and rate limiting
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
- ✅ Brevo email API integration
- ✅ Automated email sending

### 🔧 Development Features
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Hot module replacement
- ✅ Environment-based configuration
- ✅ Modular component architecture

## 🚀 Quick Start

### Prerequisites
- Node.js 24 (LTS)
- npm
- MongoDB Atlas (or a local MongoDB)

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

   Copy the templates and fill them in. The copies are git-ignored; never commit them.
   ```bash
   cp .env.example .env.local            # frontend: VITE_API_BASE_URL only (public)
   cp backend/.env.example backend/.env  # backend: MONGODB_URI, JWT_SECRET, ...
   ```
   `backend/.env` needs at least `MONGODB_URI` and `JWT_SECRET`; the backend refuses to start without them.
   Without `BREVO_API_KEY`, OTP emails are printed in the backend terminal instead of sent, so sign-up still
   works locally. Add your account's email to `ADMIN_EMAILS` to see the admin panel. See [SETUP_GUIDE.md](SETUP_GUIDE.md).

5. **Start the development servers**

   **Terminal 1 - Backend** (runs on `http://localhost:10000`):
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:8080`

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
│   ├── middleware/        # Auth, rate limits, input sanitizing
│   ├── lib/               # Config (env vars), mailer, validation helpers
│   ├── seed/              # Content seed data
│   ├── scripts/           # Maintenance scripts
│   └── server.js          # Main server file
└── public/                # Public assets
```

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server (http://localhost:8080)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend** (in `backend/`):
- `npm run dev` - Start development server with nodemon (http://localhost:10000)
- `npm start` - Start production server
- `npm run smoke-test` - Check that the main features still work (uses the practice database; prints ✓/✗ per step)
- `npm run update-db-password` - After changing the database password in Atlas: updates `backend/.env` and prepares the values for Render
- `npm run seed:topics -- --yes`, `seed:problems`, `seed:todays-problems` - Reload content (deletes the existing content first)
- `npm run fix:duplicate-progress` - Find duplicate progress records (`-- --live` for the live database, `--yes` to remove them)

### Code Style
- ESLint configuration for code quality
- TypeScript for type safety
- CI (GitHub Actions) runs lint, type check, build, and a dependency audit on every push and pull request

## 🚀 Deployment

The frontend and backend are deployed on Render with MongoDB Atlas as the database.
See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for environment variables and the production checklist.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request


## 📞 Support

For support, create an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ for the developer community**
