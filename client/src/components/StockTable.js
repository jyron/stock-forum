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
      <table className="stock-table">
        <thead>
          <tr className="table-header">
            <th className="col-symbol">Symbol</th>
            <th className="col-name">Name</th>
            <th className="col-price">Price</th>
            <th className="col-change">Change</th>
            <th className="col-stats">Stats</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const isLiked = user && stock.likedBy?.includes(user.id);
            const isDisliked = user && stock.dislikedBy?.includes(user.id);

            return (
              <tr key={stock._id} className="table-row">
                <td className="col-symbol">
                  <span className="symbol">{stock.symbol}</span>
                </td>
                <td className="col-name">{stock.name}</td>
                <td className="col-price">
                  ${stock.currentPrice?.toFixed(2) || "N/A"}
                </td>
                <td className="col-change">
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
                </td>
                <td className="col-stats">
                  <div className="stats-container">
                    <span className="stat-item">
                      💬 {stock.commentCount || 0}
                    </span>
                    <span className="stat-item">👍 {stock.likes || 0}</span>
                    <span className="stat-item">👎 {stock.dislikes || 0}</span>
                  </div>
                </td>
                <td className="col-actions">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
