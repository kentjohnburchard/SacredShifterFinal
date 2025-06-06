import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChakra } from '../../context/ChakraContext';
import { CirclePost, CircleComment } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface CirclePostProps {
  post: CirclePost;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
}

const CirclePostComponent: React.FC<CirclePostProps> = ({
  post,
  onAddComment,
  onDeletePost,
  onDeleteComment
}) => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onAddComment(post.id, comment);
      setComment('');
      setIsCommenting(false);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isPostOwner = user?.id === post.user_id;
  
  return (
    <div className="bg-dark-200 rounded-2xl p-5 border border-dark-300 shadow-md mb-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-300 flex items-center justify-center mr-3">
            {post.user?.avatar_url ? (
              <img 
                src={post.user.avatar_url} 
                alt={post.user.display_name || 'User'} 
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
          
          <div>
            <div className="font-medium text-white">
              {post.user?.display_name || 'Anonymous'}
            </div>
            <div className="text-xs text-gray-400 flex items-center">
              <Clock size={12} className="mr-1" />
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        
        {isPostOwner && (
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-400 hover:text-gray-200"
            >
              <MoreHorizontal size={20} />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-1 w-40 bg-dark-100 rounded-md shadow-lg py-1 z-10 border border-dark-300">
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-dark-300"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this post?')) {
                      onDeletePost(post.id);
                    }
                    setShowOptions(false);
                  }}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-200 whitespace-pre-line">{post.content}</p>
      </div>
      
      {post.image_url && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img 
            src={post.image_url} 
            alt="Post attachment" 
            className="w-full h-auto"
          />
        </div>
      )}
      
      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-dark-300">
        <button className="flex items-center text-gray-400 hover:text-pink-500">
          <Heart size={18} className="mr-1" />
          <span className="text-sm">0</span>
        </button>
        
        <button 
          className="flex items-center text-gray-400 hover:text-gray-200"
          onClick={() => {
            setShowComments(!showComments);
            if (!showComments && !post.comments) {
              // Could fetch comments here if needed
            }
          }}
        >
          <MessageCircle size={18} className="mr-1" />
          <span className="text-sm">{post.comment_count || 0}</span>
        </button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-dark-300">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Comments</h4>
          
          <div className="space-y-3 mb-4">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onDelete={() => onDeleteComment(post.id, comment.id)} 
                />
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-2">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
          
          {!isCommenting ? (
            <button
              onClick={() => setIsCommenting(true)}
              className="text-sm text-gray-400 hover:text-white"
            >
              Add a comment...
            </button>
          ) : (
            <form onSubmit={handleSubmitComment} className="space-y-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                placeholder="Share your thoughts..."
                rows={3}
              ></textarea>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCommenting(false);
                    setComment('');
                  }}
                  className="px-3 py-1 text-xs text-gray-300 hover:text-gray-100"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="px-3 py-1 text-xs rounded-md disabled:opacity-50"
                  style={{ 
                    backgroundColor: chakraState.color,
                    color: 'white'
                  }}
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

interface CommentItemProps {
  comment: CircleComment;
  onDelete: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onDelete }) => {
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  const isCommentOwner = user?.id === comment.user_id;
  
  return (
    <motion.div 
      className="flex space-x-3 p-2 rounded-md hover:bg-dark-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-400 flex items-center justify-center">
          {comment.user?.avatar_url ? (
            <img 
              src={comment.user.avatar_url} 
              alt={comment.user.display_name || 'User'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-4 h-4 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-medium text-white text-sm">
              {comment.user?.display_name || 'Anonymous'}
            </span>
            <span className="ml-2 text-xs text-gray-400">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          
          {isCommentOwner && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-400 hover:text-gray-200"
              >
                <MoreHorizontal size={16} />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 mt-1 w-32 bg-dark-100 rounded-md shadow-lg py-1 z-10 border border-dark-300">
                  <button
                    className="flex w-full items-center px-3 py-1 text-xs text-red-400 hover:bg-dark-300"
                    onClick={() => {
                      if (confirm('Delete this comment?')) {
                        onDelete();
                      }
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
        
        <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
      </div>
    </motion.div>
  );
};

export default CirclePostComponent;