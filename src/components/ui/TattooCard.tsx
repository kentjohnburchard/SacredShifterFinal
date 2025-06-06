import React from 'react';
import { motion } from 'framer-motion';

interface TattooCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  chakraColor?: string;
  glowIntensity?: 'sm' | 'md' | 'lg';
  isInteractive?: boolean;
}

const TattooCard: React.FC<TattooCardProps> = ({
  children,
  className = '',
  onClick,
  chakraColor,
  glowIntensity = 'md',
  isInteractive = true,
}) => {
  const glowClasses = {
    sm: 'hover:shadow-glow-sm',
    md: 'hover:shadow-glow-md',
    lg: 'hover:shadow-glow-lg',
  };

  const getCardStyles = (): React.CSSProperties => {
    if (!chakraColor) return {};

    return {
      borderColor: `${chakraColor}30`,
      '--chakra-glow-color': `${chakraColor}40`,
    } as React.CSSProperties;
  };

  const cardVariants = {
    hover: isInteractive ? { scale: 1.02, boxShadow: `0 0 20px ${chakraColor || 'rgba(255,255,255,0.2)'}` } : {},
    tap: isInteractive ? { scale: 0.98 } : {},
  };

  return (
    <motion.div
      className={`
        tattoo-card p-5 border dark:border-dark-400
        ${isInteractive ? `cursor-pointer ${glowClasses[glowIntensity]}` : ''}
        ${className}
      `}
      onClick={isInteractive ? onClick : undefined}
      whileHover={isInteractive ? "hover" : undefined}
      whileTap={isInteractive ? "tap" : undefined}
      variants={cardVariants}
      style={getCardStyles()}
    >
      {children}
    </motion.div>
  );
};

export default TattooCard;