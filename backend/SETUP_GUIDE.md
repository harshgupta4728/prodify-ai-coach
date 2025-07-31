# 🚀 Backend Setup Guide - Prodify AI Coach

## 📋 **What's New**

### **✅ Complete Authentication System**
- User signup with LeetCode/GeeksForGeeks profiles
- User signin with JWT tokens
- Protected routes for user-specific data
- Profile management

### **✅ User-Specific Task Management**
- Each user has their own tasks
- Tasks stored in MongoDB database
- Real-time task synchronization
- Email notifications per user

### **✅ Database Integration**
- MongoDB for data persistence
- User and Task models
- Secure password hashing
- JWT token authentication

## 🛠️ **Setup Instructions**

### **Step 1: Install Dependencies**
```bash
cd backend
npm install
```

### **Step 2: Install MongoDB**
1. **Download MongoDB Community Server** from [mongodb.com](https://www.mongodb.com/try/download/community)
2. **Install MongoDB** on your system
3. **Start MongoDB service**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

### **Step 3: Configure Environment**
1. **Rename config.env to .env**:
   ```bash
   mv config.env .env
   ```

2. **Update .env file** with your settings:
   ```env
   # Server Configuration
   PORT=3001
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/prodify-ai-coach
   
   # JWT Configuration (CHANGE THIS!)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Email Configuration
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Environment
   NODE_ENV=development
   ```

### **Step 4: Start the Backend**
```bash
npm run dev
```

## 🔐 **API Endpoints**

### **Authentication Routes**
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### **Task Routes (All Protected)**
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Mark task complete
- `PATCH /api/tasks/:id/incomplete` - Mark task incomplete

### **Email Routes**
- `POST /api/send-email` - Send email notifications

## 📊 **Database Schema**

### **User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  leetcodeProfile: String,
  geeksforgeeksProfile: String,
  createdAt: Date,
  lastLogin: Date
}
```

### **Task Model**
```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  description: String,
  category: String,
  priority: String,
  deadline: Date,
  completed: Boolean,
  completedAt: Date,
  timeSpent: Number,
  difficulty: String,
  tags: [String],
  notes: String,
  notificationSent: Boolean
}
```

## 🔧 **Frontend Integration**

### **Update Frontend API Calls**
You'll need to update your frontend to use the new API endpoints:

1. **Authentication**:
   ```javascript
   // Signup
   const response = await fetch('http://localhost:3001/api/auth/signup', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ name, email, password, leetcodeProfile, geeksforgeeksProfile })
   });
   
   // Signin
   const response = await fetch('http://localhost:3001/api/auth/signin', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   ```

2. **Tasks (with authentication)**:
   ```javascript
   // Get tasks
   const response = await fetch('http://localhost:3001/api/tasks', {
     headers: { 
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   });
   ```

## 🧪 **Testing the Backend**

### **Health Check**
```bash
curl http://localhost:3001/api/health
```

### **Test Signup**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "leetcodeProfile": "https://leetcode.com/testuser",
    "geeksforgeeksProfile": "https://auth.geeksforgeeks.org/user/testuser"
  }'
```

### **Test Signin**
```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🔒 **Security Features**

### **✅ Implemented**
- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- User-specific data isolation
- Input validation
- Error handling

### **🔧 Best Practices**
- Change JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting
- Add input sanitization
- Set up proper CORS

## 🚨 **Troubleshooting**

### **MongoDB Issues**
- Check if MongoDB is running
- Verify connection string
- Check database permissions

### **Email Issues**
- Verify Gmail app password
- Check email credentials in .env
- Test email sending endpoint

### **Authentication Issues**
- Check JWT_SECRET is set
- Verify token format
- Check token expiration

## 📈 **Next Steps**

1. **Update Frontend** to use new API endpoints
2. **Add Token Management** in frontend
3. **Implement Protected Routes** in frontend
4. **Add Error Handling** for authentication
5. **Test User-Specific Features**

## 🎉 **Success Indicators**

- ✅ MongoDB connection established
- ✅ Server running on port 3001
- ✅ Health check endpoint working
- ✅ User signup/signin working
- ✅ Task CRUD operations working
- ✅ Email notifications working 