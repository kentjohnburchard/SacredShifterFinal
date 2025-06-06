import React from 'react';
import { Sigil } from '../../types';
import { useChakra } from '../../context/ChakraContext';
import { motion } from 'framer-motion';

interface SigilPreviewProps {
  sigil: Sigil;
  size?: 'sm' | 'md' | 'lg';
  isInteractive?: boolean;
  onClick?: () => void;
}

const SigilPreview: React.FC<SigilPreviewProps> = ({ 
  sigil, 
  size = 'md', 
  isInteractive = false,
  onClick
}) => {
  const { chakraState } = useChakra();
  const [isHovered, setIsHovered] = React.useState(false);
  
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-96 h-96'
  };
  
  const handleMouseEnter = () => {
    if (isInteractive) {
      setIsHovered(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (isInteractive) {
      setIsHovered(false);
    }
  };
  
  const getChakraColor = () => {
    const chakraType = sigil.parameters.chakra;
    const chakraColors: Record<string, string> = {
      Root: 'var(--chakra-root)',
      Sacral: 'var(--chakra-sacral)',
      SolarPlexus: 'var(--chakra-solarplexus)',
      Heart: 'var(--chakra-heart)',
      Throat: 'var(--chakra-throat)',
      ThirdEye: 'var(--chakra-thirdeye)',
      Crown: 'var(--chakra-crown)'
    };
    
    return chakraColors[chakraType] || chakraState.color;
  };

  // Calculate numerical values based on sigil properties for subtle animations
  const getFrequencyValues = () => {
    const frequency = sigil.parameters.frequency || 432;
    const normalizedFreq = frequency / 1000; // Normalize to a 0-1 range
    
    // Tesla's key numbers
    const three = 3 / 10;
    const six = 6 / 10;
    const nine = 9 / 10;
    
    return {
      rotationSpeed: 3 + (normalizedFreq * 6), // Between 3-9 seconds
      pulseSpeed: 6 + (normalizedFreq * 3),    // Between 6-9 seconds
      glowIntensity: three + (normalizedFreq * six) // Blend of 3 and 6
    };
  };
  
  const { rotationSpeed, pulseSpeed, glowIntensity } = getFrequencyValues();
  
  return (
    <motion.div 
      className={`relative ${sizeClasses[size]} overflow-hidden rounded-2xl transition-all duration-500 ${isInteractive ? 'cursor-pointer' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={isInteractive ? { scale: 1.05 } : {}}
      initial={{ opacity: 0 }}
animate={{ 
  opacity: 1,
  boxShadow: [
    `0 0 3px ${getChakraColor()}40`,
    `0 0 6px ${getChakraColor()}40`,
    `0 0 9px ${getChakraColor()}40`
  ] 
}}

      transition={{ 
        duration: 0.5,
        boxShadow: { 
          duration: 9,
          repeat: Infinity,
          repeatType: "reverse",
          times: [0, 0.33, 0.66, 1]
        }
      }}
      style={{
        background: `radial-gradient(circle at center, ${getChakraColor()}20, transparent)`,
      }}
    >
      {/* Fibonacci spiral backdrop */}
      <div className="absolute inset-0 fibonacci-bg opacity-30"></div>
      
      {/* SVG container with Tesla-inspired rotation */}
      <motion.div 
        className="w-full h-full flex items-center justify-center"
        animate={{ rotate: isHovered ? 360 : 0 }}
        transition={{ 
          duration: rotationSpeed,
          repeat: isHovered ? Infinity : 0,
          ease: "linear"
        }}
        dangerouslySetInnerHTML={{ __html: sigil.parameters.svg }}
      />
      
      {/* Sacred geometry overlay */}
      <motion.div 
        className="absolute inset-0 sacred-geometry-bg pointer-events-none"
        style={{ opacity: 0.2 }}
        animate={{ 
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ 
          duration: pulseSpeed,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Info overlay (appears on hover for interactive sigils) */}
      {isInteractive && (
        <motion.div 
          className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white opacity-0 transition-opacity duration-300"
          animate={{ opacity: isHovered ? 0.8 : 0 }}
        >
          <div className="font-heading font-semibold text-lg mb-1">{sigil.parameters.intention}</div>
          <div className="text-sm">{sigil.parameters.chakra} Chakra</div>
          <div className="text-xs mt-2">{new Date(sigil.created_at).toLocaleDateString()}</div>
          
          {/* Frequency number emphasized if a Tesla number */}
          <motion.div 
            className="mt-3 text-xs px-2 py-1 rounded-full"
            style={{ 
              backgroundColor: `${getChakraColor()}30`,
              color: getChakraColor() 
            }}
            animate={{ 
              boxShadow: [
                `0 0 3px ${getChakraColor()}`,
                `0 0 6px ${getChakraColor()}`,
                `0 0 3px ${getChakraColor()}`
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {sigil.parameters.frequency} Hz
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SigilPreview;