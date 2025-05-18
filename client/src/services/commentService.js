import axios from 'axios';

// Configure axios to use the backend server URL
axios.defaults.baseURL = 'http://localhost:5000';

// Get all comments for a stock
export const getStockComments = async (stockId) => {
  try {
    // Always use the stock's database ID
    const res = await axios.get(`/api/comments/stock/${stockId}`);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch comments'
    };
  }
};

// Create a new comment
export const createComment = async (commentData) => {
  try {
    // Ensure isAnonymous is included in the request
    const dataToSend = {
      ...commentData,
      isAnonymous: commentData.isAnonymous || false
    };
    
    const res = await axios.post('/api/comments', dataToSend);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create comment'
    };
  }
};

// Update a comment
export const updateComment = async (id, content) => {
  try {
    const res = await axios.put(`/api/comments/${id}`, { content });
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update comment'
    };
  }
};

// Delete a comment
export const deleteComment = async (id) => {
  try {
    const res = await axios.delete(`/api/comments/${id}`);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete comment'
    };
  }
};

// Like a comment
export const likeComment = async (id) => {
  try {
    const res = await axios.post(`/api/comments/${id}/like`);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to like comment'
    };
  }
};

// Dislike a comment
export const dislikeComment = async (id) => {
  try {
    const res = await axios.post(`/api/comments/${id}/dislike`);
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to dislike comment'
    };
  }
};
