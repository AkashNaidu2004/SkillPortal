const Test = require('../models/Test');
const Question = require('../models/Question');

// GET /api/tests/:categoryId
exports.getTestsByCategory = async (req, res) => {
  try {
    const tests = await Test.find({ categoryId: req.params.categoryId, isActive: true })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });
    
    // Add question count to each test
    const testsWithCount = await Promise.all(
      tests.map(async (test) => {
        const questionCount = await Question.countDocuments({ testId: test._id });
        return { ...test.toObject(), questionCount };
      })
    );

    res.json(testsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/test/:id  – returns test with questions
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('categoryId', 'name');
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const questions = await Question.find({ testId: test._id });

    // Strip correct answers for students
    const safeQuestions = questions.map(q => {
      const obj = q.toObject();
      if (obj.type === 'mcq') delete obj.correctAnswer;
      if (obj.type === 'coding') {
        obj.testCases = obj.testCases?.slice(0, 1); // only show first test case
      }
      return obj;
    });

    res.json({ test, questions: safeQuestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/tests – all tests for admin
exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find().populate('categoryId', 'name').sort({ createdAt: -1 });
    const testsWithCount = await Promise.all(
      tests.map(async (test) => {
        const questionCount = await Question.countDocuments({ testId: test._id });
        return { ...test.toObject(), questionCount };
      })
    );
    res.json(testsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/test
exports.createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/test/:id
exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/test/:id
exports.deleteTest = async (req, res) => {
  try {
    await Question.deleteMany({ testId: req.params.id });
    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test and its questions deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
