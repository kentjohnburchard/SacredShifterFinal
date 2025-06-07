import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { supabase } from '../lib/supabase';
import { LibraryItem, ChakraType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Filter, Search, Upload, BookOpen, Music, Video, FileText, Image, Lock, Play, Plus, Heart } from 'lucide-react';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';
import MediaCard from '../components/library/MediaCard';
import ChakraSelector from '../components/ui/ChakraSelector';
import FloatingFormulas from '../components/ui/FloatingFormulas';

const SacredLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const navigate = useNavigate();
  
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [chakraFilter, setChakraFilter] = useState<ChakraType | 'all'>('all');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'past' | 'present' | 'future'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'audio' | 'video' | 'pdf' | 'image' | 'text'>('all');
  const [lockedFilter, setLockedFilter] = useState<'all' | 'locked' | 'unlocked'>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  
  useEffect(() => {
    fetchLibraryItems();
  }, [user]);
  
  useEffect(() => {
    applyFilters();
  }, [items, searchQuery, chakraFilter, timelineFilter, typeFilter, lockedFilter, frequencyFilter]);
  
  const fetchLibraryItems = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('sacred_library_items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // For demo purposes, if no data is returned, use placeholder data
      const libraryData = data?.length ? data : generatePlaceholderData();
      
      setItems(libraryData);
      setFilteredItems(libraryData);
    } catch (error) {
      console.error('Error fetching library items:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...items];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply chakra filter
    if (chakraFilter !== 'all') {
      filtered = filtered.filter(item => item.chakra === chakraFilter);
    }
    
    // Apply timeline filter
    if (timelineFilter !== 'all') {
      filtered = filtered.filter(item => item.timeline === timelineFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.media_type === typeFilter);
    }
    
    // Apply locked filter
    if (lockedFilter !== 'all') {
      filtered = filtered.filter(item => 
        lockedFilter === 'locked' ? item.is_locked : !item.is_locked
      );
    }
    
    // Apply frequency filter
    if (frequencyFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.frequency_hz === parseInt(frequencyFilter)
      );
    }
    
    setFilteredItems(filtered);
  };
  
  const handleItemClick = (item: LibraryItem) => {
    navigate(`/sacred-library/media/${item.id}`);
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setChakraFilter('all');
    setTimelineFilter('all');
    setTypeFilter('all');
    setLockedFilter('all');
    setFrequencyFilter('all');
  };
  
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
  
  // Generate placeholder data for demo purposes
  const generatePlaceholderData = (): LibraryItem[] => {
    const chakras: ChakraType[] = ['Root', 'Sacral', 'SolarPlexus', 'Heart', 'Throat', 'ThirdEye', 'Crown'];
    const timelines = ['past', 'present', 'future'];
    const mediaTypes = ['audio', 'video', 'pdf', 'image', 'text'];
    const frequencies = [396, 417, 528, 639, 741, 852, 963];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: `item-${i + 1}`,
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
      ][i % 10],
      description: 'Experience the transformative power of sacred knowledge and vibrational healing.',
      file_url: `/media/${i + 1}.${i % 2 === 0 ? 'mp3' : 'mp4'}`,
      thumbnail_url: `https://images.pexels.com/photos/${1000000 + i * 10000}/pexels-photo-${1000000 + i * 10000}.jpeg?auto=compress&cs=tinysrgb&w=300`,
      created_by: user?.id || 'system',
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      updated_at: new Date(Date.now() - i * 86400000).toISOString(),
      chakra: chakras[i % chakras.length],
      timeline: timelines[i % timelines.length] as 'past' | 'present' | 'future',
      frequency_hz: frequencies[i % frequencies.length],
      tags: ['meditation', 'healing', 'frequency', 'consciousness', 'awakening'].slice(0, (i % 5) + 1),
      is_locked: i % 5 === 0,
      media_type: mediaTypes[i % mediaTypes.length] as 'audio' | 'video' | 'pdf' | 'image' | 'text',
      duration_seconds: i % 2 === 0 ? (i + 1) * 60 : undefined,
      view_count: Math.floor(Math.random() * 100)
    }));
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
          Sacred Library
        </SacredHeading>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-dark-300 border border-dark-400 rounded-full text-sm text-white focus:outline-none focus:ring-2"
              style={{ focusRingColor: chakraState.color }}
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full ${showFilters ? 'bg-dark-100' : 'bg-dark-300'} text-gray-300 hover:text-white`}
            style={{ 
              backgroundColor: showFilters ? `${chakraState.color}20` : undefined,
              color: showFilters ? chakraState.color : undefined
            }}
          >
            <Filter size={18} />
          </button>
          
          <div className="flex items-center bg-dark-300 rounded-full p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full ${
                viewMode === 'grid' 
                  ? 'bg-dark-200 text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full ${
                viewMode === 'list' 
                  ? 'bg-dark-200 text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <List size={18} />
            </button>
          </div>
          
          <TattooButton
            onClick={() => navigate('/sacred-library/upload')}
            chakraColor={chakraState.color}
            className="flex items-center"
          >
            <Upload size={16} className="mr-1" />
            Upload
          </TattooButton>
        </div>
      </div>
      
      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="bg-dark-200 p-4 rounded-2xl border border-dark-300 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-gray-400 hover:text-white"
              >
                Reset All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Chakra</label>
                <ChakraSelector 
                  value={chakraFilter === 'all' ? undefined : chakraFilter}
                  onChange={(chakra) => {
                    setChakraFilter(chakra);
                    activateChakra(chakra);
                  }}
                  layout="grid"
                />
                <button
                  onClick={() => setChakraFilter('all')}
                  className="mt-2 text-xs text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Timeline</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['past', 'present', 'future'] as const).map((timeline) => (
                    <button
                      key={timeline}
                      onClick={() => setTimelineFilter(timelineFilter === timeline ? 'all' : timeline)}
                      className={`p-2 rounded-lg text-center ${
                        timelineFilter === timeline
                          ? 'ring-2'
                          : 'bg-dark-300 hover:bg-dark-400'
                      }`}
                      style={{
                        backgroundColor: timelineFilter === timeline 
                          ? timeline === 'past' ? '#C6282820' : 
                            timeline === 'present' ? '#66BB6A20' : 
                            '#AB47BC20'
                          : undefined,
                        color: timelineFilter === timeline 
                          ? timeline === 'past' ? '#C62828' : 
                            timeline === 'present' ? '#66BB6A' : 
                            '#AB47BC'
                          : 'white',
                        ringColor: timelineFilter === timeline 
                          ? timeline === 'past' ? '#C62828' : 
                            timeline === 'present' ? '#66BB6A' : 
                            '#AB47BC'
                          : undefined
                      }}
                    >
                      <div className="font-medium text-sm capitalize">
                        {timeline}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Media Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['audio', 'video', 'pdf', 'image', 'text'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
                      className={`p-2 rounded-lg text-center ${
                        typeFilter === type
                          ? 'ring-2'
                          : 'bg-dark-300 hover:bg-dark-400'
                      }`}
                      style={{
                        backgroundColor: typeFilter === type ? `${chakraState.color}20` : undefined,
                        ringColor: typeFilter === type ? chakraState.color : undefined
                      }}
                    >
                      <div className="flex flex-col items-center">
                        {getMediaTypeIcon(type)}
                        <span className="text-xs mt-1 capitalize">{type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tesla Frequency</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[396, 417, 528, 639, 741, 852, 963].map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setFrequencyFilter(frequencyFilter === freq.toString() ? 'all' : freq.toString())}
                        className={`p-2 rounded-lg text-center ${
                          frequencyFilter === freq.toString()
                            ? 'ring-2'
                            : 'bg-dark-300 hover:bg-dark-400'
                        }`}
                        style={{
                          backgroundColor: frequencyFilter === freq.toString() ? `${chakraState.color}20` : undefined,
                          ringColor: frequencyFilter === freq.toString() ? chakraState.color : undefined
                        }}
                      >
                        <div className="text-sm font-medium">{freq}</div>
                        <div className="text-xs mt-0.5 opacity-80">Hz</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Access</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setLockedFilter(lockedFilter === 'unlocked' ? 'all' : 'unlocked')}
                      className={`p-2 rounded-lg text-center ${
                        lockedFilter === 'unlocked'
                          ? 'ring-2'
                          : 'bg-dark-300 hover:bg-dark-400'
                      }`}
                      style={{
                        backgroundColor: lockedFilter === 'unlocked' ? `${chakraState.color}20` : undefined,
                        ringColor: lockedFilter === 'unlocked' ? chakraState.color : undefined
                      }}
                    >
                      <div className="font-medium text-sm">Unlocked</div>
                    </button>
                    
                    <button
                      onClick={() => setLockedFilter(lockedFilter === 'locked' ? 'all' : 'locked')}
                      className={`p-2 rounded-lg text-center ${
                        lockedFilter === 'locked'
                          ? 'ring-2'
                          : 'bg-dark-300 hover:bg-dark-400'
                      }`}
                      style={{
                        backgroundColor: lockedFilter === 'locked' ? `${chakraState.color}20` : undefined,
                        ringColor: lockedFilter === 'locked' ? chakraState.color : undefined
                      }}
                    >
                      <div className="font-medium text-sm">Locked</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick links */}
      <div className="flex overflow-x-auto space-x-3 mb-6 pb-2">
        <TattooButton
          onClick={() => navigate('/sacred-library/playlists')}
          chakraColor={chakraState.color}
          variant="outline"
          size="sm"
        >
          My Playlists
        </TattooButton>
        
        <TattooButton
          onClick={() => setTypeFilter('audio')}
          chakraColor={chakraState.color}
          variant="outline"
          size="sm"
        >
          <Music size={14} className="mr-1" />
          Meditations
        </TattooButton>
        
        <TattooButton
          onClick={() => setTypeFilter('video')}
          chakraColor={chakraState.color}
          variant="outline"
          size="sm"
        >
          <Video size={14} className="mr-1" />
          Videos
        </TattooButton>
        
        <TattooButton
          onClick={() => setChakraFilter('ThirdEye')}
          chakraColor={chakraState.color}
          variant="outline"
          size="sm"
        >
          Third Eye
        </TattooButton>
        
        <TattooButton
          onClick={() => setChakraFilter('Heart')}
          chakraColor={chakraState.color}
          variant="outline"
          size="sm"
        >
          Heart
        </TattooButton>
        
        <TattooButton
          onClick={() => setTimelineFilter('future')}
          chakraColor={chakraState.color}
          variant="outline"
          size="sm"
        >
          Future Timeline
        </TattooButton>
        
        <TattooButton
          onClick={() => setFrequencyFilter('528')}
          chakraColor={chakraState.color}
          variant="outline"
          size="sm"
        >
          528 Hz
        </TattooButton>
      </div>
      
      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <motion.div
            className="w-12 h-12 rounded-full border-2 border-transparent border-t-[3px]"
            style={{ borderTopColor: chakraState.color }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : filteredItems.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredItems.map(item => (
            <MediaCard 
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-dark-200 rounded-2xl border border-dark-300">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-medium text-white mb-2">No items found</h2>
          <p className="text-gray-400 mb-6">
            {searchQuery || chakraFilter !== 'all' || timelineFilter !== 'all' || typeFilter !== 'all' || lockedFilter !== 'all' || frequencyFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'The sacred library is empty. Be the first to contribute!'}
          </p>
          
          <TattooButton
            onClick={() => navigate('/sacred-library/upload')}
            chakraColor={chakraState.color}
          >
            <Upload size={16} className="mr-2" />
            Upload Content
          </TattooButton>
        </div>
      )}
      
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <FloatingFormulas density="low" />
      </div>
    </div>
  );
};

export default SacredLibraryPage;