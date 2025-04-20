const mongoose = require('mongoose');
const User = require('../src/models/User');
const { mongoUri } = require('../src/config/env');

const checkAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    
    if (adminUser) {
      console.log('Admin user found:');
      console.log('Username:', adminUser.username);
      console.log('Email:', adminUser.email);
      console.log('Role:', adminUser.role);
      console.log('Password hash length:', adminUser.password.length);
      console.log('Created at:', adminUser.createdAt);
    } else {
      console.log('Admin user not found');
    }

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error checking admin user:', error);
    process.exit(1);
  }
};

checkAdminUser();
