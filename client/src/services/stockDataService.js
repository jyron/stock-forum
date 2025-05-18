/**
 * Stock Data Service
 * 
 * Provides functions for interacting with the stock data API endpoints,
 * including fetching, searching, and importing S&P 500 stock data.
 */

import axios from 'axios';

// Configure axios to use the backend server URL
axios.defaults.baseURL = 'http://localhost:5000';

/**
 * Get all stock data with optional search filtering
 * 
 * @param {string} searchTerm - Optional search term to filter stocks by symbol or name
 * @returns {Object} - Response with success status and data or error message
 */
export const getAllStockData = async (searchTerm = '') => {
  try {
    const url = searchTerm 
      ? `/api/stock-data?search=${encodeURIComponent(searchTerm)}` 
      : '/api/stock-data';
      
    const res = await axios.get(url);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch stock data'
    };
  }
};

/**
 * Get stock data for a specific symbol
 * 
 * @param {string} symbol - Stock symbol to fetch data for
 * @returns {Object} - Response with success status and data or error message
 */
export const getStockDataBySymbol = async (symbol) => {
  try {
    const res = await axios.get(`/api/stock-data/${symbol}`);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch stock data'
    };
  }
};

/**
 * Import S&P 500 stocks from the 12data API
 * 
 * @returns {Object} - Response with success status and import results or error message
 */
export const importSP500Stocks = async () => {
  try {
    const res = await axios.post('/api/stock-data/import-sp500');
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to import S&P 500 stocks'
    };
  }
};

/**
 * Update stock data for a specific symbol from the 12data API
 * 
 * @param {string} symbol - Stock symbol to update data for
 * @returns {Object} - Response with success status and updated data or error message
 */
export const updateStockData = async (symbol) => {
  try {
    const res = await axios.put(`/api/stock-data/${symbol}/update`);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update stock data'
    };
  }
};
