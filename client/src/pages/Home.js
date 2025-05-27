import React, { useState, useEffect } from "react";
import StockCard from "../components/StockCard";
import { getAllStocks } from "../services/stockService";

import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();

  const fetchStocks = async () => {
    setLoading(true);
    setError("");

    // Fetch user-created stocks
    const stocksResult = await getAllStocks();

    if (stocksResult.success) {
      setStocks(stocksResult.data);
    } else {
      setError(stocksResult.error || "Failed to fetch stocks");
    }

    setLoading(false);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchStocks();
  }, []);

  return (
    <div className="home-page">
      <h1>Stock Forum</h1>
      <p>Discuss and rate your favorite stocks</p>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading">Loading stocks...</div>
      ) : stocks.length === 0 ? (
        <div className="alert alert-info">
          No stocks found. <a href="/add-stock">Add a stock</a> to get started!
        </div>
      ) : (
        <div className="stock-table-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Price</th>
                <th>Change (%)</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr
                  key={stock._id || stock.symbol}
                  className={
                    stock.percentChange && parseFloat(stock.percentChange) >= 0
                      ? "positive"
                      : "negative"
                  }
                >
                  <td className="stock-symbol">{stock.symbol}</td>
                  <td>{stock.name}</td>
                  <td>
                    ${(stock.currentPrice || stock.close)?.toFixed(2) || "N/A"}
                  </td>
                  <td
                    className={
                      stock.percentChange &&
                      parseFloat(stock.percentChange) >= 0
                        ? "positive-change"
                        : "negative-change"
                    }
                  >
                    {stock.percentChange !== undefined &&
                    stock.percentChange !== null
                      ? `${parseFloat(stock.percentChange).toFixed(2)}%`
                      : "0.00%"}
                  </td>
                  <td>👍 {stock.likes || 0}</td>
                  <td>💬 {stock.commentCount || 0}</td>
                  <td>
                    <a
                      href={`/stocks/${stock.symbol}`}
                      className="btn btn-sm btn-primary"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Home;
