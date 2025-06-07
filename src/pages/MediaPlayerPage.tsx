import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { supabase } from '../lib/supabase';
import { LibraryItem, LibraryComment, ChakraType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Plus, Download, Share, Clock, Eye, MessageSquare, Send, Lock, Music, Video, FileText, Image, BookOpen } from 'lucide-react';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';
import ChakraBadge from '../components/chakra/ChakraBadge';
import CommentsSection from '../components/library/CommentsSection';
import AddToPlaylistModal from '../components/library/AddToPlaylistModal';
import SpiralVisualizer from '../components/visualizers/SpiralVisualizer';

const MediaPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<LibraryItem | null>(null);
  const [comments, setComments] = useState<LibraryComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (id) {
      fetchMediaItem();
      fetchComments();
    }
  }, [id]);
  
  // Update chakra based on media item
  useEffect(() => {
    if (item?.chakra) {
      activateChakra(item.chakra);
    }
  }, [item]);
  
  // Handle media time updates
  useEffect(() => {
    const mediaElement = item?.media_type === 'video' ? videoRef.current : audioRef.current;
    
    if (!mediaElement) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(mediaElement.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(mediaElement.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    mediaElement.addEventListener('timeupdate', handleTimeUpdate);
    mediaElement.addEventListener('durationchange', handleDurationChange);
    mediaElement.addEventListener('ended', handleEnded);
    
    return () => {
      mediaElement.removeEventListener('timeupdate', handleTimeUpdate);
      mediaElement.removeEventListener('durationchange', handleDurationChange);
      mediaElement.removeEventListener('ended', handleEnded);
    };
  }, [item]);
  
  const fetchMediaItem = async () => {
    try {
      setIsLoading(true);
      setAccessError(null);
      
      // In a real app, fetch from Supabase
      // For demo, generate a placeholder item
      const placeholderItem = generatePlaceholderItem(id || '');
      setItem(placeholderItem);
      
      // Simulate fetching signed URL
      await fetchSignedUrl(placeholderItem);
      
    } catch (error) {
      console.error('Error fetching media item:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchComments = async () => {
    try {
      // In a real app, fetch from Supabase
      // For demo, generate placeholder comments
      const placeholderComments = generatePlaceholderComments(id || '');
      setComments(placeholderComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
  
  const fetchSignedUrl = async (item: LibraryItem) => {
    try {
      // In a real app, call the API endpoint
      // For demo, simulate API response
      
      // Check if item is locked and user doesn't own it
      if (item.is_locked && item.created_by !== user?.id) {
        setAccessError('This content is locked. Complete the required journey to unlock it.');
        return;
      }
      
      // Simulate signed URL
      const fakeSignedUrl = `https://example.com/signed-url/${item.id}`;
      setSignedUrl(fakeSignedUrl);
      
      // Increment view count
      // In a real app, update in Supabase
      setItem(prev => prev ? { ...prev, view_count: prev.view_count + 1 } : null);
      
    } catch (error) {
      console.error('Error fetching signed URL:', error);
      setAccessError('Failed to access media. Please try again later.');
    }
  };
  
  const handlePlayPause = () => {
    const mediaElement = item?.media_type === 'video' ? videoRef.current : audioRef.current;
    
    if (!mediaElement) return;
    
    if (isPlaying) {
      mediaElement.pause();
    } else {
      mediaElement.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mediaElement = item?.media_type === 'video' ? videoRef.current : audioRef.current;
    
    if (!mediaElement) return;
    
    const newTime = parseFloat(e.target.value);
    mediaElement.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mediaElement = item?.media_type === 'video' ? videoRef.current : audioRef.current;
    
    if (!mediaElement) return;
    
    const newVolume = parseFloat(e.target.value);
    mediaElement.volume = newVolume;
    setVolume(newVolume);
  };
  
  const handleAddComment = async (content: string) => {
    if (!user || !item) return;
    
    try {
      // In a real app, add to Supabase
      // For demo, add to local state
      const newComment: LibraryComment = {
        id: `comment-${Date.now()}`,
        item_id: item.id,
        user_id: user.id,
        content,
        created_at: new Date().toISOString(),
        user: {
          id: user.id,
          display_name: user.display_name || 'User',
          avatar_url: user.avatar_url,
          onboarding_completed: true,
          light_points: 0,
          light_level: 0,
          ascension_title: 'Seeker'
        }
      };
      
      setComments([newComment, ...comments]);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  const handleToggleLike = () => {
    setIsLiked(!isLiked);
  };
  
  const handleDownload = () => {
    if (!signedUrl) return;
    
    // In a real app, use the signed URL
    // For demo, just show an alert
    alert('Download started!');
  };
  
  const handleShare = () => {
    // In a real app, implement sharing
    // For demo, just show an alert
    alert('Sharing functionality would be implemented here!');
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get chakra color
  const getChakraColor = (chakra?: ChakraType): string => {
    if (!chakra) return chakraState.color;
    
    const chakraColors: Record<ChakraType, string> = {
      Root: 'var(--chakra-root)',
      Sacral: 'var(--chakra-sacral)',
      SolarPlexus: 'var(--chakra-solarplexus)',
      Heart: 'var(--chakra-heart)',
      Throat: 'var(--chakra-throat)',
      ThirdEye: 'var(--chakra-thirdeye)',
      Crown: 'var(--chakra-crown)'
    };
    
    return chakraColors[chakra];
  };
  
  // Get timeline color
  const getTimelineColor = (timeline?: string): string => {
    if (!timeline) return chakraState.color;
    
    switch(timeline) {
      case 'past': return 'var(--chakra-root)';
      case 'present': return 'var(--chakra-heart)';
      case 'future': return 'var(--chakra-crown)';
      default: return chakraState.color;
    }
  };
  
  // Get media type icon
  const getMediaTypeIcon = (type?: string) => {
    if (!type) return <BookOpen size={20} />;
    
    switch(type) {
      case 'audio': return <Music size={20} />;
      case 'video': return <Video size={20} />;
      case 'pdf': return <FileText size={20} />;
      case 'image': return <Image size={20} />;
      case 'text': return <BookOpen size={20} />;
      default: return <BookOpen size={20} />;
    }
  };
  
  // Generate placeholder item for demo
  const generatePlaceholderItem = (itemId: string): LibraryItem => {
    const chakras: ChakraType[] = ['Root', 'Sacral', 'SolarPlexus', 'Heart', 'Throat', 'ThirdEye', 'Crown'];
    const timelines = ['past', 'present', 'future'];
    const mediaTypes = ['audio', 'video', 'pdf', 'image', 'text'];
    const titles = [
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
    ];
    
    const index = parseInt(itemId.replace('item-', '')) || 1;
    
    return {
      id: itemId,
      title: titles[(index - 1) % titles.length],
      description: 'Experience the transformative power of sacred knowledge and vibrational healing. This content is designed to activate your higher consciousness and align your energy field with universal frequencies.',
      file_url: `/media/${index}.${index % 2 === 0 ? 'mp3' : 'mp4'}`,
      thumbnail_url: `https://images.pexels.com/photos/${1000000 + index * 10000}/pexels-photo-${1000000 + index * 10000}.jpeg?auto=compress&cs=tinysrgb&w=600`,
      created_by: user?.id || 'system',
      created_at: new Date(Date.now() - index * 86400000).toISOString(),
      updated_at: new Date(Date.now() - index * 86400000).toISOString(),
      chakra: chakras[index % chakras.length],
      timeline: timelines[index % timelines.length] as 'past' | 'present' | 'future',
      frequency_hz: [396, 417, 528, 639, 741, 852, 963][index % 7],
      tags: ['meditation', 'healing', 'frequency', 'consciousness', 'awakening'].slice(0, (index % 5) + 1),
      is_locked: index % 5 === 0,
      media_type: mediaTypes[index % mediaTypes.length] as 'audio' | 'video' | 'pdf' | 'image' | 'text',
      duration_seconds: index % 2 === 0 ? (index + 1) * 60 : 300,
      view_count: Math.floor(Math.random() * 100)
    };
  };
  
  // Generate placeholder comments for demo
  const generatePlaceholderComments = (itemId: string): LibraryComment[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `comment-${i + 1}`,
      item_id: itemId,
      user_id: `user-${i + 1}`,
      content: [
        'This meditation completely shifted my energy field. I felt the frequencies resonating with my crown chakra!',
        'The Tesla 369 code embedded in this content is powerful. My manifestations are accelerating.',
        'I've been using this daily for a week and my third eye activation is noticeable. Thank you for sharing this wisdom.',
        'The ancestral healing in this recording helped me release patterns I've been carrying for lifetimes.',
        'Beautiful frequencies. I can feel my DNA restructuring with each listen.'
      ][i],
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      user: {
        id: `user-${i + 1}`,
        display_name: ['Astra', 'Orion', 'Luna', 'Zephyr', 'Nova'][i],
        avatar_url: `https://images.pexels.com/photos/${1000000 + i * 10000}/pexels-photo-${1000000 + i * 10000}.jpeg?auto=compress&cs=tinysrgb&w=150`,
        onboarding_completed: true,
        light_points: 100 * (i + 1),
        light_level: i + 1,
        ascension_title: ['Seeker', 'Initiate', 'Lightbearer', 'Alchemist', 'Mystic'][i]
      }
    }));
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
  
  if (!item) {
    return (
      <div className="text-center py-12 bg-dark-200 rounded-2xl border border-dark-300">
        <h2 className="text-xl font-medium text-white mb-2">Media Not Found</h2>
        <p className="text-gray-400 mb-6">
          The requested content could not be found or you don't have access to it.
        </p>
        
        <TattooButton
          onClick={() => navigate('/sacred-library')}
          chakraColor={chakraState.color}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Library
        </TattooButton>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/sacred-library')}
          className="mr-3 p-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <SacredHeading 
          as="h1" 
          className="text-2xl"
          chakraColor={getChakraColor(item.chakra)}
          withGlow
        >
          {item.title}
        </SacredHeading>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media player */}
          <div className="bg-dark-200 rounded-2xl border border-dark-300 overflow-hidden">
            {accessError ? (
              <div className="p-6 text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${chakraState.color}20` }}
                >
                  <Lock size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Content Locked</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {accessError}
                </p>
                
                <TattooButton
                  onClick={() => navigate('/the-fool')}
                  chakraColor={chakraState.color}
                >
                  Begin Unlocking Journey
                </TattooButton>
              </div>
            ) : (
              <>
                {/* Media content */}
                <div className="relative">
                  {item.media_type === 'video' ? (
                    <video
                      ref={videoRef}
                      className="w-full aspect-video bg-black"
                      poster={item.thumbnail_url}
                      controls={false}
                    >
                      <source src={signedUrl || undefined} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : item.media_type === 'audio' ? (
                    <div className="w-full aspect-video relative">
                      {/* Audio visualization */}
                      <SpiralVisualizer 
                        amplitudeA={1.1}
                        amplitudeB={0.8}
                        amplitudeC={1.2}
                        freqA={2.4}
                        freqB={3.3}
                        freqC={4.6}
                        lineColor={getChakraColor(item.chakra)}
                        height="100%"
                        className="w-full h-full absolute inset-0"
                      />
                      
                      {/* Frequency display */}
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black bg-opacity-50 text-white text-sm">
                        {item.frequency_hz} Hz
                      </div>
                      
                      {/* Chakra badge */}
                      <div className="absolute top-4 right-4">
                        <ChakraBadge chakra={item.chakra} size="md" />
                      </div>
                      
                      {/* Hidden audio element */}
                      <audio
                        ref={audioRef}
                        className="hidden"
                      >
                        <source src={signedUrl || undefined} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  ) : item.media_type === 'image' ? (
                    <div className="w-full aspect-video bg-black flex items-center justify-center">
                      <img 
                        src={item.thumbnail_url || signedUrl || undefined} 
                        alt={item.title} 
                        className="max-w-full max-h-full"
                      />
                    </div>
                  ) : item.media_type === 'pdf' ? (
                    <div className="w-full aspect-video bg-dark-300 flex items-center justify-center">
                      <FileText size={64} className="text-gray-400" />
                      <p className="text-gray-300 mt-4">PDF Viewer would be embedded here</p>
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-dark-300 flex items-center justify-center">
                      <BookOpen size={64} className="text-gray-400" />
                      <p className="text-gray-300 mt-4">Text content would be displayed here</p>
                    </div>
                  )}
                  
                  {/* Play/pause overlay for audio/video */}
                  {(item.media_type === 'audio' || item.media_type === 'video') && (
                    <button
                      onClick={handlePlayPause}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${getChakraColor(item.chakra)}80`,
                          boxShadow: `0 0 30px ${getChakraColor(item.chakra)}60`
                        }}
                      >
                        {isPlaying ? (
                          <Pause size={32} className="text-white" />
                        ) : (
                          <Play size={32} className="text-white ml-1" />
                        )}
                      </div>
                    </button>
                  )}
                </div>
                
                {/* Media controls for audio/video */}
                {(item.media_type === 'audio' || item.media_type === 'video') && (
                  <div className="p-4 border-t border-dark-300">
                    {/* Progress bar */}
                    <div className="flex items-center mb-3">
                      <span className="text-xs text-gray-400 w-10">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 mx-2"
                        style={{ 
                          accentColor: getChakraColor(item.chakra)
                        }}
                      />
                      <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
                    </div>
                    
                    {/* Volume control */}
                    <div className="flex items-center">
                      <Volume size={16} className="text-gray-400 mr-2" />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24"
                        style={{ 
                          accentColor: getChakraColor(item.chakra)
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Description and metadata */}
          <div className="bg-dark-200 p-4 rounded-2xl border border-dark-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-medium text-white mb-1">{item.title}</h2>
                <div className="flex items-center text-sm text-gray-400">
                  <Eye size={14} className="mr-1" />
                  <span>{item.view_count} views</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleToggleLike}
                  className={`p-2 rounded-full ${
                    isLiked ? 'bg-pink-600 text-white' : 'bg-dark-300 text-gray-400 hover:text-white'
                  }`}
                >
                  <Heart size={18} />
                </button>
                
                <button
                  onClick={() => setShowAddToPlaylist(true)}
                  className="p-2 rounded-full bg-dark-300 text-gray-400 hover:text-white"
                >
                  <Plus size={18} />
                </button>
                
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-full bg-dark-300 text-gray-400 hover:text-white"
                  disabled={!signedUrl || item.is_locked}
                >
                  <Download size={18} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-dark-300 text-gray-400 hover:text-white"
                >
                  <Share size={18} />
                </button>
              </div>
            </div>
            
            {item.description && (
              <p className="text-gray-300 mb-4">{item.description}</p>
            )}
            
            <div className="flex flex-wrap gap-3">
              {item.chakra && <ChakraBadge chakra={item.chakra} />}
              
              {item.timeline && (
                <div 
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: `${getTimelineColor(item.timeline)}20`,
                    color: getTimelineColor(item.timeline)
                  }}
                >
                  {item.timeline} timeline
                </div>
              )}
              
              {item.frequency_hz && (
                <div 
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: `${chakraState.color}20`,
                    color: chakraState.color
                  }}
                >
                  {item.frequency_hz} Hz
                </div>
              )}
              
              {item.tags && item.tags.map(tag => (
                <div 
                  key={tag}
                  className="px-3 py-1 rounded-full text-sm bg-dark-300 text-gray-300"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
          
          {/* Comments section */}
          <CommentsSection 
            itemId={item.id}
            comments={comments}
            onAddComment={handleAddComment}
          />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related content */}
          <div className="bg-dark-200 p-4 rounded-2xl border border-dark-300">
            <h3 className="text-lg font-medium text-white mb-3">Related Content</h3>
            
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => {
                const relatedItem = generatePlaceholderItem(`item-${parseInt(id?.replace('item-', '') || '1') + i + 1}`);
                
                return (
                  <div 
                    key={relatedItem.id}
                    className="flex p-2 rounded-lg bg-dark-300 cursor-pointer hover:bg-dark-400"
                    onClick={() => navigate(`/sacred-library/media/${relatedItem.id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-12 rounded overflow-hidden flex-shrink-0">
                      {relatedItem.thumbnail_url ? (
                        <img 
                          src={relatedItem.thumbnail_url} 
                          alt={relatedItem.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ 
                            background: `linear-gradient(135deg, ${getChakraColor(relatedItem.chakra)}20, ${getChakraColor(relatedItem.chakra)}05)` 
                          }}
                        >
                          {getMediaTypeIcon(relatedItem.media_type)}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="ml-2 flex-1">
                      <h4 className="text-sm text-white line-clamp-1">{relatedItem.title}</h4>
                      <div className="flex items-center mt-1">
                        <div 
                          className="text-xs px-1.5 py-0.5 rounded flex items-center mr-2"
                          style={{ 
                            backgroundColor: `${getChakraColor(relatedItem.chakra)}20`,
                            color: getChakraColor(relatedItem.chakra)
                          }}
                        >
                          {relatedItem.chakra}
                        </div>
                        
                        <div className="text-xs text-gray-400 flex items-center">
                          <Eye size={10} className="mr-1" />
                          <span>{relatedItem.view_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-3 text-center">
              <button
                className="text-sm text-gray-400 hover:text-white"
                onClick={() => navigate('/sacred-library')}
              >
                View More
              </button>
            </div>
          </div>
          
          {/* Playlists */}
          <div className="bg-dark-200 p-4 rounded-2xl border border-dark-300">
            <h3 className="text-lg font-medium text-white mb-3">Your Playlists</h3>
            
            <div className="space-y-2 mb-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div 
                  key={`playlist-${i + 1}`}
                  className="p-2 rounded-lg bg-dark-300 cursor-pointer hover:bg-dark-400"
                  onClick={() => navigate(`/sacred-library/playlists/playlist-${i + 1}`)}
                >
                  <div className="font-medium text-white">{['Meditation Collection', 'Healing Frequencies', 'Consciousness Expansion'][i]}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{5 + i} items</div>
                </div>
              ))}
            </div>
            
            <TattooButton
              onClick={() => setShowAddToPlaylist(true)}
              chakraColor={chakraState.color}
              className="w-full"
            >
              <Plus size={16} className="mr-1" />
              Add to Playlist
            </TattooButton>
          </div>
          
          {/* Unlock requirements (if locked) */}
          {item.is_locked && (
            <div 
              className="p-4 rounded-2xl border"
              style={{ 
                backgroundColor: `${chakraState.color}10`,
                borderColor: `${chakraState.color}30`
              }}
            >
              <div className="flex items-center mb-3">
                <Lock size={18} className="mr-2" style={{ color: chakraState.color }} />
                <h3 className="text-lg font-medium text-white">Unlock Requirements</h3>
              </div>
              
              <p className="text-gray-300 mb-3">
                Complete the following to unlock this sacred content:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center p-2 rounded-lg bg-dark-200">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                    style={{ backgroundColor: `${chakraState.color}20` }}
                  >
                    1
                  </div>
                  <div className="text-sm text-white">Complete "The Fool" journey</div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg bg-dark-200">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                    style={{ backgroundColor: `${chakraState.color}20` }}
                  >
                    2
                  </div>
                  <div className="text-sm text-white">Reach Level 3 (Lightbearer)</div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg bg-dark-200">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                    style={{ backgroundColor: `${chakraState.color}20` }}
                  >
                    3
                  </div>
                  <div className="text-sm text-white">Activate your {item.chakra} Chakra</div>
                </div>
              </div>
              
              <div className="mt-4">
                <TattooButton
                  onClick={() => navigate('/the-fool')}
                  chakraColor={chakraState.color}
                  className="w-full"
                >
                  Begin Unlocking Journey
                </TattooButton>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add to playlist modal */}
      <AnimatePresence>
        {showAddToPlaylist && (
          <AddToPlaylistModal
            item={item}
            onClose={() => setShowAddToPlaylist(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Volume icon component
const Volume: React.FC<{ size: number; className?: string }> = ({ size, className }) => {
  return (
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
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
};

// Pause icon component
const Pause: React.FC<{ size: number; className?: string }> = ({ size, className }) => {
  return (
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
};

export default MediaPlayerPage;