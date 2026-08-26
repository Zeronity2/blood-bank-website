const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true
    },

    contactName: {
      type: String,
      required: true,
      trim: true
    },

    bloodGroup: {
      type: String,
      required: true,
      trim: true
    },

    units: {
      type: Number,
      required: true,
      min: 1
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      trim: true
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    hospital: {
      type: String,
      required: true,
      trim: true
    },

    requiredDate: {
      type: Date,
      required: true
    },

    urgency: {
      type: String,
      enum: ['Normal', 'Urgent', 'Emergency'],
      default: 'Normal'
    },

    message: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ['Pending', 'Fulfilled', 'Cancelled'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'BloodRequest',
  bloodRequestSchema
);