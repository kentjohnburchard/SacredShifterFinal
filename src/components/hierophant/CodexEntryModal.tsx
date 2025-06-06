import React, { useState } from 'react';
import { X, Book, Tag, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useChakra } from '../../context/ChakraContext';
import { ChakraType } from '../../types';
import TattooButton from '../ui/TattooButton';
import ChakraSelector from '../ui/ChakraSelector';

interface CodexEntry {
  title: string;
  reflection: string;
  chakra: ChakraType;
  tradition?: string;
  belief_related?: boolean;
  tags?: string[];
}

interface CodexEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: CodexEntry) => Promise<void>;
  initialEntry?: Partial<CodexEntry>;
  wisdomSnippet?: {
    content: string;
    source: string;
    tradition: string;
  };
}

const CodexEntryModal: React.FC<CodexEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry = {},
  wisdomSnippet
}) => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  
  const [title, setTitle] = useState(initialEntry.title || '');
  const [reflection, setReflection] = useState(initialEntry.reflection || '');
  const [chakra, setChakra] = useState<ChakraType>(initialEntry.chakra || chakraState.type);
  const [tradition, setTradition] = useState(initialEntry.tradition || wisdomSnippet?.tradition || '');
  const [isBeliefsRelated, setIsBeliefsRelated] = useState(initialEntry.belief_related || false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialEntry.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    // Don't add duplicate tags
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title for your insight');
      return;
    }
    
    if (!reflection.trim()) {
      setError('Please enter your reflection');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const entry: CodexEntry = {
        title: title.trim(),
        reflection: reflection.trim(),
        chakra,
        tradition: tradition.trim() || undefined,
        belief_related: isBeliefsRelated,
        tags: tags.length > 0 ? tags : undefined
      };
      
      await onSave(entry);
      onClose();
    } catch (error) {
      console.error('Error saving codex entry:', error);
      setError('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900 bg-opacity-80">
      <motion.div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-dark-200 rounded-2xl border border-dark-300 shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-5 border-b border-dark-300">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Book className="mr-2" style={{ color: chakraState.color }} />
            Add to Your Sacred Codex
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-5">
            {error && (
              <div className="p-3 bg-red-900 text-red-100 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {wisdomSnippet && (
              <div className="p-4 bg-dark-100 rounded-lg border border-dark-300 mb-4">
                <div className="italic text-gray-300 mb-2">"{wisdomSnippet.content}"</div>
                <div className="text-sm text-gray-400 text-right">— {wisdomSnippet.source}</div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Insight Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                placeholder="Enter a title for your insight"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Your Reflection
              </label>
              <textarea
                rows={5}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                placeholder="Share your insights, reflections, or interpretation..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Associated Chakra
              </label>
              <ChakraSelector value={chakra} onChange={setChakra} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Spiritual Tradition (Optional)
                </label>
                <input
                  type="text"
                  value={tradition}
                  onChange={(e) => setTradition(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                  style={{ focusRingColor: chakraState.color }}
                  placeholder="e.g., Buddhism, Hermeticism"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="beliefs-checkbox"
                  type="checkbox"
                  checked={isBeliefsRelated}
                  onChange={(e) => setIsBeliefsRelated(e.target.checked)}
                  className="h-4 w-4 rounded border-dark-400 bg-dark-300 text-indigo-600"
                />
                <label htmlFor="beliefs-checkbox" className="ml-2 text-sm text-gray-300">
                  Related to Personal Beliefs
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tags (Optional)
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-4 py-2 bg-dark-300 border border-dark-400 rounded-l-md text-white focus:outline-none focus:ring-2"
                  style={{ focusRingColor: chakraState.color }}
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-dark-400 text-white rounded-r-md flex items-center"
                >
                  <Tag size={16} />
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <span 
                      key={tag} 
                      className="flex items-center px-2 py-1 text-xs rounded-full bg-dark-300 text-gray-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end p-5 border-t border-dark-300 bg-dark-300 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 border border-dark-500 text-gray-300 rounded-md hover:bg-dark-400"
            >
              Cancel
            </button>
            
            <TattooButton
              type="submit"
              disabled={isSubmitting || !title.trim() || !reflection.trim()}
              chakraColor={chakraState.color}
            >
              {isSubmitting ? (
                <>
                  <motion.span 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block mr-2"
                  >
                    ⟳
                  </motion.span>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save to Codex
                </>
              )}
            </TattooButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CodexEntryModal;