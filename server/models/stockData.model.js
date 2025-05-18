const mongoose = require('mongoose');

const stockDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  exchange: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    trim: true
  },
  close: {
    type: Number
  },
  percentChange: {
    type: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String
  }],
  dislikedBy: [{
    type: String
  }]
}, {
  timestamps: true
});

const StockData = mongoose.model('StockData', stockDataSchema);

module.exports = StockData;
