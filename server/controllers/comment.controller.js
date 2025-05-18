/**
 * Comment Controller
 * 
 * Handles all comment-related operations including creating, updating, and deleting comments,
 * as well as managing replies and like/dislike functionality.
 */

const Comment = require('../models/comment.model');
const StockData = require('../models/stockData.model');

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
    
    // Find the stock by MongoDB ID only
    let stock;
    try {
      stock = await StockData.findById(stockId);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid stock ID format' });
    }
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    // Get only top-level comments (not replies)
    const comments = await Comment.find({
      stock: stock._id,
      isReply: false
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username'
        }
      });
    
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new comment
 * 
 * Creates a new comment or reply for a stock.
 * Handles both top-level comments and replies to existing comments.
 * 
 * @param {Object} req - Express request object with content, stockId, and optional parentCommentId
 * @param {Object} res - Express response object
 * @returns {Object} - Created comment details
 */
exports.createComment = async (req, res) => {
  try {
    const { content, stockId, parentCommentId, isAnonymous } = req.body;
    
    // Check if stock exists by ID only
    let stock;
    try {
      stock = await StockData.findById(stockId);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid stock ID format' });
    }
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    // Create comment object
    const commentData = {
      content,
      stock: stock._id, // Always use the stock's database ID
      isReply: !!parentCommentId,
      isAnonymous: !!isAnonymous
    };
    
    // Add author if user is authenticated
    if (req.userId) {
      commentData.author = req.userId;
    }
    // If it's anonymous but we have a user ID, still mark it as anonymous
    // but we know who posted it internally
    
    // If it's a reply, add parent comment reference
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      commentData.parentComment = parentCommentId;
    }
    
    const comment = new Comment(commentData);
    await comment.save();
    
    // Populate author information before sending response
    await comment.populate('author', 'username');
    
    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
    
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    comment.content = content;
    await comment.save();
    
    res.status(200).json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Delete all replies if it's a parent comment
    if (!comment.isReply) {
      await Comment.deleteMany({ parentComment: req.params.id });
    }
    
    // Delete the comment
    await Comment.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Like a comment
 * 
 * Adds a like to a comment and removes any existing dislike from the same user.
 * Prevents duplicate likes from the same user.
 * 
 * @param {Object} req - Express request object with comment ID
 * @param {Object} res - Express response object
 * @returns {Object} - Updated like/dislike counts
 */
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Get client IP or session ID to track likes/dislikes
    const clientIdentifier = req.ip || 'anonymous';
    
    // For authenticated users, use their ID
    const userIdentifier = req.userId || clientIdentifier;
    
    // We'll store IDs as strings for consistency
    const userIdString = userIdentifier.toString();
    
    // Initialize arrays if they don't exist
    if (!comment.likedBy) comment.likedBy = [];
    if (!comment.dislikedBy) comment.dislikedBy = [];
    
    // Check if user/client already liked this comment
    if (comment.likedBy.some(id => id.toString() === userIdString)) {
      return res.status(400).json({ message: 'You already liked this comment' });
    }
    
    // Remove user/client from dislikedBy if they previously disliked
    if (comment.dislikedBy.some(id => id.toString() === userIdString)) {
      comment.dislikedBy = comment.dislikedBy.filter(
        id => id.toString() !== userIdString
      );
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    }
    
    // Add like
    comment.likedBy.push(userIdString);
    comment.likes += 1;
    
    await comment.save();
    
    res.status(200).json({
      message: 'Comment liked successfully',
      likes: comment.likes,
      dislikes: comment.dislikes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Dislike a comment
 * 
 * Adds a dislike to a comment and removes any existing like from the same user.
 * Prevents duplicate dislikes from the same user.
 * 
 * @param {Object} req - Express request object with comment ID
 * @param {Object} res - Express response object
 * @returns {Object} - Updated like/dislike counts
 */
exports.dislikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Get client IP or session ID to track likes/dislikes
    const clientIdentifier = req.ip || 'anonymous';
    
    // For authenticated users, use their ID
    const userIdentifier = req.userId || clientIdentifier;
    
    // We'll store IDs as strings for consistency
    const userIdString = userIdentifier.toString();
    
    // Initialize arrays if they don't exist
    if (!comment.likedBy) comment.likedBy = [];
    if (!comment.dislikedBy) comment.dislikedBy = [];
    
    // Check if user/client already disliked this comment
    if (comment.dislikedBy.some(id => id.toString() === userIdString)) {
      return res.status(400).json({ message: 'You already disliked this comment' });
    }
    
    // Remove user/client from likedBy if they previously liked
    if (comment.likedBy.some(id => id.toString() === userIdString)) {
      comment.likedBy = comment.likedBy.filter(
        id => id.toString() !== userIdString
      );
      comment.likes = Math.max(0, comment.likes - 1);
    }
    
    // Add dislike
    comment.dislikedBy.push(userIdString);
    comment.dislikes += 1;
    
    await comment.save();
    
    res.status(200).json({
      message: 'Comment disliked successfully',
      likes: comment.likes,
      dislikes: comment.dislikes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
