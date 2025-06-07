import React from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { LibraryItem, ChakraType } from '../../types';
import { Lock, Play, Music, Video, FileText, Image, BookOpen, Heart, Clock, Eye } from 'lucide-react';
import ChakraBadge from '../chakra/ChakraBadge';

interface MediaCardProps {
  item: LibraryItem;
  onClick: () => void;
  viewMode: 'grid' | 'list';
  className?: string;
}

const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onClick,
  viewMode,
  className = ''
}) => {
  const { chakraState } = useChakra();
  
  // Format duration as MM:SS
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get media type icon
  const getMediaTypeIcon = () => {
    switch(item.media_type) {
      case 'audio': return <Music size={viewMode === 'grid' ? 16 : 20} />;
      case 'video': return <Video size={viewMode === 'grid' ? 16 : 20} />;
      case 'pdf': return <FileText size={viewMode === 'grid' ? 16 : 20} />;
      case 'image': return <Image size={viewMode === 'grid' ? 16 : 20} />;
      case 'text': return <BookOpen size={viewMode === 'grid' ? 16 : 20} />;
      default: return <BookOpen size={viewMode === 'grid' ? 16 : 20} />;
    }
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
  
  // Check if frequency is a Tesla number (3, 6, 9)
  const isTeslaNumber = (frequency?: number): boolean => {
    if (!frequency) return false;
    const freqStr = frequency.toString();
    return freqStr.includes('3') || freqStr.includes('6') || freqStr.includes('9');
  };
  
  if (viewMode === 'grid') {
    return (
      <motion.div
        className={`bg-dark-200 rounded-2xl border border-dark-300 overflow-hidden cursor-pointer ${className}`}
        whileHover={{ scale: 1.03 }}
        onClick={onClick}
        animate={{ 
          boxShadow: item.chakra ? [
            `0 0 5px ${getChakraColor(item.chakra)}30`,
            `0 0 10px ${getChakraColor(item.chakra)}40`,
            `0 0 5px ${getChakraColor(item.chakra)}30`
          ] : undefined
        }}
        transition={{ 
          boxShadow: { 
            duration: isTeslaNumber(item.frequency_hz) ? 3.69 : 4,
            repeat: Infinity,
            repeatType: "reverse"
          }
        }}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video">
          {item.thumbnail_url ? (
            <img 
              src={item.thumbnail_url} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${getChakraColor(item.chakra)}20, ${getChakraColor(item.chakra)}05)` 
              }}
            >
              {getMediaTypeIcon()}
            </div>
          )}
          
          {/* Overlay for play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-40">
            <motion.div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: getChakraColor(item.chakra),
                boxShadow: `0 0 20px ${getChakraColor(item.chakra)}80`
              }}
              whileHover={{ scale: 1.1 }}
            >
              <Play size={24} className="text-white ml-1" />
            </motion.div>
          </div>
          
          {/* Duration badge */}
          {item.duration_seconds && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black bg-opacity-70 text-white text-xs flex items-center">
              <Clock size={10} className="mr-1" />
              {formatDuration(item.duration_seconds)}
            </div>
          )}
          
          {/* Lock indicator */}
          {item.is_locked && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black bg-opacity-70 flex items-center justify-center">
              <Lock size={12} className="text-white" />
            </div>
          )}
          
          {/* Media type badge */}
          <div 
            className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs flex items-center"
            style={{ 
              backgroundColor: `${getChakraColor(item.chakra)}80`,
              color: 'white'
            }}
          >
            {getMediaTypeIcon()}
            <span className="ml-1 capitalize">{item.media_type}</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-3">
          <h3 className="font-medium text-white mb-1 line-clamp-1">{item.title}</h3>
          
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <div className="flex items-center">
              <Eye size={12} className="mr-1" />
              <span>{item.view_count}</span>
            </div>
            
            <div className="flex items-center">
              <Heart size={12} className="mr-1" />
              <span>{Math.floor(Math.random() * 50)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            {item.chakra ? (
              <ChakraBadge chakra={item.chakra} size="sm" />
            ) : (
              <span className="text-xs text-gray-400">No chakra</span>
            )}
            
            {item.timeline && (
              <div 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: `${getTimelineColor(item.timeline)}20`,
                  color: getTimelineColor(item.timeline)
                }}
              >
                {item.timeline}
              </div>
            )}
          </div>
          
          {/* Tesla frequency indicator */}
          {isTeslaNumber(item.frequency_hz) && (
            <motion.div 
              className="mt-2 text-xs px-2 py-0.5 rounded-full text-center"
              style={{ 
                backgroundColor: `${getChakraColor(item.chakra)}20`,
                color: getChakraColor(item.chakra)
              }}
              animate={{ 
                boxShadow: [
                  `0 0 3px ${getChakraColor(item.chakra)}`,
                  `0 0 6px ${getChakraColor(item.chakra)}`,
                  `0 0 3px ${getChakraColor(item.chakra)}`
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {item.frequency_hz} Hz Tesla Frequency
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  } else {
    // List view
    return (
      <motion.div
        className={`bg-dark-200 rounded-2xl border border-dark-300 overflow-hidden cursor-pointer ${className}`}
        whileHover={{ scale: 1.01 }}
        onClick={onClick}
        animate={{ 
          boxShadow: item.chakra ? [
            `0 0 5px ${getChakraColor(item.chakra)}30`,
            `0 0 10px ${getChakraColor(item.chakra)}40`,
            `0 0 5px ${getChakraColor(item.chakra)}30`
          ] : undefined
        }}
        transition={{ 
          boxShadow: { 
            duration: isTeslaNumber(item.frequency_hz) ? 3.69 : 4,
            repeat: Infinity,
            repeatType: "reverse"
          }
        }}
      >
        <div className="flex p-3">
          {/* Thumbnail */}
          <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
            {item.thumbnail_url ? (
              <img 
                src={item.thumbnail_url} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${getChakraColor(item.chakra)}20, ${getChakraColor(item.chakra)}05)` 
                }}
              >
                {getMediaTypeIcon()}
              </div>
            )}
            
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-40">
              <motion.div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: getChakraColor(item.chakra),
                  boxShadow: `0 0 10px ${getChakraColor(item.chakra)}80`
                }}
                whileHover={{ scale: 1.1 }}
              >
                <Play size={16} className="text-white ml-0.5" />
              </motion.div>
            </div>
            
            {/* Lock indicator */}
            {item.is_locked && (
              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black bg-opacity-70 flex items-center justify-center">
                <Lock size={10} className="text-white" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="ml-3 flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-white mb-1">{item.title}</h3>
              
              <div 
                className="text-xs px-2 py-0.5 rounded flex items-center"
                style={{ 
                  backgroundColor: `${getChakraColor(item.chakra)}20`,
                  color: getChakraColor(item.chakra)
                }}
              >
                {getMediaTypeIcon()}
                <span className="ml-1 capitalize">{item.media_type}</span>
              </div>
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-400 mb-2 line-clamp-1">{item.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {item.chakra && <ChakraBadge chakra={item.chakra} size="sm" />}
                
                {item.timeline && (
                  <div 
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: `${getTimelineColor(item.timeline)}20`,
                      color: getTimelineColor(item.timeline)
                    }}
                  >
                    {item.timeline}
                  </div>
                )}
                
                {item.duration_seconds && (
                  <div className="text-xs text-gray-400 flex items-center">
                    <Clock size={10} className="mr-1" />
                    {formatDuration(item.duration_seconds)}
                  </div>
                )}
                
                {isTeslaNumber(item.frequency_hz) && (
                  <motion.div 
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: `${getChakraColor(item.chakra)}20`,
                      color: getChakraColor(item.chakra)
                    }}
                    animate={{ 
                      boxShadow: [
                        `0 0 3px ${getChakraColor(item.chakra)}`,
                        `0 0 6px ${getChakraColor(item.chakra)}`,
                        `0 0 3px ${getChakraColor(item.chakra)}`
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {item.frequency_hz} Hz
                  </motion.div>
                )}
              </div>
              
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                <div className="flex items-center">
                  <Eye size={12} className="mr-1" />
                  <span>{item.view_count}</span>
                </div>
                
                <div className="flex items-center">
                  <Heart size={12} className="mr-1" />
                  <span>{Math.floor(Math.random() * 50)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
};

export default MediaCard;