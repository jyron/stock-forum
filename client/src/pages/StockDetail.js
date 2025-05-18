import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStockById, likeStock, dislikeStock, deleteStock, getStockBySymbol } from '../services/stockService';
import { getStockComments } from '../services/commentService';
import { getStockDataBySymbol } from '../services/stockDataService';
import { useAuth } from '../context/AuthContext';
import Comment from '../components/Comment';
import CommentForm from '../components/CommentForm';

const StockDetail = () => {
  const { symbol } = useParams(); // Changed from id to symbol
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [stock, setStock] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchStock = async () => {
    try {
      // Try to get the stock by symbol first
      const result = await getStockBySymbol(symbol);
      
      if (result.success) {
        // We found the stock by symbol, now we have its ID for all future interactions
        setStock(result.data);
      } else {
        // If we can't find by symbol, try to get from SP500 data
        const sp500Result = await getStockDataBySymbol(symbol);
        
        if (sp500Result.success) {
          // Convert SP500 stock data format to match regular stock format
          const stockData = sp500Result.data;
          setStock({
            _id: stockData._id, // Use the actual database ID
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
          });
        } else {
          setError('Stock not found');
        }
      }
    } catch (error) {
      setError('Error fetching stock details');
      console.error(error);
    }
  };
  
  const fetchComments = async () => {
    // Only proceed if we have a stock with an ID
    if (!stock || !stock._id) {
      return;
    }
    
    // Always use the stock's database ID for backend interactions
    const result = await getStockComments(stock._id);
    
    if (result.success) {
      // Organize comments into a hierarchy
      const commentMap = {};
      const topLevelComments = [];
      
      result.data.forEach(comment => {
        comment.replies = [];
        commentMap[comment._id] = comment;
        
        if (comment.isReply && comment.parentComment) {
          const parent = commentMap[comment.parentComment];
          if (parent) {
            parent.replies.push(comment);
          } else {
            topLevelComments.push(comment);
          }
        } else {
          topLevelComments.push(comment);
        }
      });
      
      setComments(topLevelComments);
    } else {
      console.error('Failed to fetch comments:', result.error);
    }
  };
  
  const loadData = async () => {
    setLoading(true);
    await fetchStock();
    await fetchComments();
    setLoading(false);
  };
  
  useEffect(() => {
    loadData();
  }, [symbol]);
  
  const handleLike = async () => {
    if (!isAuthenticated()) {
      alert('Please login to like stocks');
      return;
    }
    
    // Only use the stock's ID for backend interactions
    if (!stock || !stock._id) {
      setError('Cannot like this stock right now');
      return;
    }
    
    const result = await likeStock(stock._id);
    
    if (result.success) {
      setStock(prevStock => ({
        ...prevStock,
        likes: result.data.likes,
        dislikes: result.data.dislikes,
        likedBy: result.data.likedBy,
        dislikedBy: result.data.dislikedBy
      }));
    } else {
      if (result.error === 'Unauthorized' || result.error?.includes('not authorized')) {
        setError('Please sign in to like stocks and join the community!');
      } else {
        setError(result.error || 'Failed to like stock');
      }
    }
  };
  
  const handleDislike = async () => {
    if (!isAuthenticated()) {
      alert('Please login to dislike stocks');
      return;
    }
    
    // Only use the stock's ID for backend interactions
    if (!stock || !stock._id) {
      setError('Cannot dislike this stock right now');
      return;
    }
    
    const result = await dislikeStock(stock._id);
    
    if (result.success) {
      setStock(prevStock => ({
        ...prevStock,
        likes: result.data.likes,
        dislikes: result.data.dislikes,
        likedBy: result.data.likedBy,
        dislikedBy: result.data.dislikedBy
      }));
    } else {
      if (result.error === 'Unauthorized' || result.error?.includes('not authorized')) {
        setError('Please sign in to dislike stocks and join the community!');
      } else {
        setError(result.error || 'Failed to dislike stock');
      }
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this stock?')) {
      // Only use the stock's ID for backend interactions
      if (!stock || !stock._id) {
        setError('Cannot delete this stock right now');
        return;
      }
      
      const result = await deleteStock(stock._id);
      
      if (result.success) {
        navigate('/');
      } else {
        alert(result.error || 'Failed to delete stock');
      }
    }
  };
  
  const isLiked = user && stock?.likedBy?.includes(user.id);
  const isDisliked = user && stock?.dislikedBy?.includes(user.id);
  const isAuthor = user && stock?.createdBy?._id === user.id;
  
  if (loading) {
    return <div className="loading">Loading stock details...</div>;
  }
  
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  
  if (!stock) {
    return <div className="alert alert-danger">Stock not found</div>;
  }
  
  return (
    <div className="stock-details">
      <h1>{stock.symbol} - {stock.name}</h1>
      <p className="description">{stock.description}</p>
      
      <div className="price-info">
        <p className="current-price">Current Price: ${stock.currentPrice?.toFixed(2) || 'N/A'}</p>
        <p className={`percent-change ${stock.percentChange > 0 ? 'positive' : stock.percentChange < 0 ? 'negative' : ''}`}>
          Percent Change: {
            stock.percentChange !== undefined && stock.percentChange !== null
              ? `${stock.percentChange > 0 ? '+' : ''}${parseFloat(stock.percentChange).toFixed(2)}%`
              : 'N/A'
          }
        </p>
      </div>
      
      <div className="stock-actions">
        <div className="stock-stats">
          <button 
            className={`vote-btn ${isLiked ? 'active' : ''}`} 
            onClick={handleLike}
          >
            👍 {stock.likes || 0}
          </button>
          <button 
            className={`vote-btn ${isDisliked ? 'active' : ''}`} 
            onClick={handleDislike}
          >
            👎 {stock.dislikes || 0}
          </button>
        </div>
        
        {isAuthor && (
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete Stock
          </button>
        )}
      </div>
      
      <div className="comments-section">
        <h2>Comments</h2>
        
        {stock && stock._id ? (
          <CommentForm stockId={stock._id} onSubmit={fetchComments} />
        ) : (
          <div className="alert alert-info">Loading comment form...</div>
        )}
        
        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <Comment 
              key={comment._id} 
              comment={comment} 
              stockId={stock._id} 
              onUpdate={fetchComments} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default StockDetail;
