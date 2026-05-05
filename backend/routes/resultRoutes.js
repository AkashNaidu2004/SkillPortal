const router = require('express').Router();
const { submitTest, getResults, getResultById, getAnalytics } = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/test/submit', authMiddleware, submitTest);
router.get('/results/:userId', authMiddleware, getResults);
router.get('/result/:id', authMiddleware, getResultById);
router.get('/analytics/:userId', authMiddleware, getAnalytics);

module.exports = router;
