/**
 * Stock Data Routes
 * 
 * API routes for handling S&P 500 stock data operations
 * including fetching, searching, and importing stock data.
 */

const express = require('express');
const router = express.Router();
const stockDataController = require('../controllers/stockData.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all stock data
router.get('/', stockDataController.getAllStockData);

// Get stock data by symbol
router.get('/:symbol', stockDataController.getStockDataBySymbol);

// Import S&P 500 stocks (protected route)
router.post('/import-sp500', authMiddleware, stockDataController.importSP500Stocks);

// Update stock data from API (protected route)
router.put('/:symbol/update', authMiddleware, stockDataController.updateStockData);

module.exports = router;
