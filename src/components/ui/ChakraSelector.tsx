import React from 'react';
import { ChakraType } from '../../types';
import { useChakra } from '../../context/ChakraContext';
import ChakraBadge from '../chakra/ChakraBadge';
import { motion } from 'framer-motion';

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
  const { chakraState } = useChakra();
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
  };
  
  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      {chakraOptions.map((chakra) => (
        <motion.button
          key={chakra}
          type="button"
          onClick={() => handleSelect(chakra)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className={`rounded-md transition-colors ${getButtonSizeClasses()} ${
            currentValue === chakra
              ? 'ring-2 font-medium'
              : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
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
        >
          <div className="flex items-center justify-center">
            <ChakraBadge chakra={chakra} size={size} showLabel={true} />
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default ChakraSelector;