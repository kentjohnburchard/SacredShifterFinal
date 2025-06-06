import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChakra } from '../../context/ChakraContext';
import { supabase } from '../../lib/supabase';
import { Play, Pause, Filter, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import ChakraBadge from '../chakra/ChakraBadge';

interface MeditationTrack {
  id: string;
  title: string;
  chakra: string;
  frequency_hz: number;
  description: string;
  file_url: string;
  is_guided: boolean;
  duration_minutes: number;
}

interface ChakraMeditationLibraryProps {
  onSelectTrack?: (track: MeditationTrack) => void;
  initialChakraFilter?: string;
  className?: string;
}

const ChakraMeditationLibrary: React.FC<ChakraMeditationLibraryProps> = ({
  onSelectTrack,
  initialChakraFilter,
  className = ''
}) => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  
  const [tracks, setTracks] = useState<MeditationTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<MeditationTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chakraFilter, setChakraFilter] = useState<string | null>(initialChakraFilter || null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'guided' | 'instrumental'>('all');
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    fetchMeditationTracks();
  }, [user]);
  
  useEffect(() => {
    // Apply filters whenever tracks or filter settings change
    if (tracks.length > 0) {
      let filtered = [...tracks];
      
      // Apply chakra filter
      if (chakraFilter) {
        filtered = filtered.filter(track => 
          track.chakra.toLowerCase() === chakraFilter.toLowerCase()
        );
      }
      
      // Apply type filter
      if (typeFilter !== 'all') {
        filtered = filtered.filter(track => 
          typeFilter === 'guided' ? track.is_guided : !track.is_guided
        );
      }
      
      setFilteredTracks(filtered);
    }
  }, [tracks, chakraFilter, typeFilter]);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);
  
  const fetchMeditationTracks = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('meditation_tracks')
        .select('*')
        .order('chakra', { ascending: true });
        
      if (error) throw error;
      
      setTracks(data || []);
      setFilteredTracks(data || []);
    } catch (error) {
      console.error('Error fetching meditation tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayTrack = (track: MeditationTrack) => {
    if (!track.file_url) return;
    
    // If we're already playing this track, pause it
    if (currentTrackId === track.id && isPlaying) {
      if (audioElement) {
        audioElement.pause();
      }
      setIsPlaying(false);
      return;
    }
    
    // If we're playing a different track, stop it first
    if (audioElement) {
      audioElement.pause();
    }
    
    // Create a new audio element for the selected track
    const audio = new Audio(track.file_url);
    
    audio.onended = () => {
      setIsPlaying(false);
    };
    
    audio.play().then(() => {
      setAudioElement(audio);
      setCurrentTrackId(track.id);
      setIsPlaying(true);
      
      // If there's a callback, call it
      if (onSelectTrack) {
        onSelectTrack(track);
      }
      
      // Activate the corresponding chakra
      const chakraType = mapChakraNameToType(track.chakra);
      if (chakraType) {
        activateChakra(chakraType, 'meditation');
      }
    }).catch(error => {
      console.error('Error playing audio:', error);
    });
  };
  
  const mapChakraNameToType = (chakraName: string): any => {
    const chakraMap: Record<string, any> = {
      'root': 'Root',
      'sacral': 'Sacral',
      'solar': 'SolarPlexus',
      'solar_plexus': 'SolarPlexus',
      'heart': 'Heart',
      'throat': 'Throat',
      'third_eye': 'ThirdEye',
      'crown': 'Crown'
    };
    
    return chakraMap[chakraName.toLowerCase()] || null;
  };
  
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    
    return `${mins} min`;
  };
  
  // Define chakra options
  const chakraOptions = [
    { value: 'root', label: 'Root', color: 'var(--chakra-root)' },
    { value: 'sacral', label: 'Sacral', color: 'var(--chakra-sacral)' },
    { value: 'solar_plexus', label: 'Solar Plexus', color: 'var(--chakra-solarplexus)' },
    { value: 'heart', label: 'Heart', color: 'var(--chakra-heart)' },
    { value: 'throat', label: 'Throat', color: 'var(--chakra-throat)' },
    { value: 'third_eye', label: 'Third Eye', color: 'var(--chakra-thirdeye)' },
    { value: 'crown', label: 'Crown', color: 'var(--chakra-crown)' }
  ];
  
  return (
    <div className={`bg-dark-200 rounded-2xl border border-dark-300 shadow-md p-5 ${className}`}>
      <div className="mb-5">
        <h3 className="text-lg font-medium text-white mb-3">Chakra Meditation Library</h3>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <div className="text-sm text-gray-400 mb-1.5 flex items-center">
              <Filter size={14} className="mr-1" />
              Chakra Filter
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setChakraFilter(null)}
                className={`px-2 py-1 text-xs rounded-full ${
                  chakraFilter === null 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-dark-300 text-gray-400 hover:bg-dark-400'
                }`}
              >
                All
              </button>
              
              {chakraOptions.map(chakra => (
                <button 
                  key={chakra.value}
                  onClick={() => setChakraFilter(chakra.value)}
                  className={`px-2 py-1 text-xs rounded-full ${
                    chakraFilter === chakra.value 
                      ? `text-white` 
                      : 'bg-dark-300 text-gray-400 hover:bg-dark-400'
                  }`}
                  style={{
                    backgroundColor: chakraFilter === chakra.value 
                      ? `${chakra.color}30` 
                      : undefined,
                    color: chakraFilter === chakra.value 
                      ? chakra.color 
                      : undefined,
                  }}
                >
                  {chakra.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400 mb-1.5">Type</div>
            <div className="flex gap-2">
              <button 
                onClick={() => setTypeFilter('all')}
                className={`px-2 py-1 text-xs rounded-full ${
                  typeFilter === 'all' 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-dark-300 text-gray-400 hover:bg-dark-400'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setTypeFilter('guided')}
                className={`px-2 py-1 text-xs rounded-full ${
                  typeFilter === 'guided' 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-dark-300 text-gray-400 hover:bg-dark-400'
                }`}
              >
                Guided
              </button>
              <button 
                onClick={() => setTypeFilter('instrumental')}
                className={`px-2 py-1 text-xs rounded-full ${
                  typeFilter === 'instrumental' 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-dark-300 text-gray-400 hover:bg-dark-400'
                }`}
              >
                Instrumental
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tracks List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mx-auto mb-3\" style={{ borderColor: chakraState.color }}></div>
            <p className="text-gray-400">Loading meditation tracks...</p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">No meditation tracks found matching your filters.</p>
          </div>
        ) : (
          filteredTracks.map(track => {
            const isActiveTrack = currentTrackId === track.id;
            const chakraColor = chakraOptions.find(c => c.value === track.chakra.toLowerCase())?.color || chakraState.color;
            
            return (
              <motion.div
                key={track.id}
                className={`bg-dark-300 rounded-lg p-3 hover:bg-dark-400 ${isActiveTrack ? 'ring-1' : ''}`}
                style={{ 
                  backgroundColor: isActiveTrack ? `${chakraColor}15` : undefined,
                  ringColor: isActiveTrack ? chakraColor : undefined
                }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 mr-4">
                    <div className="font-medium text-white">{track.title}</div>
                    <div className="flex items-center mt-1">
                      <ChakraBadge
                        chakra={mapChakraNameToType(track.chakra)}
                        size="sm"
                        showLabel={false}
                      />
                      <span className="text-xs text-gray-400 ml-2">{track.frequency_hz} Hz</span>
                      <span className="text-xs text-gray-400 mx-1">•</span>
                      <span className="text-xs text-gray-400 flex items-center">
                        <Clock size={10} className="mr-0.5" />
                        {formatDuration(track.duration_minutes)}
                      </span>
                      {track.is_guided && (
                        <>
                          <span className="text-xs text-gray-400 mx-1">•</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-700">Guided</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlayTrack(track)}
                    className="p-2 rounded-full"
                    style={{ 
                      backgroundColor: `${chakraColor}20`,
                      color: chakraColor
                    }}
                  >
                    {isActiveTrack && isPlaying ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChakraMeditationLibrary;