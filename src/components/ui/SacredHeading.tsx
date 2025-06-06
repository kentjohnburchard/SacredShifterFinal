import React from 'react';
import { motion } from 'framer-motion';

interface SacredHeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  chakraColor?: string;
  withGlow?: boolean;
  withUnderline?: boolean;
  centered?: boolean;
  withAnimation?: boolean;
}

const SacredHeading: React.FC<SacredHeadingProps> = ({
  children,
  as = 'h2',
  className = '',
  chakraColor,
  withGlow = false,
  withUnderline = false,
  centered = false,
  withAnimation = false,
}) => {
  const getHeadingStyles = (): React.CSSProperties => {
    if (!chakraColor) return {};

    return {
      color: chakraColor,
      textShadow: withGlow ? `0 0 10px ${chakraColor}50` : undefined,
    };
  };

  const headingContent = (
    <>
      {children}
      {withUnderline && (
        <div 
          className="mt-1 h-0.5 rounded-full"
          style={{ 
            background: chakraColor,
            boxShadow: withGlow ? `0 0 8px ${chakraColor || 'rgba(255,255,255,0.5)'}` : undefined
          }}
        />
      )}
    </>
  );

  const baseClasses = `
    sacred-heading
    ${centered ? 'text-center' : ''}
    ${className}
  `;

  // Handle animation if requested
  if (withAnimation) {
    return React.createElement(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" },
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

export default SacredHeading;