import React from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';

interface FractalCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  chakraGlow?: boolean;
  animatedGlyph?: React.ReactNode;
  hoverEffect?: boolean;
  glassEffect?: boolean;
}

const FractalCard: React.FC<FractalCardProps> = ({
  children,
  className = '',
  onClick,
  chakraGlow = true,
  animatedGlyph,
  hoverEffect = true,
  glassEffect = true
}) => {
  const { chakraState } = useChakra();
  
  const cardVariants = {
    rest: { 
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      boxShadow: chakraGlow 
        ? `0 8px 32px ${chakraState.color}20`
        : '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    hover: { 
      scale: 1.02,
      rotateY: hoverEffect ? 5 : 0,
      rotateX: hoverEffect ? 5 : 0,
      boxShadow: chakraGlow
        ? `0 20px 40px ${chakraState.color}30, 0 0 60px ${chakraState.color}20`
        : '0 20px 40px rgba(0, 0, 0, 0.4)'
    },
    tap: { 
      scale: 0.98 
    }
  };
  
  return (
    <motion.div
      className={`
        relative rounded-2xl border overflow-hidden cursor-pointer transform-gpu
        ${glassEffect ? 'glass-mystical' : 'bg-dark-200 border-dark-300'}
        ${className}
      `}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3
      }}
      onClick={onClick}
      style={{
        borderColor: chakraGlow ? `${chakraState.color}30` : undefined,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Sacred geometry background pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 30%, ${chakraState.color}10 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, ${chakraState.color}05 0%, transparent 50%)
          `
        }}
      />
      
      {/* Animated glyph overlay */}
      {animatedGlyph && (
        <div className="absolute top-4 right-4 opacity-30 animate-float">
          {animatedGlyph}
        </div>
      )}
      
      {/* Tesla field effect */}
      <div 
        className="absolute inset-0 tesla-field pointer-events-none"
        style={{
          '--chakra-color': chakraState.color
        } as React.CSSProperties}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Hover shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 -skew-x-12"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 0.1 }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
};

export default FractalCard;