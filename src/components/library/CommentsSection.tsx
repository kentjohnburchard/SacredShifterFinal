import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useChakra } from '../../context/ChakraContext';
import { LibraryComment } from '../../types';
import { MessageSquare, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentsSectionProps {
  itemId: string;
  comments: LibraryComment[];
  onAddComment: (content: string) => Promise<void>;
  className?: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  itemId,
  comments,
  onAddComment,
  className = ''
}) => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new comments arrive
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center mb-4">
        <MessageSquare size={18} className="mr-2" style={{ color: chakraState.color }} />
        <h3 className="text-lg font-medium text-white">Comments</h3>
        <span className="ml-2 text-sm text-gray-400">({comments.length})</span>
      </div>
      
      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex">
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-300 flex items-center justify-center">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.display_name || 'User'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your insights..."
              className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white focus:outline-none focus:ring-2 pr-12"
              style={{ focusRingColor: chakraState.color }}
              rows={2}
            ></textarea>
            
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="absolute right-2 bottom-2 p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: chakraState.color,
                color: 'white'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </form>
      
      {/* Comments list */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to share your insights!</p>
          </div>
        )}
        <div ref={commentsEndRef} />
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: LibraryComment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const { chakraState } = useChakra();
  const { user } = useAuth();
  
  const isCurrentUser = comment.user_id === user?.id;
  
  return (
    <motion.div
      className="flex"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 mr-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-300 flex items-center justify-center">
          {comment.user?.avatar_url ? (
            <img 
              src={comment.user.avatar_url} 
              alt={comment.user.display_name || 'User'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span 
            className="font-medium text-white mr-2"
            style={{ color: isCurrentUser ? chakraState.color : undefined }}
          >
            {comment.user?.display_name || 'Anonymous'}
          </span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        
        <div 
          className="p-3 rounded-lg text-gray-300"
          style={{ backgroundColor: isCurrentUser ? `${chakraState.color}15` : 'rgba(255,255,255,0.05)' }}
        >
          {comment.content}
        </div>
      </div>
    </motion.div>
  );
};

export default CommentsSection;