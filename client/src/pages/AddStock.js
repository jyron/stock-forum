import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStock } from '../services/stockService';

const AddStock = () => {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    description: '',
    currentPrice: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const { symbol, name, description, currentPrice } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!symbol || !name) {
      setError('Symbol and name are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const stockData = {
      ...formData,
      currentPrice: currentPrice ? parseFloat(currentPrice) : null
    };
    
    const result = await createStock(stockData);
    
    setLoading(false);
    
    if (result.success) {
      navigate(`/stocks/${result.data.stock._id}`);
    } else {
      setError(result.error || 'Failed to create stock');
    }
  };
  
  return (
    <div className="add-stock">
      <h1>Add New Stock</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="symbol">Stock Symbol</label>
          <input
            type="text"
            name="symbol"
            id="symbol"
            value={symbol}
            onChange={handleChange}
            placeholder="e.g. AAPL"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Company Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={handleChange}
            placeholder="e.g. Apple Inc."
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id="description"
            value={description}
            onChange={handleChange}
            placeholder="Brief description of the company"
            rows="4"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="currentPrice">Current Price ($)</label>
          <input
            type="number"
            name="currentPrice"
            id="currentPrice"
            value={currentPrice}
            onChange={handleChange}
            placeholder="e.g. 150.50"
            step="0.01"
            min="0"
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Adding Stock...' : 'Add Stock'}
        </button>
      </form>
    </div>
  );
};

export default AddStock;
