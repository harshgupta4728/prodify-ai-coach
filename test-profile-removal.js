const fs = require('fs');
const path = require('path');

// Test the file path logic
function testPathHandling() {
  console.log('Testing path handling...');
  
  // Simulate stored profile picture path
  const storedPath = '/uploads/profile-1234567890-123456789.jpg';
  console.log('Stored path:', storedPath);
  
  // Extract filename
  const filename = storedPath.split('/').pop();
  console.log('Extracted filename:', filename);
  
  // Build full path
  const fullPath = path.join(__dirname, 'backend', 'uploads', filename);
  console.log('Full path:', fullPath);
  
  // Check if uploads directory exists
  const uploadsDir = path.join(__dirname, 'backend', 'uploads');
  console.log('Uploads directory exists:', fs.existsSync(uploadsDir));
  
  // List files in uploads directory
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    console.log('Files in uploads directory:', files);
  }
}

testPathHandling(); 