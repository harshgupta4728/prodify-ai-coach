# MongoDB Setup Guide for Windows

## Option 1: MongoDB Community Server (Local Installation)

### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0 or latest
   - Platform: Windows
   - Package: msi
3. Click "Download"

### Step 2: Install MongoDB
1. Run the downloaded .msi file
2. Follow the installation wizard
3. Choose "Complete" installation
4. Install MongoDB Compass (GUI tool) when prompted
5. Complete the installation

### Step 3: Start MongoDB Service
1. Open Command Prompt as Administrator
2. Run these commands:
   ```cmd
   net start MongoDB
   ```

### Step 4: Verify Installation
1. Open Command Prompt
2. Run: `mongosh`
3. You should see the MongoDB shell

## Option 2: MongoDB Atlas (Cloud - Recommended for Beginners)

### Step 1: Create Atlas Account
1. Go to: https://www.mongodb.com/atlas
2. Click "Try Free"
3. Create an account

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider
4. Click "Create"

### Step 3: Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password
4. Select "Read and write to any database"
5. Click "Add User"

### Step 4: Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

## Update Backend Configuration

### For Local MongoDB:
Update `backend/config.env`:
```
MONGODB_URI=mongodb://localhost:27017/prodify-ai-coach
```

### For MongoDB Atlas:
Update `backend/config.env`:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/prodify-ai-coach?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, and `<cluster>` with your actual values.

## Test the Setup

After setting up MongoDB, run:
```bash
node test-backend.js
```

This will test if your backend can connect to MongoDB and create users. 