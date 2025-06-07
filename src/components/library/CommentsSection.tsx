import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useChakra } from '../../context/ChakraContext';
import { LibraryComment } from '../../types';
import { MessageSquare, Send, Heart, Smile, MoreHorizontal, Trash2, Clock } from 'lucide-react';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
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
  
  const handleLikeComment = (commentId: string) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };
  
  const addEmoji = (emoji: string) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  // Simple emoji picker
  const emojis = ['✨', '💫', '🌟', '🔮', '🧿', '🌈', '💖', '🌙', '🌞', '🌊', '🔥', '🌱', '🧘‍♀️', '🙏', '🕉️'];
  
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
            
            <div className="absolute right-2 bottom-2 flex">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-full text-gray-400 hover:text-white mr-1"
              >
                <Smile size={16} />
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: chakraState.color,
                  color: 'white'
                }}
              >
                <Send size={16} />
              </button>
            </div>
            
            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="absolute right-0 bottom-12 bg-dark-100 p-2 rounded-lg border border-dark-300 shadow-lg z-10">
                <div className="grid grid-cols-5 gap-1">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-dark-300 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
      
      {/* Comments list */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              isLiked={likedComments[comment.id] || false}
              onLike={() => handleLikeComment(comment.id)}
            />
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
  isLiked: boolean;
  onLike: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, isLiked, onLike }) => {
  const { chakraState } = useChakra();
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  
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
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <span 
              className="font-medium text-white mr-2"
              style={{ color: isCurrentUser ? chakraState.color : undefined }}
            >
              {comment.user?.display_name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-400 flex items-center">
              <Clock size={10} className="mr-1" />
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          
          {isCurrentUser && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-400 hover:text-white"
              >
                <MoreHorizontal size={16} />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 mt-1 w-32 bg-dark-100 rounded-md shadow-lg py-1 z-10 border border-dark-300">
                  <button
                    className="flex w-full items-center px-3 py-1 text-xs text-red-400 hover:bg-dark-300"
                    onClick={() => {
                      // Delete comment functionality would go here
                      setShowOptions(false);
                    }}
                  >
                    <Trash2 size={12} className="mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div 
          className="p-3 rounded-lg text-gray-300"
          style={{ backgroundColor: isCurrentUser ? `${chakraState.color}15` : 'rgba(255,255,255,0.05)' }}
        >
          {comment.content}
        </div>
        
        <div className="flex items-center mt-2">
          <button
            onClick={onLike}
            className={`flex items-center text-xs ${
              isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
            }`}
          >
            <Heart size={12} className="mr-1" fill={isLiked ? 'currentColor' : 'none'} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>
          
          <button
            className="flex items-center text-xs text-gray-400 hover:text-white ml-4"
            onClick={() => {
              // Reply functionality would go here
            }}
          >
            <MessageSquare size={12} className="mr-1" />
            <span>Reply</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentsSection;