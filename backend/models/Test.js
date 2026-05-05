const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  duration: { type: Number, required: true }, // minutes
  type: { type: String, enum: ['mcq', 'coding', 'mixed'], default: 'mcq' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
