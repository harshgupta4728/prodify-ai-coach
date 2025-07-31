# 📧 Email Notification System Guide

## 🎯 **How It Works**

The email notification system automatically sends reminders when tasks are due. Here's how it works:

### **Automatic Notifications**
- ✅ **Checks every minute** for tasks that are due soon
- ✅ **Sends email reminders** 1 hour before deadline (configurable)
- ✅ **Prevents duplicate notifications** (only sends once per task)
- ✅ **Beautiful HTML emails** with task details

### **Notification Settings**
- **Reminder Time**: How many minutes before deadline to send notification
- **Email Address**: Where to send notifications
- **Status Indicator**: Green dot shows when notifications are active

## 🧪 **Testing the System**

### **Create a Task with Deadline**
1. Go to Planner section
2. Click **"Add Task"** button
3. Fill in task details and set deadline to 1 hour from now
4. Save the task
5. Wait for the notification (check your email inbox)

### **How to Test**
1. **Set deadline to 1 hour from now** - You'll get an email reminder
2. **Set deadline to 30 minutes from now** - You'll get an email reminder
3. **Set deadline to 2 hours from now** - You'll get an email reminder

## ⚙️ **Configuration**

### **Reminder Time Options**
- **30 minutes**: Quick reminder
- **1 hour**: Default setting
- **2 hours**: Early warning
- **1 day**: Day-before reminder

### **Email Settings**
- **From**: harshgupta4728@gmail.com
- **To**: Your login email
- **Subject**: 🚨 Task Deadline Reminder
- **Content**: Beautiful HTML with task details

## 🔍 **Debugging**

### **Check Console Logs**
Open browser console to see:
- Number of pending tasks
- Time until deadline for each task
- Notification status
- Email sending results

### **Common Issues**
1. **No notifications**: Check if backend server is running
2. **Email not received**: Check spam folder
3. **Wrong timing**: Verify deadline is set correctly
4. **Duplicate emails**: System prevents this automatically

## 📋 **Features**

### **✅ What's Working**
- Real email notifications via Gmail
- Beautiful HTML email templates
- Automatic deadline checking
- Duplicate prevention
- Browser notifications backup
- Configurable reminder times

### **🎨 Email Template Features**
- Professional design
- Task details (title, description, category, priority)
- Deadline information
- Time remaining
- Branded footer

## 🚀 **Quick Start**

1. **Start Backend Server:**
   ```bash
   cd backend
   node server.js
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test the System:**
   - Create a task with deadline 1 hour from now
   - Wait for the email notification
   - Check your inbox

4. **Monitor Console:**
   - Watch for notification logs
   - Check email sending status
   - Verify timing calculations

## 📧 **Email Examples**

### **Task Reminder**
- Subject: 🚨 Task Deadline Reminder: [Task Title]
- Content: Task details, deadline, time remaining

## 🔧 **Troubleshooting**

### **Backend Issues**
- Check if server is running on port 3001
- Verify Gmail app password is correct
- Check console for error messages

### **Frontend Issues**
- Ensure both servers are running
- Check browser console for errors
- Verify email address is set

### **Email Issues**
- Check spam/junk folder
- Verify email address is correct
- Check Gmail app password

## 🎉 **Success Indicators**

- ✅ Green dot on notification bell
- ✅ Console logs showing task checks
- ✅ Email received in inbox
- ✅ No duplicate notifications
- ✅ Proper timing of reminders

## 📝 **How to Use**

1. **Add a Task:**
   - Click "Add Task" button
   - Fill in title, description, category, priority
   - Set deadline (when you want to be reminded)
   - Click "Add Task"

2. **Get Notified:**
   - System automatically checks every minute
   - Sends email 1 hour before deadline (or your chosen time)
   - You'll receive a beautiful HTML email

3. **Complete Tasks:**
   - Mark tasks as complete when done
   - Track your progress and time spent
   - View completion analytics 