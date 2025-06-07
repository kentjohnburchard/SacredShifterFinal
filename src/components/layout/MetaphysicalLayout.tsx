import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import Navbar from './Navbar';
import OSDock from './OSDock';
import CommandBar from '../ui/CommandBar';
import FloatingFormulas from '../ui/FloatingFormulas';

const MetaphysicalLayout: React.FC = () => {
  const { chakraState } = useChakra();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showRipple, setShowRipple] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);
  
  // Track cursor position for effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseClick = () => {
      setShowRipple(true);
      setRippleKey(prev => prev + 1);
      
      // Hide ripple after animation completes
      setTimeout(() => {
        setShowRipple(false);
      }, 1000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseClick);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-ink-black text-ink-white relative overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <OSDock />
        
        <motion.main 
          className="flex-1 overflow-auto p-4 transition-colors duration-500 metatron-cube-bg"
          style={{
            background: `linear-gradient(to bottom, rgba(10,10,18,0.92), rgba(10,10,18,0.96)), 
                      radial-gradient(circle at 50% 50%, ${chakraState.color}20, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 sacred-geometry-bg opacity-30 pointer-events-none"></div>
          <div className="absolute inset-0 fibonacci-bg opacity-20 pointer-events-none"></div>
          
          {/* Subtle floating formulas in background */}
          <div className="absolute inset-0 pointer-events-none">
            <FloatingFormulas density="low" />
          </div>
          
          {/* Main content */}
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </motion.main>
      </div>
      
      {/* Command bar */}
      <CommandBar />
      
      {/* Cursor ripple effect */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            key={rippleKey}
            className="cursor-ripple"
            style={{ 
              left: cursorPosition.x, 
              top: cursorPosition.y,
              borderColor: chakraState.color
            }}
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MetaphysicalLayout;