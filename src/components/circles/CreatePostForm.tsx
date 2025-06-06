import React, { useState } from 'react';
import { Image, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChakra } from '../../context/ChakraContext';
import { motion } from 'framer-motion';
import TattooButton from '../ui/TattooButton';

interface CreatePostFormProps {
  circleId: string;
  onCreatePost: (content: string, imageUrl?: string) => Promise<void>;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({
  circleId,
  onCreatePost
}) => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content for your post');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await onCreatePost(content, imageUrl || undefined);
      
      // Reset form
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-dark-200 rounded-2xl p-5 border border-dark-300 shadow-md mb-6">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
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
        
        <div className="flex-1 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your wisdom with the circle..."
            className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
            style={{ focusRingColor: chakraState.color }}
            rows={3}
          ></textarea>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          {showImageInput && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="flex items-center"
            >
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL..."
                className="flex-1 px-3 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
              />
              <button
                type="button"
                onClick={() => {
                  setImageUrl('');
                  setShowImageInput(false);
                }}
                className="ml-2 text-gray-400 hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowImageInput(true)}
              className={`text-gray-400 hover:text-gray-200 ${showImageInput ? 'hidden' : ''}`}
            >
              <Image size={18} />
            </button>
            
            <TattooButton
              type="submit"
              disabled={isSubmitting || !content.trim()}
              chakraColor={chakraState.color}
            >
              {isSubmitting ? (
                <>
                  <motion.span 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="inline-block mr-2"
                  >
                    ⟳
                  </motion.span>
                  Posting...
                </>
              ) : 'Share in Circle'}
            </TattooButton>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreatePostForm;