// Script to create an admin user
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createAdminUser() {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists:', {
        email: adminExists.email,
        fullName: adminExists.fullName,
        role: adminExists.role
      });
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      fullName: 'Admin User',
      email: 'admin@disasterguard.org',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });

    console.log('Admin user created successfully:', {
      _id: adminUser._id,
      fullName: adminUser.fullName,
      email: adminUser.email,
      role: adminUser.role
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Run the function to create an admin user
createAdminUser(); 