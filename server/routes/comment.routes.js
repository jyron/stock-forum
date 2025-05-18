const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all comments for a stock
router.get('/stock/:stockId', commentController.getStockComments);

// Public route for creating comments (can be anonymous)
router.post('/', commentController.createComment);

// Protected routes (require authentication)
router.put('/:id', authMiddleware, commentController.updateComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);

// Like/dislike routes (public, no auth required)
router.post('/:id/like', commentController.likeComment);
router.post('/:id/dislike', commentController.dislikeComment);

module.exports = router;
