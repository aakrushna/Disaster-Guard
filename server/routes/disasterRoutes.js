const express = require('express');
const router = express.Router();
const {
  createDisaster,
  getDisasters,
  getDisastersInRadius,
  getDisaster,
  updateDisaster,
  deleteDisaster,
  getDisasterStats
} = require('../controllers/disasterController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getDisasters);
router.get('/stats', getDisasterStats);
router.get('/radius/:lat/:lng/:distance', getDisastersInRadius);
router.get('/:id', getDisaster);

// Protected routes
router.post('/', protect, createDisaster);
router.put('/:id', protect, updateDisaster);

// Admin routes
router.delete('/:id', protect, admin, deleteDisaster);

module.exports = router; 