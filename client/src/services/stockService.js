import api from "./api";

// Get all stocks
export const getAllStocks = async (searchTerm = "") => {
  try {
    console.log("Search term in service:", searchTerm);
    // Always include the search parameter, even if empty
    const params = { search: searchTerm };
    const res = await api.get("/api/stocks", { params });
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Error in getAllStocks:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch stocks",
    };
  }
};

// Get stock by ID
export const getStockById = async (id) => {
  try {
    const res = await api.get(`/api/stocks/${id}`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch stock",
    };
  }
};

// Get stock by symbol
export const getStockBySymbol = async (symbol) => {
  try {
    const res = await api.get(`/api/stocks/symbol/${symbol}`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch stock",
    };
  }
};

// Create a new stock
export const createStock = async (stock) => {
  try {
    const res = await api.post("/api/stocks", stock);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create stock",
    };
  }
};

// Update a stock
export const updateStock = async (id, stock) => {
  try {
    const res = await api.put(`/api/stocks/${id}`, stock);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update stock",
    };
  }
};

// Delete a stock
export const deleteStock = async (id) => {
  try {
    const res = await api.delete(`/api/stocks/${id}`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete stock",
    };
  }
};

// Like a stock
export const likeStock = async (id) => {
  try {
    const res = await api.post(`/api/stocks/${id}/like`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to like stock",
    };
  }
};

// Dislike a stock
export const dislikeStock = async (id) => {
  try {
    const res = await api.post(`/api/stocks/${id}/dislike`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to dislike stock",
    };
  }
};
