import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedGlyphProps {
  type?: 'sigil' | 'spiral' | 'vesica' | 'triangle' | 'circle' | 'merkaba';
  size?: number;
  color?: string;
  animation?: 'rotate' | 'pulse' | 'float' | 'breathe' | 'none';
  className?: string;
}

const AnimatedGlyph: React.FC<AnimatedGlyphProps> = ({
  type = 'sigil',
  size = 40,
  color = '#9d4edd',
  animation = 'rotate',
  className = ''
}) => {
  
  const getAnimationProps = () => {
    switch (animation) {
      case 'rotate':
        return {
          animate: { rotate: 360 },
          transition: { duration: 20, repeat: Infinity, ease: "linear" }
        };
      case 'pulse':
        return {
          animate: { scale: [1, 1.1, 1] },
          transition: { duration: 3, repeat: Infinity }
        };
      case 'float':
        return {
          animate: { y: [0, -10, 0] },
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        };
      case 'breathe':
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      default:
        return {};
    }
  };
  
  const renderGlyph = () => {
    switch (type) {
      case 'sigil':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
            <g fill="none" stroke={color} strokeWidth="1.5">
              <circle cx="50" cy="50" r="35" opacity="0.6" />
              <path d="M25 50 L75 50 M50 25 L50 75" opacity="0.8" />
              <path d="M35 35 L65 65 M65 35 L35 65" opacity="0.4" />
              <circle cx="50" cy="50" r="8" fill={color} opacity="0.7" />
            </g>
          </svg>
        );
        
      case 'spiral':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
            <path
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              d="M50,50 m0,-30 a30,30 0 1,1 0,60 a25,25 0 1,1 0,-50 a20,20 0 1,1 0,40 a15,15 0 1,1 0,-30 a10,10 0 1,1 0,20 a5,5 0 1,1 0,-10"
              opacity="0.8"
            />
          </svg>
        );
        
      case 'vesica':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
            <g fill="none" stroke={color} strokeWidth="1.5">
              <circle cx="40" cy="50" r="25" opacity="0.6" />
              <circle cx="60" cy="50" r="25" opacity="0.6" />
              <path d="M50 30 L50 70" opacity="0.8" />
            </g>
          </svg>
        );
        
      case 'triangle':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
            <g fill="none" stroke={color} strokeWidth="1.5">
              <path d="M50 15 L85 75 L15 75 Z" opacity="0.7" />
              <circle cx="50" cy="50" r="3" fill={color} />
            </g>
          </svg>
        );
        
      case 'circle':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
            <g fill="none" stroke={color} strokeWidth="1.5">
              <circle cx="50" cy="50" r="35" opacity="0.6" />
              <circle cx="50" cy="50" r="25" opacity="0.4" />
              <circle cx="50" cy="50" r="15" opacity="0.3" />
              <circle cx="50" cy="50" r="3" fill={color} />
            </g>
          </svg>
        );
        
      case 'merkaba':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
            <g fill="none" stroke={color} strokeWidth="1.5">
              <path d="M50 15 L75 50 L50 85 L25 50 Z" opacity="0.6" />
              <path d="M50 85 L75 50 L50 15 L25 50 Z" opacity="0.4" />
              <circle cx="50" cy="50" r="4" fill={color} opacity="0.8" />
            </g>
          </svg>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      className={`inline-block ${className}`}
      {...getAnimationProps()}
    >
      {renderGlyph()}
    </motion.div>
  );
};

export default AnimatedGlyph;