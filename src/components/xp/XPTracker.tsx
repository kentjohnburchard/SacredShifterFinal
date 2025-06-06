import React from 'react';
import { useXP } from '../../context/XPProvider';
import { useChakra } from '../../context/ChakraContext';
import { motion } from 'framer-motion';

const XPTracker: React.FC = () => {
  const { xp, level, title, getProgress } = useXP();
  const { chakraState } = useChakra();
  const progress = getProgress() * 100; // Convert to percentage
  
  // Tesla 369 animation parameters
  const teslaPattern = {
    duration: 9,  // Tesla's key number
    cycles: [0, 0.33, 0.66, 1] // 3-6-9 pattern as normalized positions
  };
  
  return (
    <div className="hidden md:flex items-center space-x-2 pr-4">
      <div className="relative h-2 w-32 bg-dark-300 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full"
          style={{ backgroundColor: chakraState.color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        
        {/* Fibonacci sequence markers at key progress points */}
        {[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89].map((point, index) => {
          const position = (point / 89) * 100;
          if (position <= 100 && position > 0) {
            return (
              <div 
                key={index}
                className="absolute top-0 bottom-0 w-px bg-white bg-opacity-30"
                style={{ 
                  left: `${position}%`,
                  display: position > progress ? 'block' : 'none' 
                }}
              />
            );
          }
          return null;
        })}
      </div>
      
      <div className="text-xs">
        <motion.div 
          className="font-medium text-white"
          animate={{
            textShadow: [
              `0 0 3px ${chakraState.color}30`,
              `0 0 6px ${chakraState.color}30`, 
              `0 0 3px ${chakraState.color}30`
            ]
          }}
          transition={{
            duration: teslaPattern.duration,
            times: teslaPattern.cycles,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          Level {level}
        </motion.div>
        <div className="text-gray-400">{title}</div>
      </div>
      
      <motion.div 
        className="text-xs font-medium"
        style={{ color: chakraState.color }}
        animate={{ 
          textShadow: [
            `0 0 3px ${chakraState.color}40`,
            `0 0 6px ${chakraState.color}40`,
            `0 0 9px ${chakraState.color}40`,
            `0 0 6px ${chakraState.color}40`,
            `0 0 3px ${chakraState.color}40`
          ],
          scale: [1, 1.03, 1.06, 1.03, 1]
        }}
        transition={{ 
          duration: teslaPattern.duration,
          times: [0, 0.25, 0.5, 0.75, 1],
          repeat: Infinity
        }}
      >
        {xp} XP
      </motion.div>
    </div>
  );
};

export default XPTracker;