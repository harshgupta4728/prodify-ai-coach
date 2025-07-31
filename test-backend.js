// Simple test script to verify backend API
const API_BASE_URL = 'http://localhost:3001/api';

async function testBackend() {
  console.log('🧪 Testing Backend API...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test signup
    console.log('\n2. Testing user signup...');
    const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        leetcodeProfile: 'https://leetcode.com/testuser',
        geeksforgeeksProfile: 'https://auth.geeksforgeeks.org/user/testuser'
      }),
    });
    
    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      console.log('✅ Signup successful:', signupData.message);
      
      // Test login
      console.log('\n3. Testing user login...');
      const loginResponse = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful:', loginData.message);
        
        // Test get current user
        console.log('\n4. Testing get current user...');
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('✅ Get user successful:', userData.user.name);
        } else {
          console.log('❌ Get user failed:', await userResponse.text());
        }
      } else {
        console.log('❌ Login failed:', await loginResponse.text());
      }
    } else {
      console.log('❌ Signup failed:', await signupResponse.text());
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBackend(); 