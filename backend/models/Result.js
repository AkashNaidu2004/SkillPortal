const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // seconds
  violations: { type: Number, default: 0 },
  violationLog: [{ type: String }],
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: String,
    code: String,
    isCorrect: Boolean,
    passedTestCases: Number,
    totalTestCases: Number,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
