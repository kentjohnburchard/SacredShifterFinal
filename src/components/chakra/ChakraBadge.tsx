import React from 'react';
import { ChakraType } from '../../types';
import { useChakra } from '../../context/ChakraContext';
import { motion } from 'framer-motion';

interface ChakraBadgeProps {
  chakra?: ChakraType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (chakra: ChakraType) => void;
}

const ChakraBadge: React.FC<ChakraBadgeProps> = ({ 
  chakra, 
  showLabel = true, 
  size = 'md',
  onClick
}) => {
  const { chakraState, activateChakra } = useChakra();
  const displayChakra = chakra || chakraState.type;
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };
  
  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const chakraColors: Record<ChakraType, string> = {
    Root: 'var(--chakra-root)',
    Sacral: 'var(--chakra-sacral)',
    SolarPlexus: 'var(--chakra-solarplexus)',
    Heart: 'var(--chakra-heart)',
    Throat: 'var(--chakra-throat)',
    ThirdEye: 'var(--chakra-thirdeye)',
    Crown: 'var(--chakra-crown)'
  };
  
  const color = chakraColors[displayChakra];
  
  const handleClick = () => {
    if (onClick) {
      onClick(displayChakra);
    } else if (chakra) {
      activateChakra(chakra);
    }
  };

  // Determine the frequency number associated with this chakra for Tesla 369 animation
  const getChakraFrequency = (chakraType: ChakraType): number => {
    const frequencies = {
      Root: 396,
      Sacral: 417, 
      SolarPlexus: 528,
      Heart: 639,
      Throat: 741,
      ThirdEye: 852,
      Crown: 963
    };
    return frequencies[chakraType];
  };
  
  const freq = getChakraFrequency(displayChakra);
  const isTeslaNumber = freq.toString().includes('3') || freq.toString().includes('6') || freq.toString().includes('9');
  
  return (
    <div 
      className={`flex items-center ${onClick || chakra ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <motion.div 
        className={`rounded-full ${sizeClasses[size]} mr-1.5 relative tesla-field`}
        animate={{ 
          boxShadow: [
            `0 0 3px ${color}80`,
            `0 0 6px ${color}80`,
            `0 0 9px ${color}80`,
            `0 0 6px ${color}80`,
            `0 0 3px ${color}80`,
          ]
        }}
        transition={{ 
          duration: 9,
          repeat: Infinity,
          repeatType: "mirror",
          times: [0, 0.33, 0.66, 0.83, 1]
        }}
        style={{ backgroundColor: color }}
      >
        {/* Geometric overlay for chakra */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ opacity: 0.4 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full sacred-geometry-bg"></div>
        </motion.div>
      </motion.div>
      
      {showLabel && (
        <motion.span 
          className={`${textSize[size]} font-medium`} 
          style={{ color }}
          animate={{ 
            textShadow: isTeslaNumber ? [
              `0 0 3px ${color}30`,
              `0 0 6px ${color}30`,
              `0 0 3px ${color}30`
            ] : []
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          {displayChakra} Chakra
          <span className="text-xs opacity-70 ml-1">{freq}Hz</span>
        </motion.span>
      )}
    </div>
  );
};

export default ChakraBadge;