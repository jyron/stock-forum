const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.get('/', stockController.getAllStocks);
router.get('/symbol/:symbol', stockController.getStockBySymbol); // New endpoint for symbol lookup
router.get('/:id', stockController.getStockById);

// Protected routes
router.post('/', authMiddleware, stockController.createStock);
router.put('/:id', authMiddleware, stockController.updateStock);
router.delete('/:id', authMiddleware, stockController.deleteStock);

// Like/dislike routes (public, no auth required)
router.post('/:id/like', stockController.likeStock);
router.post('/:id/dislike', stockController.dislikeStock);

module.exports = router;
