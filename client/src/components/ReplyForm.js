import React, { useState } from "react";
import { createComment } from "../services/commentService";
import { useAuth } from "../context/AuthContext";

const ReplyForm = ({ stockId, parentCommentId, onSubmit }) => {
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    if (!stockId || !parentCommentId) {
      setError("Missing required information");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createComment({
        content: content.trim(),
        stockId,
        parentCommentId,
        isAnonymous: !isAuthenticated() || isAnonymous,
      });

      if (result.success) {
        setContent("");
        setIsAnonymous(false);
        if (onSubmit) onSubmit();
      } else {
        setError(result.error || "Failed to submit reply");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      setError("Failed to submit reply");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    setError("");
    if (onSubmit) onSubmit();
  };

  return (
    <div className="reply-form">
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            className="form-control"
            rows="3"
            placeholder={
              isAuthenticated()
                ? "Write your reply..."
                : "Write your reply (posting anonymously)..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            maxLength={500}
            autoFocus
          />
          <small className="form-text text-muted">
            {content.length}/500 characters
          </small>
        </div>

        {isAuthenticated() && (
          <div className="form-group form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id={`anonymousReply-${parentCommentId}`}
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={loading}
            />
            <label
              className="form-check-label"
              htmlFor={`anonymousReply-${parentCommentId}`}
            >
              Reply anonymously
            </label>
          </div>
        )}

        {!isAuthenticated() && (
          <div className="alert alert-info">
            <small>
              💡 Replying as a guest. <a href="/login">Sign in</a> for the full
              experience!
            </small>
          </div>
        )}

        <div className="form-group reply-actions">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>{" "}
                Posting...
              </>
            ) : (
              <>
                💬 Post Reply
                {(!isAuthenticated() || isAnonymous) && " (Anonymous)"}
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm ml-2"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyForm;
