const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  type: { type: String, enum: ['mcq', 'coding'], required: true },
  questionText: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  // MCQ fields
  options: [{ type: String }],
  correctAnswer: { type: String },
  // Coding fields
  constraints: { type: String },
  sampleInput: { type: String },
  sampleOutput: { type: String },
  testCases: [{
    input: String,
    expectedOutput: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
