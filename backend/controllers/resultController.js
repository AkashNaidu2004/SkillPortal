const Result = require('../models/Result');
const Question = require('../models/Question');
const Test = require('../models/Test');

// POST /api/test/submit
exports.submitTest = async (req, res) => {
  try {
    const { testId, answers, timeTaken, violations, violationLog } = req.body;
    const userId = req.user._id;

    // Get all questions for this test
    const questions = await Question.find({ testId });
    const totalQuestions = questions.length;
    let correctAnswers = 0;

    // Grade each answer
    const gradedAnswers = answers.map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (!question) return { ...answer, isCorrect: false };

      if (question.type === 'mcq') {
        const isCorrect = question.correctAnswer === answer.selectedAnswer;
        if (isCorrect) correctAnswers++;
        return { ...answer, isCorrect };
      }

      if (question.type === 'coding') {
        // Mock code execution - check against test cases
        const totalTestCases = question.testCases?.length || 0;
        // For mock: randomly pass 60-100% of test cases
        const passedTestCases = Math.floor(totalTestCases * (0.6 + Math.random() * 0.4));
        const isCorrect = passedTestCases === totalTestCases;
        if (isCorrect) correctAnswers++;
        return { ...answer, isCorrect, passedTestCases, totalTestCases };
      }

      return { ...answer, isCorrect: false };
    });

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const result = await Result.create({
      userId,
      testId,
      score,
      totalQuestions,
      correctAnswers,
      accuracy,
      timeTaken: timeTaken || 0,
      violations: violations || 0,
      violationLog: violationLog || [],
      answers: gradedAnswers,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/results/:userId
exports.getResults = async (req, res) => {
  try {
    const results = await Result.find({ userId: req.params.userId })
      .populate({
        path: 'testId',
        populate: { path: 'categoryId', select: 'name' }
      })
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/result/:id
exports.getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate({
        path: 'testId',
        populate: { path: 'categoryId', select: 'name' }
      })
      .populate('answers.questionId');
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/analytics/:userId
exports.getAnalytics = async (req, res) => {
  try {
    const results = await Result.find({ userId: req.params.userId })
      .populate({
        path: 'testId',
        populate: { path: 'categoryId', select: 'name' }
      })
      .sort({ createdAt: 1 });

    // Category-wise performance
    const categoryMap = {};
    results.forEach(r => {
      const catName = r.testId?.categoryId?.name || 'Unknown';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { totalScore: 0, count: 0, totalAccuracy: 0 };
      }
      categoryMap[catName].totalScore += r.score;
      categoryMap[catName].totalAccuracy += r.accuracy;
      categoryMap[catName].count++;
    });

    const categoryPerformance = Object.entries(categoryMap).map(([name, data]) => ({
      category: name,
      avgScore: Math.round(data.totalScore / data.count),
      avgAccuracy: Math.round(data.totalAccuracy / data.count),
      attempts: data.count,
    }));

    // Performance trend (last 10)
    const trend = results.slice(-10).map(r => ({
      date: r.createdAt,
      score: r.score,
      accuracy: r.accuracy,
      test: r.testId?.title || 'Unknown',
    }));

    // Strengths and weaknesses
    const sorted = [...categoryPerformance].sort((a, b) => b.avgAccuracy - a.avgAccuracy);
    const strengths = sorted.slice(0, 2).map(c => c.category);
    const weaknesses = sorted.slice(-2).map(c => c.category);

    res.json({
      totalTests: results.length,
      avgScore: results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0,
      avgAccuracy: results.length > 0 ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / results.length) : 0,
      categoryPerformance,
      trend,
      strengths,
      weaknesses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
