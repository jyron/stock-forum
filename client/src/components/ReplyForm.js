import React, { useState } from 'react';
import { createComment } from '../services/commentService';
import { useAuth } from '../context/AuthContext';

const ReplyForm = ({ stockId, parentCommentId, onSubmit }) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Reply cannot be empty');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // We're now always using MongoDB ObjectIds for stockId
    const result = await createComment({
      content,
      stockId,
      parentCommentId,
      isAnonymous: !isAuthenticated() || isAnonymous
    });
    
    setLoading(false);
    
    if (result.success) {
      setContent('');
      if (onSubmit) onSubmit();
    } else {
      if (result.error === 'Unauthorized' || result.error?.includes('not authorized')) {
        setError('Please sign in to get the full commenting experience!');
      } else {
        setError(result.error || 'Failed to submit reply');
      }
    }
  };

  return (
    <div className="reply-form">
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            className="form"
            placeholder="Write your reply..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="3"
          ></textarea>
        </div>
        
        {isAuthenticated() && (
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id={`anonymousReplyCheck-${parentCommentId}`}
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <label className="form-check-label" htmlFor={`anonymousReplyCheck-${parentCommentId}`}>
              Reply anonymously
            </label>
          </div>
        )}
        
        {!isAuthenticated() && (
          <div className="alert alert-info mb-3 small">
            <strong>Replying as anonymous.</strong> <a href="/login">Sign in</a> to track your comments and join the discussion!
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Reply'}
        </button>
      </form>
    </div>
  );
};

export default ReplyForm;
