const mongoose = require('mongoose');

const DisasterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Disaster type is required'],
    enum: ['earthquake', 'flood', 'fire', 'hurricane', 'tornado', 'tsunami', 'landslide', 'other'],
    trim: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required']
    },
    address: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'monitoring'],
    default: 'active'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String
  }],
  affectedArea: {
    type: Number, // in square kilometers
    default: 0
  },
  casualties: {
    type: Number,
    default: 0
  },
  evacuationRequired: {
    type: Boolean,
    default: false
  },
  evacuationZone: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON Polygon format
      default: []
    }
  },
  reliefCenters: [{
    name: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number]
      }
    },
    capacity: Number,
    contact: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create index for geospatial queries
DisasterSchema.index({ location: '2dsphere' });
DisasterSchema.index({ 'evacuationZone': '2dsphere' });
DisasterSchema.index({ 'reliefCenters.location': '2dsphere' });

module.exports = mongoose.model('Disaster', DisasterSchema); 