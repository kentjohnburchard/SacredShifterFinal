import React from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';

interface MysticalHeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  withGlow?: boolean;
  withUnderline?: boolean;
  centered?: boolean;
  withAnimation?: boolean;
  runicStyle?: boolean;
  chakraColor?: string;
}

const MysticalHeading = React.forwardRef<HTMLHeadingElement, MysticalHeadingProps>(({
  children,
  as = 'h2',
  className = '',
  withGlow = true,
  withUnderline = true,
  centered = false,
  withAnimation = true,
  runicStyle = false,
  chakraColor: propChakraColor,
}, ref) => {
  const { chakraState } = useChakra();
  
  // Use provided chakra color or default to the active chakra color
  const chakraColor = propChakraColor || chakraState.color;
  
  const getHeadingStyles = (): React.CSSProperties => {
    return {
      color: withGlow ? chakraColor : undefined,
      textShadow: withGlow ? `0 0 20px ${chakraColor}50, 0 0 40px ${chakraColor}30` : undefined,
      fontFamily: runicStyle ? "'Eczar', serif" : "'Playfair Display', serif",
    };
  };

  const headingContent = (
    <>
      {children}
      {withUnderline && (
        <motion.div 
          className="mt-2 h-0.5 rounded-full mx-auto"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${chakraColor}, transparent)`,
            boxShadow: withGlow ? `0 0 8px ${chakraColor}60` : undefined,
            width: centered ? '60%' : '100%'
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      )}
    </>
  );

  const baseClasses = `
    ${runicStyle ? 'font-mystical' : 'font-heading'} font-semibold tracking-wider leading-tight
    ${centered ? 'text-center' : ''}
    ${className}
  `;

  // Handle animation if requested
  if (withAnimation) {
    return React.createElement(
      motion.div,
      {
        ref,
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: "easeOut" },
        className: "overflow-hidden"
      },
      React.createElement(
        as,
        { className: baseClasses, style: getHeadingStyles() },
        headingContent
      )
    );
  }

  // Default without animation
  return React.createElement(
    as,
    { ref, className: baseClasses, style: getHeadingStyles() },
    headingContent
  );
});

export default MysticalHeading;