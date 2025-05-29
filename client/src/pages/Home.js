import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllStocks } from "../services/stockService";
import StockTable from "../components/StockTable";
import "../styles/Craigslist.css";

const Home = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const result = await getAllStocks();
      if (result.success) {
        setStocks(result.data);
      } else {
        setError(result.error || "Failed to fetch stocks");
      }
    } catch (err) {
      setError("An error occurred while fetching stocks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading stocks...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="home-container">
      <header className="main-header">
        <h1>stock forum | discussions</h1>
        <p className="tagline">
          share insights and discuss stocks with the community
        </p>
      </header>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="AAPL, GOOGL..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {filteredStocks.length === 0 ? (
        <div className="no-stocks">
          No stocks found matching your search criteria.
        </div>
      ) : (
        <StockTable stocks={filteredStocks} onUpdate={fetchStocks} />
      )}
    </div>
  );
};

export default Home;
