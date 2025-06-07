import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { supabase } from '../lib/supabase';
import { LibraryPlaylist, LibraryItem, PlaylistItem } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Share, Trash2, Play, Music, Video, FileText, Image, BookOpen, FlipVertical as DragVertical, X, Heart, Eye } from 'lucide-react';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';

const PlaylistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { chakraState } = useChakra();
  const navigate = useNavigate();
  
  const [playlist, setPlaylist] = useState<LibraryPlaylist | null>(null);
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      fetchPlaylist();
      fetchPlaylistItems();
    }
  }, [id]);
  
  const fetchPlaylist = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, fetch from Supabase
      // For demo, generate a placeholder playlist
      const placeholderPlaylist = generatePlaceholderPlaylist(id || '');
      setPlaylist(placeholderPlaylist);
      setEditName(placeholderPlaylist.name);
      setEditDescription(placeholderPlaylist.description || '');
      setIsShared(placeholderPlaylist.is_shared);
    } catch (error) {
      console.error('Error fetching playlist:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchPlaylistItems = async () => {
    try {
      // In a real app, fetch from Supabase
      // For demo, generate placeholder items
      const placeholderItems = generatePlaceholderItems(id || '');
      setPlaylistItems(placeholderItems);
    } catch (error) {
      console.error('Error fetching playlist items:', error);
    }
  };
  
  const handleSaveChanges = async () => {
    if (!playlist) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real app, update in Supabase
      // For demo, update local state
      setPlaylist({
        ...playlist,
        name: editName,
        description: editDescription,
        is_shared: isShared,
        updated_at: new Date().toISOString()
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating playlist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveItem = async (itemId: string) => {
    try {
      // In a real app, delete from Supabase
      // For demo, update local state
      setPlaylistItems(playlistItems.filter(item => item.id !== itemId));
      
      // Update item count
      if (playlist) {
        setPlaylist({
          ...playlist,
          item_count: playlist.item_count - 1,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };
  
  const handleReorderItems = async (startIndex: number, endIndex: number) => {
    try {
      // In a real app, update positions in Supabase
      // For demo, update local state
      const result = Array.from(playlistItems);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Update positions
      const updatedItems = result.map((item, index) => ({
        ...item,
        position: index
      }));
      
      setPlaylistItems(updatedItems);
    } catch (error) {
      console.error('Error reordering items:', error);
    }
  };
  
  const handleDeletePlaylist = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      // In a real app, delete from Supabase
      // For demo, navigate back
      navigate('/sacred-library/playlists');
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };
  
  const handlePlayItem = (itemId: string) => {
    setCurrentlyPlaying(currentlyPlaying === itemId ? null : itemId);
  };
  
  // Get media type icon
  const getMediaTypeIcon = (type: string) => {
    switch(type) {
      case 'audio': return <Music size={16} />;
      case 'video': return <Video size={16} />;
      case 'pdf': return <FileText size={16} />;
      case 'image': return <Image size={16} />;
      case 'text': return <BookOpen size={16} />;
      default: return <BookOpen size={16} />;
    }
  };
  
  // Generate placeholder playlist for demo
  const generatePlaceholderPlaylist = (playlistId: string): LibraryPlaylist => {
    const playlistNames = [
      'Meditation Collection',
      'Healing Frequencies',
      'Consciousness Expansion',
      'Cosmic Consciousness',
      'Ancestral Wisdom',
      'Sacred Geometry'
    ];
    
    const index = parseInt(playlistId.replace('playlist-', '').replace('shared-playlist-', '')) || 1;
    const name = playlistNames[(index - 1) % playlistNames.length];
    
    return {
      id: playlistId,
      name,
      description: `A collection of ${name.toLowerCase()} content for spiritual growth and healing.`,
      created_by: playlistId.startsWith('shared-') ? `user-${index}` : user?.id || 'system',
      created_at: new Date(Date.now() - index * 86400000).toISOString(),
      updated_at: new Date(Date.now() - index * 43200000).toISOString(),
      is_shared: playlistId.startsWith('shared-') || index % 2 === 1,
      cover_image_url: `https://images.pexels.com/photos/${1000000 + index * 10000}/pexels-photo-${1000000 + index * 10000}.jpeg?auto=compress&cs=tinysrgb&w=600`,
      item_count: 3 + index
    };
  };
  
  // Generate placeholder items for demo
  const generatePlaceholderItems = (playlistId: string): PlaylistItem[] => {
    const index = parseInt(playlistId.replace('playlist-', '').replace('shared-playlist-', '')) || 1;
    const count = 3 + index;
    
    return Array.from({ length: count }, (_, i) => {
      const itemIndex = (index * 10) + i;
      const item: LibraryItem = {
        id: `item-${itemIndex}`,
        title: [
          'Sacred Geometry Meditation',
          'Chakra Activation Tones',
          'Ancient Wisdom Teachings',
          'Quantum Field Visualization',
          'Akashic Records Journey',
          'Tesla 369 Frequency Healing',
          'Divine Feminine Awakening',
          'Ancestral Timeline Healing',
          'Cosmic Consciousness Expansion',
          'Hermetic Principles Explained'
        ][itemIndex % 10],
        description: 'Experience the transformative power of sacred knowledge and vibrational healing.',
        file_url: `/media/${itemIndex}.${itemIndex % 2 === 0 ? 'mp3' : 'mp4'}`,
        thumbnail_url: `https://images.pexels.com/photos/${1000000 + itemIndex * 10000}/pexels-photo-${1000000 + itemIndex * 10000}.jpeg?auto=compress&cs=tinysrgb&w=300`,
        created_by: user?.id || 'system',
        created_at: new Date(Date.now() - itemIndex * 86400000).toISOString(),
        updated_at: new Date(Date.now() - itemIndex * 86400000).toISOString(),
        chakra: ['Root', 'Sacral', 'SolarPlexus', 'Heart', 'Throat', 'ThirdEye', 'Crown'][itemIndex % 7],
        timeline: ['past', 'present', 'future'][itemIndex % 3] as 'past' | 'present' | 'future',
        frequency_hz: [396, 417, 528, 639, 741, 852, 963][itemIndex % 7],
        tags: ['meditation', 'healing', 'frequency', 'consciousness', 'awakening'].slice(0, (itemIndex % 5) + 1),
        is_locked: itemIndex % 7 === 0,
        media_type: ['audio', 'video', 'pdf', 'image', 'text'][itemIndex % 5] as 'audio' | 'video' | 'pdf' | 'image' | 'text',
        duration_seconds: itemIndex % 2 === 0 ? (itemIndex + 1) * 60 : undefined,
        view_count: Math.floor(Math.random() * 100)
      };
      
      return {
        id: `playlist-item-${itemIndex}`,
        playlist_id: playlistId,
        item_id: item.id,
        position: i,
        added_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
        item
      };
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-transparent border-t-[3px]"
          style={{ borderTopColor: chakraState.color }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  
  if (!playlist) {
    return (
      <div className="text-center py-12 bg-dark-200 rounded-2xl border border-dark-300">
        <h2 className="text-xl font-medium text-white mb-2">Playlist Not Found</h2>
        <p className="text-gray-400 mb-6">
          The requested playlist could not be found or you don't have access to it.
        </p>
        
        <TattooButton
          onClick={() => navigate('/sacred-library/playlists')}
          chakraColor={chakraState.color}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Playlists
        </TattooButton>
      </div>
    );
  }
  
  const isOwner = playlist.created_by === user?.id;
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/sacred-library/playlists')}
          className="mr-3 p-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <SacredHeading 
          as="h1" 
          className="text-2xl"
          chakraColor={chakraState.color}
          withGlow
        >
          {isEditing ? 'Edit Playlist' : playlist.name}
        </SacredHeading>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlist details */}
        <div className="bg-dark-200 p-4 rounded-2xl border border-dark-300">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                  style={{ focusRingColor: chakraState.color }}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                  style={{ focusRingColor: chakraState.color }}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_shared"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="h-4 w-4 rounded border-dark-400 bg-dark-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_shared" className="ml-2 text-sm text-gray-300">
                  Share with Sacred Circle
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                
                <TattooButton
                  onClick={handleSaveChanges}
                  disabled={!editName.trim() || isSubmitting}
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
                    'Save Changes'
                  )}
                </TattooButton>
              </div>
            </div>
          ) : (
            <>
              {/* Cover image */}
              <div className="aspect-square rounded-lg overflow-hidden mb-4">
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
                    <Music size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-medium text-white mb-2">{playlist.name}</h2>
              
              {playlist.description && (
                <p className="text-gray-300 mb-4">{playlist.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div>{playlist.item_count} items</div>
                <div>Updated {new Date(playlist.updated_at).toLocaleDateString()}</div>
              </div>
              
              {isOwner && (
                <div className="flex space-x-2">
                  <TattooButton
                    onClick={() => setIsEditing(true)}
                    chakraColor={chakraState.color}
                    variant="outline"
                    className="flex-1 flex items-center justify-center"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </TattooButton>
                  
                  <TattooButton
                    onClick={handleDeletePlaylist}
                    chakraColor="#EF4444"
                    variant="outline"
                    className="flex-1 flex items-center justify-center"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </TattooButton>
                </div>
              )}
              
              {/* Play all button */}
              <TattooButton
                onClick={() => navigate(`/sacred-library/media/${playlistItems[0]?.item_id}`)}
                chakraColor={chakraState.color}
                className="w-full mt-4 flex items-center justify-center"
                disabled={playlistItems.length === 0}
              >
                <PlayIcon size={16} className="mr-1" />
                Play All
              </TattooButton>
              
              {/* Share button */}
              {isOwner && (
                <button
                  onClick={() => {
                    setIsShared(!playlist.is_shared);
                    setPlaylist({
                      ...playlist,
                      is_shared: !playlist.is_shared
                    });
                  }}
                  className={`w-full mt-3 py-2 rounded-lg flex items-center justify-center ${
                    playlist.is_shared 
                      ? 'bg-dark-100 text-white' 
                      : 'bg-dark-300 text-gray-300 hover:bg-dark-400'
                  }`}
                >
                  <Share size={16} className="mr-1" />
                  {playlist.is_shared ? 'Shared with Circle' : 'Share with Circle'}
                </button>
              )}
            </>
          )}
        </div>
        
        {/* Playlist items */}
        <div className="lg:col-span-2">
          <div className="bg-dark-200 p-4 rounded-2xl border border-dark-300">
            <h3 className="text-lg font-medium text-white mb-4">Playlist Items</h3>
            
            {playlistItems.length > 0 ? (
              <div className="space-y-2">
                {playlistItems
                  .sort((a, b) => a.position - b.position)
                  .map((playlistItem, index) => (
                    <div 
                      key={playlistItem.id}
                      className="flex items-center p-3 rounded-lg bg-dark-300 hover:bg-dark-400"
                    >
                      {isOwner && (
                        <div className="flex-shrink-0 mr-2 cursor-move text-gray-500">
                          <DragVerticalIcon size={16} />
                        </div>
                      )}
                      
                      <div className="flex-shrink-0 mr-3 text-gray-400 w-6 text-center">
                        {currentlyPlaying === playlistItem.item_id ? (
                          <button
                            onClick={() => handlePlayItem(playlistItem.item_id)}
                            className="text-white"
                          >
                            <PauseIcon size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePlayItem(playlistItem.item_id)}
                          >
                            <PlayIcon size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/sacred-library/media/${playlistItem.item_id}`)}
                      >
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="font-medium text-white">{playlistItem.item?.title}</div>
                            <div className="flex items-center mt-1 text-xs text-gray-400">
                              <div className="flex items-center mr-2">
                                {getMediaTypeIcon(playlistItem.item?.media_type || 'audio')}
                                <span className="ml-1 capitalize">{playlistItem.item?.media_type}</span>
                              </div>
                              
                              {playlistItem.item?.duration_seconds && (
                                <div className="flex items-center mr-2">
                                  <Clock size={12} className="mr-1" />
                                  <span>{formatDuration(playlistItem.item.duration_seconds)}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <Eye size={12} className="mr-1" />
                                <span>{playlistItem.item?.view_count}</span>
                              </div>
                            </div>
                          </div>
                          
                          {playlistItem.item?.chakra && (
                            <div 
                              className="px-2 py-0.5 rounded-full text-xs ml-2"
                              style={{ 
                                backgroundColor: `${getChakraColor(playlistItem.item.chakra)}20`,
                                color: getChakraColor(playlistItem.item.chakra)
                              }}
                            >
                              {playlistItem.item.chakra}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveItem(playlistItem.id)}
                          className="flex-shrink-0 ml-2 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-dark-200"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Music size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium text-white mb-2">No Items Yet</h3>
                <p className="text-gray-400 mb-6">
                  This playlist is empty. Add items from the library.
                </p>
                
                <TattooButton
                  onClick={() => navigate('/sacred-library')}
                  chakraColor={chakraState.color}
                >
                  Browse Library
                </TattooButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Format duration as MM:SS
const formatDuration = (seconds?: number): string => {
  if (!seconds) return '';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Get chakra color
const getChakraColor = (chakra?: string): string => {
  if (!chakra) return '#9d4edd';
  
  const chakraColors: Record<string, string> = {
    Root: 'var(--chakra-root)',
    Sacral: 'var(--chakra-sacral)',
    SolarPlexus: 'var(--chakra-solarplexus)',
    Heart: 'var(--chakra-heart)',
    Throat: 'var(--chakra-throat)',
    ThirdEye: 'var(--chakra-thirdeye)',
    Crown: 'var(--chakra-crown)'
  };
  
  return chakraColors[chakra] || '#9d4edd';
};

// Play icon component
const PlayIcon: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
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

// Pause icon component
const PauseIcon: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
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
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

// Drag vertical icon component
const DragVerticalIcon: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
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
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);

export default PlaylistDetailPage;