const router = require('express').Router();
const { getTestsByCategory, getTestById, getAllTests, createTest, updateTest, deleteTest } = require('../controllers/testController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/tests/:categoryId', getTestsByCategory);
router.get('/test/:id', authMiddleware, getTestById);
router.get('/admin/tests', authMiddleware, adminMiddleware, getAllTests);
router.post('/admin/test', authMiddleware, adminMiddleware, createTest);
router.put('/admin/test/:id', authMiddleware, adminMiddleware, updateTest);
router.delete('/admin/test/:id', authMiddleware, adminMiddleware, deleteTest);

module.exports = router;
