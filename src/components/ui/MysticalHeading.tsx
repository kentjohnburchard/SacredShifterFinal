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
}

const MysticalHeading: React.FC<MysticalHeadingProps> = ({
  children,
  as = 'h2',
  className = '',
  withGlow = true,
  withUnderline = true,
  centered = false,
  withAnimation = true,
  runicStyle = false,
}) => {
  const { chakraState } = useChakra();
  
  const getHeadingStyles = (): React.CSSProperties => {
    return {
      color: withGlow ? chakraState.color : undefined,
      textShadow: withGlow ? `0 0 20px ${chakraState.color}50, 0 0 40px ${chakraState.color}30` : undefined,
      fontFamily: runicStyle ? "'Eczar', serif" : "'Cardo', serif",
    };
  };

  const headingContent = (
    <>
      {children}
      {withUnderline && (
        <motion.div 
          className="mt-2 h-0.5 rounded-full mx-auto"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${chakraState.color}, transparent)`,
            boxShadow: withGlow ? `0 0 8px ${chakraState.color}60` : undefined,
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
    font-sacred font-semibold tracking-wider leading-tight
    ${centered ? 'text-center' : ''}
    ${runicStyle ? 'font-mystical' : ''}
    ${className}
  `;

  // Handle animation if requested
  if (withAnimation) {
    return React.createElement(
      motion.div,
      {
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
    { className: baseClasses, style: getHeadingStyles() },
    headingContent
  );
};

export default MysticalHeading;