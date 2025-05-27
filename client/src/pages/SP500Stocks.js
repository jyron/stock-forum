import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStocks, importSP500Stocks } from '../services/stockService';
import { useAuth } from '../context/AuthContext';

const SP500Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();

  const fetchStockData = async (search = '') => {
    setLoading(true);
    setError('');
    
    const result = await getAllStockData(search);
    
    if (result.success) {
      setStockData(result.data);
    } else {
      setError(result.error || 'Failed to fetch stock data');
    }
    
    setLoading(false);
  };

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Fetch data when debounced search term changes
  useEffect(() => {
    fetchStockData(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handleImportSP500 = async () => {
    if (!isAuthenticated()) {
      setError('Please login to import S&P 500 stocks');
      return;
    }
    
    setImporting(true);
    setError('');
    setSuccess('');
    
    const result = await importSP500Stocks();
    
    setImporting(false);
    
    if (result.success) {
      setSuccess(`Import completed: ${result.data.importedCount} stocks imported, ${result.data.skippedCount} skipped, ${result.data.errorCount} errors`);
      fetchStockData();
    } else {
      setError(result.error || 'Failed to import S&P 500 stocks');
    }
  };

  // We're now using server-side filtering instead of client-side filtering

  return (
    <div className="sp500-page">
      <h1>S&P 500 Stocks</h1>
      <p>View all stocks in the S&P 500 index with their latest prices and performance data.</p>
      
      <div className="sp500-actions">
        {isAuthenticated() ? (
          <button 
            className="btn btn-primary" 
            onClick={handleImportSP500}
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Import S&P 500 Stocks'}
          </button>
        ) : (
          <p>Please <Link to="/login">login</Link> to import S&P 500 stocks</p>
        )}
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by symbol or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {loading ? (
        <div className="loading">Loading stock data...</div>
      ) : stockData.length === 0 ? (
        <div className="alert alert-info">
          {searchTerm 
            ? 'No stocks match your search criteria' 
            : 'No S&P 500 stock data available. Click the Import button to fetch stock data.'}
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map(stock => (
                <tr key={stock.symbol} className={parseFloat(stock.percentChange) >= 0 ? 'positive' : 'negative'}>
                  <td className="stock-symbol">{stock.symbol}</td>
                  <td>{stock.name}</td>
                  <td>${stock.close?.toFixed(2) || 'N/A'}</td>
                  <td className={parseFloat(stock.percentChange) >= 0 ? 'positive-change' : 'negative-change'}>
                    {stock.percentChange ? `${parseFloat(stock.percentChange).toFixed(2)}%` : 'N/A'}
                  </td>
                  <td>
                    <Link to={`/stocks/${stock.symbol}`} className="btn btn-sm btn-primary">
                      View
                    </Link>
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

export default SP500Stocks;
