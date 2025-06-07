import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useChakra } from '../../context/ChakraContext';
import { supabase } from '../../lib/supabase';
import { LibraryItem, LibraryPlaylist } from '../../types';
import { X, Plus, Check, Music } from 'lucide-react';
import TattooButton from '../ui/TattooButton';

interface AddToPlaylistModalProps {
  item: LibraryItem;
  onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  item,
  onClose
}) => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  
  const [playlists, setPlaylists] = useState<LibraryPlaylist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    fetchPlaylists();
  }, [user]);
  
  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, fetch from Supabase
      // For demo, generate placeholder playlists
      const placeholderPlaylists = generatePlaceholderPlaylists();
      setPlaylists(placeholderPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTogglePlaylist = (playlistId: string) => {
    if (selectedPlaylists.includes(playlistId)) {
      setSelectedPlaylists(selectedPlaylists.filter(id => id !== playlistId));
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlistId]);
    }
  };
  
  const handleCreatePlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real app, create in Supabase
      // For demo, add to local state
      const newPlaylist: LibraryPlaylist = {
        id: `playlist-${Date.now()}`,
        name: newPlaylistName,
        description: newPlaylistDescription,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_shared: false,
        item_count: 0
      };
      
      setPlaylists([newPlaylist, ...playlists]);
      setSelectedPlaylists([...selectedPlaylists, newPlaylist.id]);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSave = async () => {
    if (!user || selectedPlaylists.length === 0) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real app, add to Supabase
      // For demo, just show success message
      setSuccessMessage(`Added to ${selectedPlaylists.length} playlist${selectedPlaylists.length > 1 ? 's' : ''}`);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error adding to playlists:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate placeholder playlists for demo
  const generatePlaceholderPlaylists = (): LibraryPlaylist[] => {
    return [
      {
        id: 'playlist-1',
        name: 'Meditation Collection',
        description: 'My favorite meditation tracks',
        created_by: user?.id || 'system',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        is_shared: true,
        item_count: 5
      },
      {
        id: 'playlist-2',
        name: 'Healing Frequencies',
        description: 'Frequencies for chakra healing',
        created_by: user?.id || 'system',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        is_shared: false,
        item_count: 7
      },
      {
        id: 'playlist-3',
        name: 'Consciousness Expansion',
        description: 'Advanced teachings and meditations',
        created_by: user?.id || 'system',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        is_shared: true,
        item_count: 3
      }
    ];
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80">
      <motion.div 
        className="w-full max-w-md bg-dark-200 rounded-2xl border border-dark-300 shadow-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-300">
          <h2 className="text-xl font-medium text-white">Add to Playlist</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {successMessage ? (
            <div 
              className="p-4 rounded-lg text-center mb-4"
              style={{ 
                backgroundColor: `${chakraState.color}20`,
                color: chakraState.color
              }}
            >
              <Check size={24} className="mx-auto mb-2" />
              <p>{successMessage}</p>
            </div>
          ) : (
            <>
              {/* Item preview */}
              <div className="flex items-center p-3 rounded-lg bg-dark-300 mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: `${chakraState.color}20` }}
                >
                  {item.media_type === 'audio' ? (
                    <Music size={20} style={{ color: chakraState.color }} />
                  ) : item.media_type === 'video' ? (
                    <Video size={20} style={{ color: chakraState.color }} />
                  ) : item.media_type === 'pdf' ? (
                    <FileText size={20} style={{ color: chakraState.color }} />
                  ) : item.media_type === 'image' ? (
                    <Image size={20} style={{ color: chakraState.color }} />
                  ) : (
                    <BookOpen size={20} style={{ color: chakraState.color }} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-white line-clamp-1">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.chakra} • {item.timeline}</div>
                </div>
              </div>
              
              {/* Create new playlist button */}
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full p-3 rounded-lg bg-dark-300 text-white flex items-center justify-center mb-4 hover:bg-dark-400"
                >
                  <Plus size={18} className="mr-2" />
                  Create New Playlist
                </button>
              )}
              
              {/* Create playlist form */}
              {showCreateForm && (
                <div className="p-3 rounded-lg bg-dark-300 mb-4">
                  <h3 className="text-sm font-medium text-white mb-2">New Playlist</h3>
                  
                  <div className="space-y-3 mb-3">
                    <input
                      type="text"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Playlist name"
                      className="w-full px-3 py-2 bg-dark-400 border border-dark-500 rounded-md text-white focus:outline-none focus:ring-2"
                      style={{ focusRingColor: chakraState.color }}
                    />
                    
                    <textarea
                      value={newPlaylistDescription}
                      onChange={(e) => setNewPlaylistDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 bg-dark-400 border border-dark-500 rounded-md text-white focus:outline-none focus:ring-2"
                      style={{ focusRingColor: chakraState.color }}
                      rows={2}
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <TattooButton
                      onClick={handleCreatePlaylist}
                      disabled={!newPlaylistName.trim() || isSubmitting}
                      chakraColor={chakraState.color}
                      size="sm"
                    >
                      {isSubmitting ? 'Creating...' : 'Create'}
                    </TattooButton>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-3 py-1.5 bg-dark-400 text-gray-300 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Playlists list */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-white mb-2">Your Playlists</h3>
                
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <motion.div
                      className="w-6 h-6 rounded-full border-2 border-transparent border-t-[2px]"
                      style={{ borderTopColor: chakraState.color }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                ) : playlists.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {playlists.map(playlist => (
                      <div 
                        key={playlist.id}
                        className={`p-3 rounded-lg flex items-center cursor-pointer ${
                          selectedPlaylists.includes(playlist.id) 
                            ? 'bg-dark-100 ring-1' 
                            : 'bg-dark-300 hover:bg-dark-400'
                        }`}
                        style={{
                          ringColor: selectedPlaylists.includes(playlist.id) ? chakraState.color : undefined
                        }}
                        onClick={() => handleTogglePlaylist(playlist.id)}
                      >
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                            selectedPlaylists.includes(playlist.id) 
                              ? 'bg-indigo-600' 
                              : 'bg-dark-400'
                          }`}
                        >
                          {selectedPlaylists.includes(playlist.id) && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-white">{playlist.name}</div>
                          <div className="text-xs text-gray-400">{playlist.item_count} items</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <p>You don't have any playlists yet.</p>
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                
                <TattooButton
                  onClick={handleSave}
                  disabled={selectedPlaylists.length === 0 || isSubmitting}
                  chakraColor={chakraState.color}
                >
                  {isSubmitting ? (
                    <>
                      <motion.span 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block mr-1"
                      >
                        ⟳
                      </motion.span>
                      Saving...
                    </>
                  ) : (
                    'Add to Playlists'
                  )}
                </TattooButton>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Media type icon components
const Video: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const FileText: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const Image: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const BookOpen: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export default AddToPlaylistModal;