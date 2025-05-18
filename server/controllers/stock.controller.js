/**
 * Stock Controller
 * 
 * Handles all stock-related operations including CRUD operations
 * and like/dislike functionality for stocks.
 */

const StockData = require('../models/stockData.model');
const Comment = require('../models/comment.model');

/**
 * Get all stocks
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} - List of all stocks sorted by creation date
 */
exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await StockData.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get a single stock by ID
 * 
 * @param {Object} req - Express request object with stock ID in params
 * @param {Object} res - Express response object
 * @returns {Object} - Stock details
 */
exports.getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only search by MongoDB ID
    const stock = await Stock.findById(id)
      .populate('createdBy', 'username');
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get a single stock by symbol
 * 
 * @param {Object} req - Express request object with stock symbol in params
 * @param {Object} res - Express response object
 * @returns {Object} - Stock details
 */
exports.getStockBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // First try to find in the Stock collection
    let stock = await Stock.findOne({ symbol: symbol.toUpperCase() })
      .populate('createdBy', 'username');
    
    if (!stock) {
      // If not found, check the StockData collection (for SP500 stocks)
      const StockData = require('../models/stockData.model');
      const stockData = await StockData.findOne({ symbol: symbol.toUpperCase() });
      
      if (stockData) {
        // Convert StockData format to Stock format
        stock = {
          _id: stockData._id,
          symbol: stockData.symbol,
          name: stockData.name,
          description: `${stockData.name} is traded on ${stockData.exchange || 'the stock market'} in ${stockData.currency || 'USD'}.`,
          currentPrice: stockData.close,
          percentChange: stockData.percentChange,
          likes: 0,
          dislikes: 0,
          likedBy: [],
          dislikedBy: [],
          isSP500Stock: true
        };
      } else {
        return res.status(404).json({ message: 'Stock not found' });
      }
    }
    
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new stock
 * 
 * @param {Object} req - Express request object with stock data in body
 * @param {Object} res - Express response object
 * @returns {Object} - Created stock details
 */
exports.createStock = async (req, res) => {
  try {
    const { symbol, name, description, currentPrice } = req.body;
    
    // Check if stock already exists
    const existingStock = await Stock.findOne({ symbol });
    if (existingStock) {
      return res.status(400).json({ message: 'Stock with this symbol already exists' });
    }
    
    const stock = new Stock({
      symbol,
      name,
      description,
      currentPrice,
      createdBy: req.userId
    });
    
    await stock.save();
    
    res.status(201).json({
      message: 'Stock created successfully',
      stock
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a stock
 * 
 * @param {Object} req - Express request object with stock ID in params and updated data in body
 * @param {Object} res - Express response object
 * @returns {Object} - Updated stock details
 */
exports.updateStock = async (req, res) => {
  try {
    const { symbol, name, description, currentPrice } = req.body;
    
    // Get stock by ID or symbol
    let stock;
    const { id } = req.params;
    const { bySymbol } = req.query;
    
    if (bySymbol === 'true') {
      stock = await Stock.findOne({ symbol: id });
    } else {
      try {
        stock = await Stock.findById(id);
      } catch (idError) {
        stock = await Stock.findOne({ symbol: id });
      }
    }
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    // Update fields
    stock.symbol = symbol || stock.symbol;
    stock.name = name || stock.name;
    stock.description = description || stock.description;
    stock.currentPrice = currentPrice || stock.currentPrice;
    
    await stock.save();
    
    res.status(200).json({
      message: 'Stock updated successfully',
      stock
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a stock
 * 
 * @param {Object} req - Express request object with stock ID in params
 * @param {Object} res - Express response object
 * @returns {Object} - Success message
 */
exports.deleteStock = async (req, res) => {
  try {
    // Get stock by ID only
    const { id } = req.params;
    
    // Only search by MongoDB ID
    let stock;
    try {
      stock = await Stock.findById(id);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid stock ID format' });
    }
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    // Check if user is the creator
    if (stock.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this stock' });
    }
    
    // Delete associated comments
    await Comment.deleteMany({ stock: stock._id });
    
    // Delete the stock
    await Stock.findByIdAndDelete(stock._id);
    
    res.status(200).json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Like a stock
 * 
 * @param {Object} req - Express request object with stock ID in params
 * @param {Object} res - Express response object
 * @returns {Object} - Updated like/dislike counts
 */
exports.likeStock = async (req, res) => {
  try {
    // Get stock by ID only
    const { id } = req.params;
    
    // Only search by MongoDB ID
    let stock;
    try {
      stock = await StockData.findById(id);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid stock ID format' });
    }
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    // Get client IP or session ID to track likes/dislikes
    const clientIdentifier = req.ip || 'anonymous';
    
    // For authenticated users, use their ID
    const userIdentifier = req.userId || clientIdentifier;
    
    // We'll store IDs as strings for consistency
    const userIdString = userIdentifier.toString();
    
    // Initialize arrays if they don't exist
    if (!stock.likedBy) stock.likedBy = [];
    if (!stock.dislikedBy) stock.dislikedBy = [];
    
    // Check if user/client already liked this stock
    if (stock.likedBy.some(id => id.toString() === userIdString)) {
      return res.status(400).json({ message: 'You already liked this stock' });
    }
    
    // Remove user/client from dislikedBy if they previously disliked
    if (stock.dislikedBy.some(id => id.toString() === userIdString)) {
      stock.dislikedBy = stock.dislikedBy.filter(
        id => id.toString() !== userIdString
      );
      stock.dislikes = Math.max(0, stock.dislikes - 1);
    }
    
    // Add like
    stock.likedBy.push(userIdString);
    stock.likes += 1;
    
    await stock.save();
    
    res.status(200).json({
      message: 'Stock liked successfully',
      likes: stock.likes,
      dislikes: stock.dislikes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Dislike a stock
 * 
 * @param {Object} req - Express request object with stock ID in params
 * @param {Object} res - Express response object
 * @returns {Object} - Updated like/dislike counts
 */
exports.dislikeStock = async (req, res) => {
  try {
    // Get stock by ID only
    const { id } = req.params;
    
    // Only search by MongoDB ID
    let stock;
    try {
      stock = await StockData.findById(id);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid stock ID format' });
    }
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    // Get client IP or session ID to track likes/dislikes
    const clientIdentifier = req.ip || 'anonymous';
    
    // For authenticated users, use their ID
    const userIdentifier = req.userId || clientIdentifier;
    
    // We'll store IDs as strings for consistency
    const userIdString = userIdentifier.toString();
    
    // Initialize arrays if they don't exist
    if (!stock.likedBy) stock.likedBy = [];
    if (!stock.dislikedBy) stock.dislikedBy = [];
    
    // Check if user/client already disliked this stock
    if (stock.dislikedBy.some(id => id.toString() === userIdString)) {
      return res.status(400).json({ message: 'You already disliked this stock' });
    }
    
    // Remove user/client from likedBy if they previously liked
    if (stock.likedBy.some(id => id.toString() === userIdString)) {
      stock.likedBy = stock.likedBy.filter(
        id => id.toString() !== userIdString
      );
      stock.likes = Math.max(0, stock.likes - 1);
    }
    
    // Add dislike
    stock.dislikedBy.push(userIdString);
    stock.dislikes += 1;
    
    await stock.save();
    
    res.status(200).json({
      message: 'Stock disliked successfully',
      likes: stock.likes,
      dislikes: stock.dislikes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
