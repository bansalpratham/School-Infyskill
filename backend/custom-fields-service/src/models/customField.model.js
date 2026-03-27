const mongoose = require('mongoose');

const FIELD_TYPES = ['text', 'number', 'email', 'phone', 'textarea', 'dropdown', 'checkbox', 'date'];
const VISIBILITY = ['student', 'teacher', 'both'];

const customFieldSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, trim: true, index: true },

    label: { type: String, required: true, trim: true, maxlength: 100 },
    placeholder: { type: String, trim: true, maxlength: 200 },
    type: { type: String, enum: FIELD_TYPES, required: true, index: true },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },
    visibility: { type: String, enum: VISIBILITY, default: 'both', index: true },
    order: { type: Number, default: 0, index: true },
    enabled: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

customFieldSchema.index({ schoolId: 1, order: 1 });

module.exports = mongoose.model('CustomField', customFieldSchema);
