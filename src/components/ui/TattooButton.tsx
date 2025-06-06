import React from 'react';
import { motion } from 'framer-motion';

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

const TattooButton: React.FC<TattooButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  chakraColor,
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

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
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`
        font-medium rounded-2xl transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-opacity-50
        ${sizeClasses[size]}
        ${variant === 'primary' 
          ? 'tattoo-btn-primary' 
          : variant === 'outline'
          ? 'tattoo-btn-outline' 
          : 'text-gray-200 hover:text-white bg-transparent'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={getButtonStyles()}
    >
      {children}
    </motion.button>
  );
};

export default TattooButton;