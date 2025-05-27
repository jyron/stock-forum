import api from "./api";

// Get all stock data (for SP500 stocks)
export const getAllStockData = async (searchTerm = "") => {
  try {
    const params = searchTerm ? { search: searchTerm } : {};
    const res = await api.get("/api/stocks", { params });
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch stock data",
    };
  }
};

// Get stock data by symbol
export const getStockDataBySymbol = async (symbol) => {
  try {
    const res = await api.get(`/api/stocks/symbol/${symbol}`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch stock data",
    };
  }
};

// Import SP500 stocks (placeholder function)
export const importSP500Stocks = async () => {
  try {
    // This would typically call a backend endpoint to import SP500 data
    // For now, return a success message
    return {
      success: true,
      data: {
        importedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        message: "Import functionality not implemented yet",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to import SP500 stocks",
    };
  }
};
