import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  likeComment,
  dislikeComment,
  deleteComment,
} from "../services/commentService";
import ReplyForm from "./ReplyForm";

const Comment = ({ comment = {}, stockId, onUpdate, isReply = false }) => {
  const { user, isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);

  // Check if current user is the author
  const isAuthor =
    user &&
    comment.author &&
    (comment.author._id === user.id ||
      comment.author.id === user.id ||
      comment.author._id === user._id ||
      comment.author.id === user._id);

  // Check if user has liked/disliked (for authenticated users)
  const isLiked =
    user &&
    comment.likedBy?.some(
      (id) =>
        id === user.id ||
        id === user._id ||
        id.toString() === user.id ||
        id.toString() === user._id
    );
  const isDisliked =
    user &&
    comment.dislikedBy?.some(
      (id) =>
        id === user.id ||
        id === user._id ||
        id.toString() === user.id ||
        id.toString() === user._id
    );

  if (!comment._id) {
    return null; // Return null if we don't have a valid comment
  }

  const handleLike = async () => {
    try {
      const result = await likeComment(comment._id);
      if (result.success && onUpdate) {
        onUpdate();
      } else if (result.error) {
        console.error("Error liking comment:", result.error);
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDislike = async () => {
    try {
      const result = await dislikeComment(comment._id);
      if (result.success && onUpdate) {
        onUpdate();
      } else if (result.error) {
        console.error("Error disliking comment:", result.error);
      }
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      const result = await deleteComment(comment._id);
      if (result.success && onUpdate) {
        onUpdate();
      } else if (result.error) {
        alert("Error deleting comment: " + result.error);
      }
    }
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getAuthorName = () => {
    if (comment.isAnonymous) {
      return "Anonymous";
    }
    if (comment.author && comment.author.username) {
      return comment.author.username;
    }
    return "Anonymous";
  };

  return (
    <div className={`comment ${isReply ? "comment-reply" : ""}`}>
      <div className="comment-header">
        <div className="comment-author">
          {getAuthorName()}
          {comment.isAnonymous && <span className="anonymous-badge">👤</span>}
        </div>
        <div className="comment-date">{formatDate(comment.createdAt)}</div>
      </div>

      <div className="comment-content">💭 {comment.content}</div>

      <div className="comment-footer">
        <div className="comment-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={toggleReplyForm}
            title="Reply to this comment"
          >
            💬 Reply
          </button>

          {isAuthor && isAuthenticated() && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              title="Delete this comment"
            >
              🗑️ Delete
            </button>
          )}
        </div>

        <div className="comment-stats">
          <button
            className={`vote-btn ${isLiked ? "active liked" : ""}`}
            onClick={handleLike}
            title="Like this comment"
          >
            👍 {comment.likes || 0}
          </button>
          <button
            className={`vote-btn ${isDisliked ? "active disliked" : ""}`}
            onClick={handleDislike}
            title="Dislike this comment"
          >
            👎 {comment.dislikes || 0}
          </button>
        </div>
      </div>

      {showReplyForm && (
        <div className="reply-form-container">
          <ReplyForm
            stockId={stockId}
            parentCommentId={comment._id}
            onSubmit={() => {
              setShowReplyForm(false);
              if (onUpdate) onUpdate();
            }}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          <div className="replies-header">
            <span className="replies-count">
              {comment.replies.length}{" "}
              {comment.replies.length === 1 ? "reply" : "replies"}
            </span>
          </div>
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              stockId={stockId}
              onUpdate={onUpdate}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
