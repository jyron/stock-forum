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

  // Helper function to format the last activity
  const getLastActivity = (stock) => {
    if (stock.lastCommentDate) {
      const date = new Date(stock.lastCommentDate);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    }
    return "no replies";
  };

  return (
    <div className="stock-table-container">
      <div
        style={{
          padding: "5px 0",
          borderBottom: "1px solid #ccc",
          marginBottom: "5px",
        }}
      >
        <strong>active discussions</strong>
      </div>

      {stocks.map((stock) => {
        const isLiked = user && stock.likedBy?.includes(user.id);
        const isDisliked = user && stock.dislikedBy?.includes(user.id);

        return (
          <div key={stock._id} className="table-row">
            <div className="col-symbol">
              <Link to={`/stocks/${stock.symbol}`}>{stock.symbol}</Link>
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

            <div className="conversation-info">
              {stock.commentCount > 0 ? (
                <>
                  <Link to={`/stocks/${stock.symbol}`}>
                    {stock.commentCount}{" "}
                    {stock.commentCount === 1 ? "reply" : "replies"}
                  </Link>
                  {" - "}
                  <span style={{ color: "#666" }}>
                    {getLastActivity(stock)}
                  </span>
                </>
              ) : (
                <Link to={`/stocks/${stock.symbol}`}>start discussion</Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockTable;
