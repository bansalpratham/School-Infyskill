const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    section: {
      type: String,
      required: true,
      trim: true
    },
    classTeacherId: {
      type: String,
      required: false,
      trim: true
    },
    subjects: {
      type: [String],
      default: [],
      index: true
    },
    room: {
      type: String,
      required: false,
      trim: true
    }
  },
  { timestamps: true }
);

classSchema.index({ schoolId: 1, name: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
