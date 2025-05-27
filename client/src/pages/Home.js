import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllStocks } from "../services/stockService";
import StockCard from "../components/StockCard";
import "../styles/Yahoo90s.css";

const Home = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllStocks(searchTerm);
      if (response.success) {
        setStocks(response.data);
        setError(null);
      } else {
        setError(response.error || "Failed to fetch stocks");
        setStocks([]);
      }
    } catch (err) {
      setError("Failed to fetch stocks. Please try again later.");
      console.error("Error fetching stocks:", err);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="home-container">
      <header className="main-header">
        <h1>Stock Forum</h1>
        <p className="tagline">
          Join the discussion about your favorite stocks
        </p>
      </header>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search stocks by symbol or name..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {user && (
        <div className="action-bar">
          <Link to="/stocks/new" className="btn btn-primary">
            Add New Stock
          </Link>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading stocks...</div>
      ) : (
        <div className="stock-grid">
          {stocks.length === 0 ? (
            <div className="no-stocks">
              <p>No stocks found. Be the first to add one!</p>
              {user && (
                <Link to="/stocks/new" className="btn btn-primary">
                  Add Stock
                </Link>
              )}
            </div>
          ) : (
            stocks.map((stock) => (
              <StockCard key={stock._id} stock={stock} onUpdate={fetchStocks} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
