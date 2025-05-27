import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { likeStock, dislikeStock } from "../services/stockService";

const StockCard = ({ stock, onUpdate }) => {
  const { isAuthenticated, user } = useAuth();

  const handleLike = async () => {
    if (!isAuthenticated()) {
      alert("Please login to like stocks");
      return;
    }

    // Always use the stock's database ID for backend interactions
    if (!stock._id) {
      console.error("Stock ID is missing");
      return;
    }
    const result = await likeStock(stock._id);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated()) {
      alert("Please login to dislike stocks");
      return;
    }

    // Always use the stock's database ID for backend interactions
    if (!stock._id) {
      console.error("Stock ID is missing");
      return;
    }
    const result = await dislikeStock(stock._id);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };

  const isLiked = user && stock.likedBy?.includes(user.id);
  const isDisliked = user && stock.dislikedBy?.includes(user.id);
  const isAuthor = user && stock.createdBy?._id === user.id;

  return (
    <div className="stock-card">
      <div className="stock-header">
        <h2>
          <span className="symbol">{stock.symbol}</span> - {stock.name}
        </h2>
        <div className="discussion-stats">
          <span className="comment-count">
            {stock.commentCount || 0} comments
          </span>
          {stock.likes > 0 && <span> • {stock.likes} likes</span>}
        </div>
      </div>

      <div className="stock-info">
        <p className="price">
          Current Price: ${stock.currentPrice?.toFixed(2) || "N/A"}
        </p>
        <p
          className={`percent-change ${
            stock.percentChange > 0
              ? "positive"
              : stock.percentChange < 0
              ? "negative"
              : ""
          }`}
        >
          Change:{" "}
          {stock.percentChange !== undefined && stock.percentChange !== null
            ? `${stock.percentChange > 0 ? "+" : ""}${parseFloat(
                stock.percentChange
              ).toFixed(2)}%`
            : "N/A"}
        </p>
      </div>

      <div className="stock-actions">
        <Link to={`/stocks/${stock.symbol}`} className="btn btn-primary">
          Join Discussion
        </Link>
        {isAuthor && (
          <button className="btn" onClick={onUpdate}>
            Delete
          </button>
        )}
      </div>

      <div className="stock-footer">
        <small>
          Posted by {stock.createdBy?.username || "Anonymous"} •{" "}
          {new Date(stock.createdAt).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

export default StockCard;
