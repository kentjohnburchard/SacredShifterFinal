import React from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';

interface RuneButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  runeSymbol?: string;
  glyphEffect?: boolean;
}

const RuneButton: React.FC<RuneButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon,
  runeSymbol,
  glyphEffect = true
}) => {
  const { chakraState } = useChakra();
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'ink-button-primary';
      case 'secondary':
        return 'ink-button bg-ink-accent text-ink-white';
      case 'outline':
        return 'bg-transparent border border-current text-current hover:bg-opacity-10';
      case 'ghost':
        return 'bg-transparent hover:bg-ink-accent hover:bg-opacity-20';
      default:
        return 'ink-button';
    }
  };

  const getVariantStyles = (): React.CSSProperties => {
    if (variant === 'primary') {
      return {
        '--chakra-color': chakraState.color,
        backgroundColor: chakraState.color,
        boxShadow: `0 0 15px ${chakraState.color}40`
      } as React.CSSProperties;
    }
    
    if (variant === 'outline' || variant === 'ghost') {
      return {
        color: chakraState.color
      };
    }
    
    return {};
  };
  
  // Generate a unique glyph pattern based on the button text
  const getGlyphPattern = () => {
    if (!glyphEffect) return null;
    
    const buttonText = typeof children === 'string' ? children : 'rune';
    const seed = buttonText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return (
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d={`M${20 + seed % 10},${20 + seed % 15} L${80 - seed % 10},${20 + seed % 5} L${80 - seed % 15},${80 - seed % 10} L${20 + seed % 5},${80 - seed % 5} Z`}
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={10 + seed % 10}
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
          />
        </svg>
      </div>
    );
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`
        relative font-sacred rounded-xl transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-opacity-50
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={getVariantStyles()}
    >
      {getGlyphPattern()}
      
      <span className="relative flex items-center justify-center">
        {icon && <span className="mr-2">{icon}</span>}
        {runeSymbol && (
          <span className="mr-2 font-mystical opacity-80">{runeSymbol}</span>
        )}
        {children}
      </span>
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 -skew-x-12"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 0.1 }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
};

export default RuneButton;