const router = require('express').Router();
const { createQuestion, getQuestionsByTest, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/admin/questions/:testId', authMiddleware, adminMiddleware, getQuestionsByTest);
router.post('/admin/question', authMiddleware, adminMiddleware, createQuestion);
router.put('/admin/question/:id', authMiddleware, adminMiddleware, updateQuestion);
router.delete('/admin/question/:id', authMiddleware, adminMiddleware, deleteQuestion);

module.exports = router;
