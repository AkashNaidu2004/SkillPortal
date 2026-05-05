const router = require('express').Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/categories', getCategories);
router.post('/admin/category', authMiddleware, adminMiddleware, createCategory);
router.put('/admin/category/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/admin/category/:id', authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;
