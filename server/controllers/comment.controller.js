/**
 * Comment Controller
 *
 * Handles all comment-related operations including creating, updating, and deleting comments,
 * as well as managing replies and like/dislike functionality.
 */

const Comment = require("../models/comment.model");
const Stock = require("../models/stock.model");
const mongoose = require("mongoose");

// Helper function to check if a user has already liked/disliked a comment
const hasUserVoted = async (commentId, userId, type) => {
  const comment = await Comment.findById(commentId);
  if (!comment) return false;

  if (type === "like") {
    return (
      comment.likedBy.includes(userId) ||
      comment.likedByAnonymous.includes(userId)
    );
  }

  return (
    comment.dislikedBy.includes(userId) ||
    comment.dislikedByAnonymous.includes(userId)
  );
};

/**
 * Get all comments for a stock
 *
 * Retrieves top-level comments (not replies) for a specific stock,
 * with populated author information and nested replies.
 *
 * @param {Object} req - Express request object with stockId parameter
 * @param {Object} res - Express response object
 * @returns {Array} - List of comments with their replies
 */
exports.getStockComments = async (req, res) => {
  try {
    const { stockId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(stockId)) {
      return res.status(400).json({ message: "Invalid stock ID format" });
    }

    // Find the stock by MongoDB ID
    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    // Get all comments for this stock (both top-level and replies)
    const allComments = await Comment.find({ stock: stock._id })
      .sort({ createdAt: -1 })
      .populate("author", "username")
      .lean();

    // Organize comments into a hierarchy
    const commentMap = {};
    const topLevelComments = [];

    // First pass: create a map of all comments
    allComments.forEach((comment) => {
      comment.replies = [];
      commentMap[comment._id.toString()] = comment;
    });

    // Second pass: organize into hierarchy
    allComments.forEach((comment) => {
      if (comment.parentComment) {
        const parentId = comment.parentComment.toString();
        const parent = commentMap[parentId];
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    });

    // Sort replies by creation date (oldest first for better conversation flow)
    topLevelComments.forEach((comment) => {
      comment.replies.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    });

    res.status(200).json(topLevelComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a new comment
 *
 * Creates a new comment or reply for a stock.
 * Handles both top-level comments and replies to existing comments.
 * Supports anonymous commenting.
 *
 * @param {Object} req - Express request object with content, stockId, and optional parentCommentId
 * @param {Object} res - Express response object
 * @returns {Object} - Created comment details
 */
exports.createComment = async (req, res) => {
  try {
    const { content, stockId, parentCommentId, isAnonymous } = req.body;

    // Validate required fields
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    if (!stockId) {
      return res.status(400).json({ message: "Stock ID is required" });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(stockId)) {
      return res.status(400).json({ message: "Invalid stock ID format" });
    }

    // Check if stock exists
    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    // If it's a reply, validate parent comment
    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        return res
          .status(400)
          .json({ message: "Invalid parent comment ID format" });
      }

      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }

      // Ensure parent comment belongs to the same stock
      if (parentComment.stock.toString() !== stockId) {
        return res
          .status(400)
          .json({ message: "Parent comment does not belong to this stock" });
      }
    }

    // Create comment object
    const commentData = {
      content: content.trim(),
      stock: stockId,
      isReply: !!parentCommentId,
      isAnonymous: !!isAnonymous || !req.userId,
    };

    // Add parent comment reference if it's a reply
    if (parentCommentId) {
      commentData.parentComment = parentCommentId;
    }

    // Add author if user is authenticated and not posting anonymously
    if (req.userId && !isAnonymous) {
      commentData.author = req.userId;
    } else {
      // For anonymous comments, generate a session-based ID
      const sessionId = req.sessionID || req.ip || "anonymous_" + Date.now();
      commentData.anonymousAuthorId = sessionId;
    }

    const comment = new Comment(commentData);
    await comment.save();

    // Populate author information before sending response
    await comment.populate("author", "username");

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a comment
 *
 * Updates the content of an existing comment.
 * Only allows the author to update their own comments.
 *
 * @param {Object} req - Express request object with comment ID and updated content
 * @param {Object} res - Express response object
 * @returns {Object} - Updated comment details
 */
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid comment ID format" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author (only authenticated users can update)
    if (
      !req.userId ||
      !comment.author ||
      comment.author.toString() !== req.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment" });
    }

    comment.content = content.trim();
    await comment.save();

    await comment.populate("author", "username");

    res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a comment
 *
 * Deletes a comment and all its replies if it's a parent comment.
 * Only allows the author to delete their own comments.
 *
 * @param {Object} req - Express request object with comment ID
 * @param {Object} res - Express response object
 * @returns {Object} - Success message
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid comment ID format" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author (only authenticated users can delete)
    if (
      !req.userId ||
      !comment.author ||
      comment.author.toString() !== req.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // Delete all replies if it's a parent comment
    if (!comment.isReply) {
      await Comment.deleteMany({ parentComment: id });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(id);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Like a comment
 *
 * Adds a like to a comment and removes any existing dislike from the same user.
 * Prevents duplicate likes from the same user.
 * Supports both authenticated and anonymous users.
 *
 * @param {Object} req - Express request object with comment ID
 * @param {Object} res - Express response object
 * @returns {Object} - Updated like/dislike counts
 */
exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid comment ID format" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Get user identifier (authenticated user ID or anonymous session)
    let userIdentifier;
    let isAuthenticated = false;

    if (req.userId) {
      userIdentifier = req.userId;
      isAuthenticated = true;
    } else {
      // For anonymous users, use session ID or IP
      userIdentifier = req.sessionID || req.ip || "anonymous_" + Date.now();
    }

    const userIdString = userIdentifier.toString();

    // Initialize arrays if they don't exist
    if (!comment.likedBy) comment.likedBy = [];
    if (!comment.dislikedBy) comment.dislikedBy = [];
    if (!comment.likedByAnonymous) comment.likedByAnonymous = [];
    if (!comment.dislikedByAnonymous) comment.dislikedByAnonymous = [];

    // Check if user already liked this comment
    const alreadyLiked = isAuthenticated
      ? comment.likedBy.some((id) => id.toString() === userIdString)
      : comment.likedByAnonymous.includes(userIdString);

    if (alreadyLiked) {
      return res
        .status(400)
        .json({ message: "You already liked this comment" });
    }

    // Remove from dislike arrays if previously disliked
    const previouslyDisliked = isAuthenticated
      ? comment.dislikedBy.some((id) => id.toString() === userIdString)
      : comment.dislikedByAnonymous.includes(userIdString);

    if (previouslyDisliked) {
      if (isAuthenticated) {
        comment.dislikedBy = comment.dislikedBy.filter(
          (id) => id.toString() !== userIdString
        );
      } else {
        comment.dislikedByAnonymous = comment.dislikedByAnonymous.filter(
          (id) => id !== userIdString
        );
      }
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    }

    // Add like
    if (isAuthenticated) {
      comment.likedBy.push(userIdentifier);
    } else {
      comment.likedByAnonymous.push(userIdString);
    }
    comment.likes += 1;

    await comment.save();

    res.status(200).json({
      message: "Comment liked successfully",
      likes: comment.likes,
      dislikes: comment.dislikes,
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Dislike a comment
 *
 * Adds a dislike to a comment and removes any existing like from the same user.
 * Prevents duplicate dislikes from the same user.
 * Supports both authenticated and anonymous users.
 *
 * @param {Object} req - Express request object with comment ID
 * @param {Object} res - Express response object
 * @returns {Object} - Updated like/dislike counts
 */
exports.dislikeComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid comment ID format" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Get user identifier (authenticated user ID or anonymous session)
    let userIdentifier;
    let isAuthenticated = false;

    if (req.userId) {
      userIdentifier = req.userId;
      isAuthenticated = true;
    } else {
      // For anonymous users, use session ID or IP
      userIdentifier = req.sessionID || req.ip || "anonymous_" + Date.now();
    }

    const userIdString = userIdentifier.toString();

    // Initialize arrays if they don't exist
    if (!comment.likedBy) comment.likedBy = [];
    if (!comment.dislikedBy) comment.dislikedBy = [];
    if (!comment.likedByAnonymous) comment.likedByAnonymous = [];
    if (!comment.dislikedByAnonymous) comment.dislikedByAnonymous = [];

    // Check if user already disliked this comment
    const alreadyDisliked = isAuthenticated
      ? comment.dislikedBy.some((id) => id.toString() === userIdString)
      : comment.dislikedByAnonymous.includes(userIdString);

    if (alreadyDisliked) {
      return res
        .status(400)
        .json({ message: "You already disliked this comment" });
    }

    // Remove from like arrays if previously liked
    const previouslyLiked = isAuthenticated
      ? comment.likedBy.some((id) => id.toString() === userIdString)
      : comment.likedByAnonymous.includes(userIdString);

    if (previouslyLiked) {
      if (isAuthenticated) {
        comment.likedBy = comment.likedBy.filter(
          (id) => id.toString() !== userIdString
        );
      } else {
        comment.likedByAnonymous = comment.likedByAnonymous.filter(
          (id) => id !== userIdString
        );
      }
      comment.likes = Math.max(0, comment.likes - 1);
    }

    // Add dislike
    if (isAuthenticated) {
      comment.dislikedBy.push(userIdentifier);
    } else {
      comment.dislikedByAnonymous.push(userIdString);
    }
    comment.dislikes += 1;

    await comment.save();

    res.status(200).json({
      message: "Comment disliked successfully",
      likes: comment.likes,
      dislikes: comment.dislikes,
    });
  } catch (error) {
    console.error("Error disliking comment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
