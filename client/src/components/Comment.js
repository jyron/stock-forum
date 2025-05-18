import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { likeComment, dislikeComment, deleteComment } from '../services/commentService';
import ReplyForm from './ReplyForm';

const Comment = ({ comment = {}, stockId, onUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  
  const isAuthor = user && comment.author && (comment.author._id === user.id || comment.author.id === user.id);
  const isLiked = user && comment.likedBy?.includes(user.id);
  const isDisliked = user && comment.dislikedBy?.includes(user.id);
  
  if (!comment._id) {
    return null; // Return null if we don't have a valid comment
  }
  
  const handleLike = async () => {
    if (!isAuthenticated()) {
      alert('Please login to like comments');
      return;
    }
    
    if (!comment._id) {
      console.error('Comment ID is undefined');
      return;
    }
    
    const result = await likeComment(comment._id);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };
  
  const handleDislike = async () => {
    if (!isAuthenticated()) {
      alert('Please login to dislike comments');
      return;
    }
    
    if (!comment._id) {
      console.error('Comment ID is undefined');
      return;
    }
    
    const result = await dislikeComment(comment._id);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const result = await deleteComment(comment._id);
      if (result.success && onUpdate) {
        onUpdate();
      }
    }
  };
  
  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="comment">
      <div className="comment-header">
        {comment.author && <div className="comment-author">{comment.author.username || 'Anonymous'}</div>}
        <span className="comment-date">{formatDate(comment.createdAt)}</span>
      </div>
      
      <div className="comment-content">
        {comment.content}
      </div>
      
      <div className="comment-footer">
        <div className="comment-actions">
          {isAuthenticated() && (
            <>
              <button className="btn btn-secondary" onClick={toggleReplyForm}>
                Reply
              </button>
              {isAuthor && (
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="comment-stats">
          <button 
            className={`vote-btn ${isLiked ? 'active' : ''}`} 
            onClick={handleLike}
          >
            👍 {comment.likes || 0}
          </button>
          <button 
            className={`vote-btn ${isDisliked ? 'active' : ''}`} 
            onClick={handleDislike}
          >
            👎 {comment.dislikes || 0}
          </button>
        </div>
      </div>
      
      {showReplyForm && (
        <ReplyForm 
          stockId={stockId} 
          parentCommentId={comment._id} 
          onSubmit={() => {
            setShowReplyForm(false);
            onUpdate();
          }}
        />
      )}
      
      {comment.replies?.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(reply => (
            <Comment 
              key={reply._id} 
              comment={reply} 
              stockId={stockId} 
              onUpdate={onUpdate} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
