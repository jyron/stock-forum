import React, { useState } from 'react';
import { createComment } from '../services/commentService';
import { useAuth } from '../context/AuthContext';

const CommentForm = ({ stockId, onSubmit }) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // We're now always using MongoDB ObjectIds for stockId
    const result = await createComment({
      content,
      stockId,
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
        setError(result.error || 'Failed to submit comment');
      }
    }
  };

  return (
    <div className="comment-form">
      <h3>Add a Comment</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            className="form"
            placeholder="Write your comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
          ></textarea>
        </div>
        
        {isAuthenticated() && (
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="anonymousCheck"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="anonymousCheck">
              Post anonymously
            </label>
          </div>
        )}
        
        {!isAuthenticated() && (
          <div className="alert alert-info mb-3">
            <strong>Posting as anonymous.</strong> <a href="/login">Sign in</a> to track your comments, get notifications, and join our community!
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;
