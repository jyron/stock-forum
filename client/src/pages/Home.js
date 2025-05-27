import React, { useState, useEffect } from "react";
import StockCard from "../components/StockCard";
import { getAllStocks } from "../services/stockService";

const Home = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStocks = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Fetching stocks with search term:", searchTerm);
      const stocksResult = await getAllStocks(searchTerm);
      console.log("Stocks result:", stocksResult);
      if (stocksResult.success) {
        setStocks(stocksResult.data);
      } else {
        setError(stocksResult.error || "Failed to fetch stocks");
      }
    } catch (err) {
      console.error("Error fetching stocks:", err);
      setError("Failed to fetch stocks");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when search term changes
  useEffect(() => {
    fetchStocks();
  }, [searchTerm]);

  const handleTestSearch = () => {
    setSearchTerm("AAPL");
  };

  return (
    <div className="home-page">
      <h1>Stock Forum</h1>
      <p>Discuss and rate your favorite stocks</p>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search stocks by symbol or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleTestSearch} className="btn btn-primary">
          Test Search AAPL
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading">Loading stocks...</div>
      ) : stocks.length === 0 ? (
        <div className="alert alert-info">
          No stocks found. <a href="/add-stock">Add a stock</a> to get started!
        </div>
      ) : (
        <div className="stock-grid">
          {stocks.map((stock) => (
            <StockCard key={stock._id} stock={stock} onUpdate={fetchStocks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
