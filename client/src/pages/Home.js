import React, { useState, useEffect } from 'react';
import StockCard from '../components/StockCard';
import { getAllStocks } from '../services/stockService';
import { getAllStockData, importSP500Stocks } from '../services/stockDataService';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [stocks, setStocks] = useState([]);
  const [sp500Stocks, setSP500Stocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();

  const fetchStocks = async () => {
    setLoading(true);
    setError('');
    
    // Fetch user-created stocks
    const stocksResult = await getAllStocks();
    
    // Fetch SP500 stocks with optional search term
    const sp500Result = await getAllStockData(debouncedSearchTerm);
    
    if (stocksResult.success && sp500Result.success) {
      setStocks(stocksResult.data);
      setSP500Stocks(sp500Result.data);
    } else {
      setError(stocksResult.error || sp500Result.error || 'Failed to fetch stocks');
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
    fetchStocks();
  }, [debouncedSearchTerm]);
  
  const handleImportSP500 = async () => {
    setImporting(true);
    setError('');
    setSuccess('');
    
    const result = await importSP500Stocks();
    
    setImporting(false);
    
    if (result.success) {
      setSuccess(`Import completed: ${result.data.importedCount} stocks imported, ${result.data.skippedCount} skipped, ${result.data.errorCount} errors`);
      fetchStocks();
    } else {
      setError(result.error || 'Failed to import S&P 500 stocks');
    }
  };

  // Combine all stocks for display
  const allStocks = [...sp500Stocks, ...stocks];
  
  return (
    <div className="home-page">
      <h1>Stock Forum</h1>
      <p>Discuss and rate your favorite stocks</p>
      
      <div className="sp500-actions">
        <button 
          className="btn btn-primary" 
          onClick={handleImportSP500}
          disabled={importing}
        >
          {importing ? 'Importing...' : 'Import S&P 500 Stocks'}
        </button>
        
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
        <div className="loading">Loading stocks...</div>
      ) : allStocks.length === 0 ? (
        <div className="alert alert-info">
          {searchTerm 
            ? 'No stocks match your search criteria' 
            : 'No stocks found. Click the Import button to fetch S&P 500 stocks.'}
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
              {allStocks.map(stock => (
                <tr key={stock._id || stock.symbol} className={stock.percentChange && parseFloat(stock.percentChange) >= 0 ? 'positive' : 'negative'}>
                  <td className="stock-symbol">{stock.symbol}</td>
                  <td>{stock.name}</td>
                  <td>${(stock.currentPrice || stock.close)?.toFixed(2) || 'N/A'}</td>
                  <td className={stock.percentChange && parseFloat(stock.percentChange) >= 0 ? 'positive-change' : 'negative-change'}>
                    {stock.percentChange !== undefined && stock.percentChange !== null ? 
                      `${parseFloat(stock.percentChange).toFixed(2)}%` : 
                      '0.00%'}
                  </td>
                  <td>
                    <a href={`/stocks/${stock.symbol}`} className="btn btn-sm btn-primary">
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
