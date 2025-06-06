import React from 'react';
import { ChakraType } from '../../types';
import { useChakra } from '../../context/ChakraContext';
import ChakraBadge from '../chakra/ChakraBadge';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface WisdomSnippet {
  id: string;
  content: string;
  source: string;
  tradition: string;
  chakra: string;
  tags?: string[];
}

interface WisdomSnippetCardProps {
  snippet: WisdomSnippet;
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
}

const WisdomSnippetCard: React.FC<WisdomSnippetCardProps> = ({
  snippet,
  onClick,
  isSelected = false,
  className = ''
}) => {
  const { chakraState } = useChakra();
  
  const mapChakraStringToType = (chakraStr: string): ChakraType => {
    const chakraMap: Record<string, ChakraType> = {
      'root': 'Root',
      'sacral': 'Sacral', 
      'solar_plexus': 'SolarPlexus',
      'solar': 'SolarPlexus',
      'heart': 'Heart',
      'throat': 'Throat',
      'third_eye': 'ThirdEye',
      'crown': 'Crown'
    };
    
    return chakraMap[chakraStr.toLowerCase()] || 'ThirdEye';
  };
  
  const chakraType = mapChakraStringToType(snippet.chakra);
  
  return (
    <motion.div
      className={`bg-dark-200 p-5 rounded-2xl border shadow-md transition-colors ${
        isSelected 
          ? 'ring-2'
          : 'border-dark-300 hover:border-dark-200'
      } ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        ringColor: isSelected ? chakraState.color : undefined,
        boxShadow: isSelected ? `0 0 10px ${chakraState.color}40` : undefined
      }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start mb-3">
        <div className="flex-shrink-0 mr-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${chakraState.color}20` }}
          >
            <Quote size={16} style={{ color: chakraState.color }} />
          </div>
        </div>
        <div>
          <ChakraBadge chakra={chakraType} size="sm" />
          <div className="text-xs text-gray-400 mt-1">
            {snippet.tradition}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-200 italic">{snippet.content}</p>
      </div>
      
      <div className="text-sm text-right text-gray-400">
        — {snippet.source}
      </div>
      
      {snippet.tags && snippet.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {snippet.tags.map(tag => (
            <span 
              key={tag} 
              className="px-2 py-0.5 text-xs rounded-full bg-dark-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default WisdomSnippetCard;