const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
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
    code: {
      type: String,
      required: false,
      trim: true
    },
    description: {
      type: String,
      required: false,
      trim: true
    }
  },
  { timestamps: true }
);

subjectSchema.index(
  {
    schoolId: 1,
    name: 1
  },
  { unique: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
