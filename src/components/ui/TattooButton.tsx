import React from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';

interface TattooButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  chakraColor?: string;
}

const TattooButton = React.forwardRef<HTMLButtonElement, TattooButtonProps>(({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  chakraColor: propChakraColor,
}, ref) => {
  const { chakraState } = useChakra();
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Use provided chakra color or default to the active chakra color
  const chakraColor = propChakraColor || chakraState.color;

  const getButtonStyles = (): React.CSSProperties => {
    if (!chakraColor) return {};

    if (variant === 'primary') {
      return {
        backgroundColor: `${chakraColor}`,
        color: '#FFFFFF',
        boxShadow: `0 0 15px ${chakraColor}50`,
      };
    } else if (variant === 'outline') {
      return {
        borderColor: chakraColor,
        color: chakraColor,
        boxShadow: `0 0 10px ${chakraColor}30`,
      };
    } else {
      return {
        color: chakraColor,
      };
    }
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`
        font-sacred font-medium rounded-xl transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-opacity-50
        ${sizeClasses[size]}
        ${variant === 'primary' 
          ? 'ink-button-primary' 
          : variant === 'outline'
          ? 'bg-transparent border border-current text-current hover:bg-opacity-10' 
          : 'text-gray-200 hover:text-white bg-transparent hover:bg-ink-accent hover:bg-opacity-20'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={getButtonStyles()}
    >
      {/* Subtle glyph pattern overlay */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M20,20 L80,20 L80,80 L20,80 Z"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="15"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
          />
        </svg>
      </div>
      
      {/* Content */}
      <span className="relative z-10">
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
});

export default TattooButton;