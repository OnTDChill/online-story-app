const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

console.log('Environment variables:');
console.log('JWT_SECRET exists:', env.JWT_SECRET ? 'Yes' : 'No');
console.log('JWT_SECRET value (first 3 chars):', env.JWT_SECRET ? env.JWT_SECRET.substring(0, 3) + '...' : 'N/A');

try {
  const payload = { user: { id: '123456', role: 'Admin' } };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
  console.log('JWT token generation successful!');
  console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
  
  // Verify the token
  const decoded = jwt.verify(token, env.JWT_SECRET);
  console.log('JWT token verification successful!');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.error('JWT Error:', error);
}
