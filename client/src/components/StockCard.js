import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likeStock, dislikeStock } from '../services/stockService';

const StockCard = ({ stock, onUpdate }) => {
  const { isAuthenticated, user } = useAuth();
  
  const handleLike = async () => {
    if (!isAuthenticated()) {
      alert('Please login to like stocks');
      return;
    }
    
    // Always use the stock's database ID for backend interactions
    if (!stock._id) {
      console.error('Stock ID is missing');
      return;
    }
    const result = await likeStock(stock._id);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };
  
  const handleDislike = async () => {
    if (!isAuthenticated()) {
      alert('Please login to dislike stocks');
      return;
    }
    
    // Always use the stock's database ID for backend interactions
    if (!stock._id) {
      console.error('Stock ID is missing');
      return;
    }
    const result = await dislikeStock(stock._id);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };
  
  const isLiked = user && stock.likedBy?.includes(user.id);
  const isDisliked = user && stock.dislikedBy?.includes(user.id);
  
  return (
    <div className="stock-card">
      <div className="stock-header">
        <span className="stock-symbol">{stock.symbol}</span>
        <span className="stock-price">${stock.currentPrice?.toFixed(2) || 'N/A'}</span>
      </div>
      <h3 className="stock-name">{stock.name}</h3>
      <p className="stock-description">
        {stock.description?.length > 100
          ? `${stock.description.substring(0, 100)}...`
          : stock.description || 'No description available'}
      </p>
      <div className="stock-footer">
        <div className="stock-stats">
          <div className="stock-stat">
            <button 
              className={`vote-btn ${isLiked ? 'active' : ''}`} 
              onClick={handleLike}
            >
              👍 {stock.likes || 0}
            </button>
          </div>
          <div className="stock-stat">
            <button 
              className={`vote-btn ${isDisliked ? 'active' : ''}`} 
              onClick={handleDislike}
            >
              👎 {stock.dislikes || 0}
            </button>
          </div>
        </div>
        <Link to={`/stocks/${stock.symbol}`} className="btn btn-primary">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default StockCard;
