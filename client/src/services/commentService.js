import api from "./api";

// Get all comments for a stock
export const getStockComments = async (stockId) => {
  try {
    const res = await api.get(`/api/comments/stock/${stockId}`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch comments",
    };
  }
};

// Create a new comment
export const createComment = async (commentData) => {
  try {
    const dataToSend = {
      content: commentData.content,
      stockId: commentData.stockId,
      isAnonymous: commentData.isAnonymous || false,
    };

    // Add parentCommentId if it's a reply
    if (commentData.parentCommentId) {
      dataToSend.parentCommentId = commentData.parentCommentId;
    }

    const res = await api.post("/api/comments", dataToSend);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create comment",
    };
  }
};

// Update a comment
export const updateComment = async (id, content) => {
  try {
    const res = await api.put(`/api/comments/${id}`, { content });
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update comment",
    };
  }
};

// Delete a comment
export const deleteComment = async (id) => {
  try {
    const res = await api.delete(`/api/comments/${id}`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete comment",
    };
  }
};

// Like a comment
export const likeComment = async (id) => {
  try {
    const res = await api.post(`/api/comments/${id}/like`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Error liking comment:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to like comment",
    };
  }
};

// Dislike a comment
export const dislikeComment = async (id) => {
  try {
    const res = await api.post(`/api/comments/${id}/dislike`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Error disliking comment:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to dislike comment",
    };
  }
};
