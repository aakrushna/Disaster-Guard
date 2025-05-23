const Disaster = require('../models/Disaster');

// @desc    Create a new disaster report
// @route   POST /api/disasters
// @access  Private
const createDisaster = async (req, res) => {
  try {
    // Add user ID to request body
    req.body.reportedBy = req.user._id;
    
    // Ensure location has type field
    if (req.body.location && !req.body.location.type) {
      req.body.location.type = 'Point';
    }
    
    console.log('Creating disaster with data:', JSON.stringify(req.body));
    
    const disaster = await Disaster.create(req.body);
    
    res.status(201).json({
      success: true,
      data: disaster
    });
  } catch (error) {
    console.error('Create disaster error details:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all disasters
// @route   GET /api/disasters
// @access  Public
const getDisasters = async (req, res) => {
  try {
    // Build query
    let query = {};
    
    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by severity
    if (req.query.severity) {
      query.severity = req.query.severity;
    }
    
    // Get disasters
    const disasters = await Disaster.find(query)
      .populate('reportedBy', 'fullName email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: disasters.length,
      data: disasters
    });
  } catch (error) {
    console.error('Get disasters error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get disasters within radius
// @route   GET /api/disasters/radius/:lat/:lng/:distance
// @access  Public
const getDisastersInRadius = async (req, res) => {
  try {
    const { lat, lng, distance } = req.params;
    
    // Calculate radius using radians
    // Earth radius is 6,378 km
    const radius = distance / 6378;
    
    const disasters = await Disaster.find({
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] }
      }
    }).populate('reportedBy', 'fullName email');
    
    res.json({
      success: true,
      count: disasters.length,
      data: disasters
    });
  } catch (error) {
    console.error('Get disasters in radius error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single disaster
// @route   GET /api/disasters/:id
// @access  Public
const getDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id)
      .populate('reportedBy', 'fullName email');
    
    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Disaster not found' });
    }
    
    res.json({
      success: true,
      data: disaster
    });
  } catch (error) {
    console.error('Get disaster error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update disaster
// @route   PUT /api/disasters/:id
// @access  Private
const updateDisaster = async (req, res) => {
  try {
    let disaster = await Disaster.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Disaster not found' });
    }
    
    // Make sure user is the disaster reporter or an admin
    if (disaster.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this disaster' });
    }
    
    disaster = await Disaster.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.json({
      success: true,
      data: disaster
    });
  } catch (error) {
    console.error('Update disaster error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete disaster
// @route   DELETE /api/disasters/:id
// @access  Private
const deleteDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Disaster not found' });
    }
    
    // Make sure user is the disaster reporter or an admin
    if (disaster.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this disaster' });
    }
    
    await disaster.deleteOne();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete disaster error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get disaster statistics
// @route   GET /api/disasters/stats
// @access  Public
const getDisasterStats = async (req, res) => {
  try {
    const stats = await Disaster.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgSeverity: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ['$severity', 'low'] }, then: 1 },
                  { case: { $eq: ['$severity', 'medium'] }, then: 2 },
                  { case: { $eq: ['$severity', 'high'] }, then: 3 },
                  { case: { $eq: ['$severity', 'critical'] }, then: 4 }
                ],
                default: 0
              }
            }
          },
          totalCasualties: { $sum: '$casualties' },
          totalAffectedArea: { $sum: '$affectedArea' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get disaster stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createDisaster,
  getDisasters,
  getDisastersInRadius,
  getDisaster,
  updateDisaster,
  deleteDisaster,
  getDisasterStats
}; 