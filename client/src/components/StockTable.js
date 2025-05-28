import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { likeStock, dislikeStock } from "../services/stockService";

const StockTable = ({ stocks, onUpdate }) => {
  const { isAuthenticated, user } = useAuth();

  const handleLike = async (stockId) => {
    if (!isAuthenticated()) {
      alert("Please login to like stocks");
      return;
    }

    const result = await likeStock(stockId);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };

  const handleDislike = async (stockId) => {
    if (!isAuthenticated()) {
      alert("Please login to dislike stocks");
      return;
    }

    const result = await dislikeStock(stockId);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="stock-table-container">
      <div className="stock-table">
        <div className="table-header">
          <div className="col-symbol">Symbol</div>
          <div className="col-name">Name</div>
          <div className="col-price">Price</div>
          <div className="col-change">Change</div>
          <div className="col-stats">Stats</div>
          <div className="col-actions">Actions</div>
        </div>

        {stocks.map((stock) => {
          const isLiked = user && stock.likedBy?.includes(user.id);
          const isDisliked = user && stock.dislikedBy?.includes(user.id);

          return (
            <div key={stock._id} className="table-row">
              <div className="col-symbol">
                <span className="symbol">{stock.symbol}</span>
              </div>
              <div className="col-name">{stock.name}</div>
              <div className="col-price">
                ${stock.currentPrice?.toFixed(2) || "N/A"}
              </div>
              <div className="col-change">
                <span
                  className={`percent-change ${
                    stock.percentChange > 0
                      ? "positive"
                      : stock.percentChange < 0
                      ? "negative"
                      : ""
                  }`}
                >
                  {stock.percentChange !== undefined &&
                  stock.percentChange !== null
                    ? `${stock.percentChange > 0 ? "+" : ""}${parseFloat(
                        stock.percentChange
                      ).toFixed(2)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="col-stats">
                <div className="stats-container">
                  <span className="stat-item">
                    💬 {stock.commentCount || 0}
                  </span>
                  <span className="stat-item">👍 {stock.likes || 0}</span>
                  <span className="stat-item">👎 {stock.dislikes || 0}</span>
                </div>
              </div>

              <div className="col-actions">
                <div className="action-buttons">
                  <Link
                    to={`/stocks/${stock.symbol}`}
                    className="btn btn-primary"
                  >
                    Join Discussion
                  </Link>
                  <div className="vote-buttons">
                    <button
                      className={`vote-btn ${isLiked ? "active liked" : ""}`}
                      onClick={() => handleLike(stock._id)}
                    >
                      👍
                    </button>
                    <button
                      className={`vote-btn ${
                        isDisliked ? "active disliked" : ""
                      }`}
                      onClick={() => handleDislike(stock._id)}
                    >
                      👎
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockTable;
