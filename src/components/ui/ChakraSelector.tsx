import React from 'react';
import { ChakraType } from '../../types';
import { useChakra } from '../../context/ChakraContext';
import ChakraBadge from '../chakra/ChakraBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface ChakraSelectorProps {
  value?: ChakraType;
  onChange: (chakra: ChakraType) => void;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'grid';
  className?: string;
}

const ChakraSelector: React.FC<ChakraSelectorProps> = ({ 
  value, 
  onChange, 
  size = 'md',
  layout = 'horizontal', 
  className = '' 
}) => {
  const { chakraState, activateChakra } = useChakra();
  const currentValue = value || chakraState.type;
  
  const chakraOptions: ChakraType[] = [
    'Root', 'Sacral', 'SolarPlexus', 'Heart', 'Throat', 'ThirdEye', 'Crown'
  ];
  
  // Color mapping for chakras
  const chakraColors: Record<ChakraType, string> = {
    Root: 'var(--chakra-root)',
    Sacral: 'var(--chakra-sacral)',
    SolarPlexus: 'var(--chakra-solarplexus)',
    Heart: 'var(--chakra-heart)',
    Throat: 'var(--chakra-throat)',
    ThirdEye: 'var(--chakra-thirdeye)',
    Crown: 'var(--chakra-crown)'
  };

  const getButtonSizeClasses = () => {
    switch(size) {
      case 'sm': return 'p-1.5 text-xs';
      case 'lg': return 'p-3 text-base';
      default: return 'p-2 text-sm';
    }
  };
  
  const getLayoutClasses = () => {
    switch(layout) {
      case 'grid': return 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2';
      default: return 'flex flex-wrap gap-2';
    }
  };
  
  const handleSelect = (chakra: ChakraType) => {
    onChange(chakra);
    activateChakra(chakra);
  };
  
  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      <AnimatePresence>
        {chakraOptions.map((chakra) => (
          <motion.button
            key={chakra}
            type="button"
            onClick={() => handleSelect(chakra)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`rounded-xl transition-colors ${getButtonSizeClasses()} ${
              currentValue === chakra
                ? 'ring-2 font-medium'
                : 'bg-ink-shadow text-gray-400 hover:bg-ink-muted'
            }`}
            style={{
              backgroundColor: currentValue === chakra 
                ? `${chakraColors[chakra]}20` 
                : undefined,
              color: currentValue === chakra 
                ? chakraColors[chakra] 
                : undefined,
              ringColor: currentValue === chakra 
                ? chakraColors[chakra] 
                : undefined
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center">
              <ChakraBadge chakra={chakra} size={size} showLabel={true} />
            </div>
            
            {/* Subtle glow effect for active chakra */}
            {currentValue === chakra && (
              <motion.div
                className="absolute inset-0 rounded-xl z-0"
                animate={{ 
                  boxShadow: [
                    `0 0 5px ${chakraColors[chakra]}30`,
                    `0 0 10px ${chakraColors[chakra]}40`,
                    `0 0 5px ${chakraColors[chakra]}30`
                  ]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            )}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ChakraSelector;