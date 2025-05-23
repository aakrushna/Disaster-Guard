const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, getCurrentUser, updateProfile } = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = req.user.getSignedJwtToken();
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// Admin user creation (for development only, remove in production)
router.post('/create-admin', async (req, res) => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin user already exists' 
      });
    }

    // Create admin user
    const adminUser = await User.create({
      fullName: 'Admin User',
      email: 'admin@disasterguard.org',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        _id: adminUser._id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to update admin email (for development only, remove in production)
router.post('/update-admin-email', async (req, res) => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin user not found' 
      });
    }

    // Update admin email
    adminUser.email = 'admin@disasterguard.org';
    await adminUser.save();

    res.status(200).json({
      success: true,
      message: 'Admin email updated successfully',
      user: {
        _id: adminUser._id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Update admin email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Diagnostic route to check admin user (for development only, remove in production)
router.get('/check-admin', async (req, res) => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin user not found' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: adminUser._id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateProfile);

module.exports = router; 