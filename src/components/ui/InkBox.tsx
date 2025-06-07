import React from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';

interface InkBoxProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glow' | 'glass' | 'etched';
  onClick?: () => void;
  animate?: boolean;
  animationDelay?: number;
}

const InkBox: React.FC<InkBoxProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  animate = false,
  animationDelay = 0
}) => {
  const { chakraState } = useChakra();
  
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'glow':
        return 'ink-panel-glow';
      case 'glass':
        return 'glass-mystical';
      case 'etched':
        return 'border-2 border-opacity-20';
      default:
        return 'ink-panel';
    }
  };
  
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'glow':
        return {
          '--chakra-color': chakraState.color
        } as React.CSSProperties;
      case 'etched':
        return {
          borderColor: chakraState.color,
          boxShadow: `inset 0 0 20px ${chakraState.color}20, 0 0 30px ${chakraState.color}10`
        };
      default:
        return {};
    }
  };
  
  const baseClasses = `p-4 ${getVariantClasses()} ${onClick ? 'cursor-pointer' : ''} ${className}`;
  
  if (animate) {
    return (
      <motion.div
        className={baseClasses}
        style={getVariantStyles()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: animationDelay,
          ease: [0.3, 0, 0.6, 1] // Tesla-inspired curve
        }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div 
      className={baseClasses}
      style={getVariantStyles()}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default InkBox;