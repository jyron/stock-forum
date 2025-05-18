import axios from 'axios';

// Configure axios to use the backend server URL
axios.defaults.baseURL = 'http://localhost:5000';

// Get all stocks
export const getAllStocks = async () => {
  try {
    const res = await axios.get('/api/stocks');
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch stocks'
    };
  }
};

// Get stock by ID
export const getStockById = async (id) => {
  try {
    const res = await axios.get(`/api/stocks/${id}`);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch stock'
    };
  }
};

// Get stock by symbol (for client-side display only)
export const getStockBySymbol = async (symbol) => {
  try {
    const res = await axios.get(`/api/stocks/symbol/${symbol}`);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch stock'
    };
  }
};

// Create a new stock
export const createStock = async (stockData) => {
  try {
    const res = await axios.post('/api/stocks', stockData);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create stock'
    };
  }
};

// Update a stock
export const updateStock = async (id, stockData) => {
  try {
    const res = await axios.put(`/api/stocks/${id}`, stockData);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update stock'
    };
  }
};

// Delete a stock
export const deleteStock = async (id) => {
  try {
    const res = await axios.delete(`/api/stocks/${id}`);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete stock'
    };
  }
};

// Like a stock
export const likeStock = async (id) => {
  try {
    const res = await axios.post(`/api/stocks/${id}/like`);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to like stock'
    };
  }
};

// Dislike a stock
export const dislikeStock = async (id) => {
  try {
    const res = await axios.post(`/api/stocks/${id}/dislike`);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to dislike stock'
    };
  }
};
