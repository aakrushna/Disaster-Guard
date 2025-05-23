// Script to update an existing admin user's email
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

async function updateAdminUser() {
  try {
    // Find admin user with the old email
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('Admin user not found');
      process.exit(0);
    }

    console.log('Found admin user:', {
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: adminUser.role
    });

    // Update admin user email
    adminUser.email = 'admin@disasterguard.org';
    await adminUser.save();

    console.log('Admin user updated successfully:', {
      _id: adminUser._id,
      fullName: adminUser.fullName,
      email: adminUser.email,
      role: adminUser.role
    });
    
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Run the function to update the admin user
updateAdminUser(); 