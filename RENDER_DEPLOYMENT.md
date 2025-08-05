# 🚀 Render Deployment Guide

## Step 1: Deploy Backend to Render

1. **Go to Render.com**
   - Visit [render.com](https://render.com)
   - Sign up/Login with your GitHub account

2. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository: `harshgupta4728/prodify-ai-coach`

3. **Configure Service**
   - **Name**: `prodify-ai-coach-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   Click "Environment" and add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/prodify-ai-coach?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL (e.g., `https://your-app-name.onrender.com`)

## Step 2: Set up MongoDB Atlas (Database)

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for free account

2. **Create Database**
   - Click "Build a Database"
   - Choose "FREE" tier
   - Create cluster

3. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` and `<dbname>`

4. **Update Environment Variables**
   - Go back to Render dashboard
   - Update `MONGODB_URI` with your connection string

## Step 3: Test Your Backend

Your backend will be available at: `https://your-app-name.onrender.com`

Test endpoints:
- `https://your-app-name.onrender.com/api/auth/test`
- `https://your-app-name.onrender.com/api/tasks`

## Step 4: Deploy Frontend (Optional)

For frontend, you can use:
- **Vercel**: [vercel.com](https://vercel.com)
- **Netlify**: [netlify.com](https://netlify.com)

## 🔗 Your Project Links

- **Backend API**: `https://your-app-name.onrender.com`
- **Frontend**: (After deploying to Vercel/Netlify)

## 📱 Access from Any Device

Once deployed, your project will be accessible from:
- ✅ Mobile phones
- ✅ Tablets  
- ✅ Laptops
- ✅ Desktop computers
- ✅ Any device with internet

## 🆘 Need Help?

If you face any issues:
1. Check Render deployment logs
2. Verify environment variables
3. Test database connection
4. Check CORS settings

Your project will be live and accessible from anywhere in the world! 🌍 