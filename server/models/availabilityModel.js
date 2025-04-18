const mongoose = require('mongoose');

const availabilitySchema = mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },
    date: {
      type: Date,
      required: function() {
        return !this.isRecurring;
      },
    },
  },
  {
    timestamps: true,
  }
);

const Availability = mongoose.model('Availability', availabilitySchema);
module.exports = Availability;
