import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { supabase } from '../lib/supabase';
import { LibraryPlaylist } from '../types';
import { motion } from 'framer-motion';
import { Plus, Music, Share, Edit, Trash2, Heart } from 'lucide-react';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';

const PlaylistsPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  const navigate = useNavigate();
  
  const [playlists, setPlaylists] = useState<LibraryPlaylist[]>([]);
  const [sharedPlaylists, setSharedPlaylists] = useState<LibraryPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchPlaylists();
  }, [user]);
  
  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, fetch from Supabase
      // For demo, generate placeholder playlists
      const myPlaylists = generatePlaceholderPlaylists();
      setPlaylists(myPlaylists);
      
      // Generate shared playlists
      const shared = generateSharedPlaylists();
      setSharedPlaylists(shared);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setIsLoading(false);
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
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      // In a real app, delete from Supabase
      // For demo, remove from local state
      setPlaylists(playlists.filter(p => p.id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };
  
  const handleToggleShare = async (playlist: LibraryPlaylist) => {
    try {
      // In a real app, update in Supabase
      // For demo, update local state
      const updatedPlaylists = playlists.map(p => 
        p.id === playlist.id ? { ...p, is_shared: !p.is_shared } : p
      );
      
      setPlaylists(updatedPlaylists);
      
      // If now shared, add to shared playlists
      if (!playlist.is_shared) {
        setSharedPlaylists([...sharedPlaylists, { ...playlist, is_shared: true }]);
      } else {
        // If now unshared, remove from shared playlists
        setSharedPlaylists(sharedPlaylists.filter(p => p.id !== playlist.id));
      }
    } catch (error) {
      console.error('Error toggling share status:', error);
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
        cover_image_url: 'https://images.pexels.com/photos/3560044/pexels-photo-3560044.jpeg?auto=compress&cs=tinysrgb&w=300',
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
        cover_image_url: 'https://images.pexels.com/photos/3059654/pexels-photo-3059654.jpeg?auto=compress&cs=tinysrgb&w=300',
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
        cover_image_url: 'https://images.pexels.com/photos/1231230/pexels-photo-1231230.jpeg?auto=compress&cs=tinysrgb&w=300',
        item_count: 3
      }
    ];
  };
  
  // Generate shared playlists for demo
  const generateSharedPlaylists = (): LibraryPlaylist[] => {
    return [
      {
        id: 'shared-playlist-1',
        name: 'Cosmic Consciousness',
        description: 'Journey to higher dimensions',
        created_by: 'user-1',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        is_shared: true,
        cover_image_url: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=300',
        item_count: 8
      },
      {
        id: 'shared-playlist-2',
        name: 'Ancestral Wisdom',
        description: 'Connecting with past timeline knowledge',
        created_by: 'user-2',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        is_shared: true,
        cover_image_url: 'https://images.pexels.com/photos/1809644/pexels-photo-1809644.jpeg?auto=compress&cs=tinysrgb&w=300',
        item_count: 6
      },
      {
        id: 'shared-playlist-3',
        name: 'Sacred Geometry',
        description: 'Visual meditations on universal patterns',
        created_by: 'user-3',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
        is_shared: true,
        cover_image_url: 'https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&w=300',
        item_count: 4
      }
    ];
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <SacredHeading 
          as="h1" 
          className="text-2xl"
          chakraColor={chakraState.color}
          withGlow
        >
          Sacred Playlists
        </SacredHeading>
        
        <TattooButton
          onClick={() => setShowCreateForm(true)}
          chakraColor={chakraState.color}
          className="flex items-center"
        >
          <Plus size={16} className="mr-1" />
          Create Playlist
        </TattooButton>
      </div>
      
      {/* Create playlist form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            className="bg-dark-200 p-4 rounded-2xl border border-dark-300 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white">Create New Playlist</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                  style={{ focusRingColor: chakraState.color }}
                  placeholder="Enter playlist name"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                  style={{ focusRingColor: chakraState.color }}
                  placeholder="Enter playlist description"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              
              <TattooButton
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim() || isSubmitting}
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
                    Creating...
                  </>
                ) : (
                  'Create Playlist'
                )}
              </TattooButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* My Playlists */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-white mb-4">My Playlists</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <motion.div
              className="w-8 h-8 rounded-full border-2 border-transparent border-t-[2px]"
              style={{ borderTopColor: chakraState.color }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlists.map(playlist => (
              <PlaylistCard 
                key={playlist.id}
                playlist={playlist}
                onDelete={() => handleDeletePlaylist(playlist.id)}
                onToggleShare={() => handleToggleShare(playlist)}
                onClick={() => navigate(`/sacred-library/playlists/${playlist.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-dark-200 rounded-2xl border border-dark-300">
            <Music size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-white mb-2">No Playlists Yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first playlist to organize your sacred content.
            </p>
            
            <TattooButton
              onClick={() => setShowCreateForm(true)}
              chakraColor={chakraState.color}
            >
              <Plus size={16} className="mr-2" />
              Create Playlist
            </TattooButton>
          </div>
        )}
      </div>
      
      {/* Shared Playlists */}
      <div>
        <h2 className="text-xl font-medium text-white mb-4">Shared Playlists</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <motion.div
              className="w-8 h-8 rounded-full border-2 border-transparent border-t-[2px]"
              style={{ borderTopColor: chakraState.color }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : sharedPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sharedPlaylists.map(playlist => (
              <PlaylistCard 
                key={playlist.id}
                playlist={playlist}
                isSharedByOthers={playlist.created_by !== user?.id}
                onClick={() => navigate(`/sacred-library/playlists/${playlist.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-dark-200 rounded-2xl border border-dark-300">
            <Share size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-white mb-2">No Shared Playlists</h3>
            <p className="text-gray-400">
              Shared playlists from your circles will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface PlaylistCardProps {
  playlist: LibraryPlaylist;
  isSharedByOthers?: boolean;
  onDelete?: () => void;
  onToggleShare?: () => void;
  onClick: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  isSharedByOthers = false,
  onDelete,
  onToggleShare,
  onClick
}) => {
  const { chakraState } = useChakra();
  const [showActions, setShowActions] = useState(false);
  
  return (
    <motion.div
      className="bg-dark-200 rounded-2xl border border-dark-300 overflow-hidden"
      whileHover={{ scale: 1.03 }}
    >
      {/* Cover image */}
      <div 
        className="aspect-square relative cursor-pointer"
        onClick={onClick}
      >
        {playlist.cover_image_url ? (
          <img 
            src={playlist.cover_image_url} 
            alt={playlist.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${chakraState.color}20, ${chakraState.color}05)` 
            }}
          >
            <Music size={48} className="text-gray-400" />
          </div>
        )}
        
        {/* Overlay with play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-40">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: chakraState.color,
              boxShadow: `0 0 20px ${chakraState.color}80`
            }}
          >
            <Play size={24} className="text-white ml-1" />
          </div>
        </div>
        
        {/* Shared badge */}
        {playlist.is_shared && (
          <div 
            className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs flex items-center"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white'
            }}
          >
            <Share size={12} className="mr-1" />
            Shared
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div onClick={onClick} className="cursor-pointer">
            <h3 className="font-medium text-white mb-1">{playlist.name}</h3>
            <div className="text-xs text-gray-400 mb-2">{playlist.item_count} items</div>
          </div>
          
          {!isSharedByOthers && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-dark-300"
              >
                <MoreVertical size={16} />
              </button>
              
              {showActions && (
                <div className="absolute right-0 mt-1 w-40 bg-dark-100 rounded-md shadow-lg py-1 z-10 border border-dark-300">
                  <button
                    className="flex w-full items-center px-3 py-2 text-sm text-gray-300 hover:bg-dark-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleShare) onToggleShare();
                      setShowActions(false);
                    }}
                  >
                    <Share size={14} className="mr-2" />
                    {playlist.is_shared ? 'Unshare' : 'Share'}
                  </button>
                  
                  <button
                    className="flex w-full items-center px-3 py-2 text-sm text-gray-300 hover:bg-dark-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(false);
                      // Navigate to edit page
                    }}
                  >
                    <Edit size={14} className="mr-2" />
                    Edit
                  </button>
                  
                  <button
                    className="flex w-full items-center px-3 py-2 text-sm text-red-400 hover:bg-dark-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDelete) onDelete();
                      setShowActions(false);
                    }}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>
            {new Date(playlist.updated_at).toLocaleDateString()}
          </div>
          
          <div className="flex items-center">
            <Heart size={12} className="mr-1" />
            <span>{Math.floor(Math.random() * 50)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Play icon component
const Play: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
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
    className={className}
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// More vertical icon component
const MoreVertical: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
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
    className={className}
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

export default PlaylistsPage;