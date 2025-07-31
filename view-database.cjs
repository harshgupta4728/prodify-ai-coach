// Script to view users in MongoDB Atlas database
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://harshgupta4728:<db_password>@prodify.pafygw3.mongodb.net/?retryWrites=true&w=majority&appName=prodify', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema (same as backend)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  leetcodeProfile: { type: String, trim: true, default: '' },
  geeksforgeeksProfile: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function viewUsers() {
  try {
    console.log('\n🔍 Viewing all users in database...\n');
    
    const users = await User.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('📭 No users found in database');
    } else {
      console.log(`📊 Found ${users.length} user(s):\n`);
      
      users.forEach((user, index) => {
        console.log(`👤 User ${index + 1}:`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   LeetCode Profile: ${user.leetcodeProfile || 'Not set'}`);
        console.log(`   GeeksForGeeks Profile: ${user.geeksforgeeksProfile || 'Not set'}`);
        console.log(`   Created: ${user.createdAt.toLocaleString()}`);
        console.log(`   Last Login: ${user.lastLogin.toLocaleString()}`);
        console.log('   ──────────────────────────────────────');
      });
    }
    
    // Test authentication
    console.log('\n🧪 Testing authentication...\n');
    
    // Test with the user we created earlier
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      console.log('✅ Found test user in database');
      
      // Test password comparison
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare('password123', testUser.password);
      console.log(`🔐 Password validation: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
    } else {
      console.log('❌ Test user not found');
    }
    
  } catch (error) {
    console.error('❌ Error viewing users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
viewUsers(); 