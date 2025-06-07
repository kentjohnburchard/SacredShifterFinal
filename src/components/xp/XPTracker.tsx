import React from 'react';
import { useXP } from '../../context/XPProvider';
import { useChakra } from '../../context/ChakraContext';
import { motion, AnimatePresence } from 'framer-motion';

const XPTracker: React.FC = () => {
  const { xp, level, title, getProgress } = useXP();
  const { chakraState } = useChakra();
  const [showDetails, setShowDetails] = React.useState(false);
  const progress = getProgress() * 100; // Convert to percentage
  
  // Tesla 369 animation parameters
  const teslaPattern = {
    duration: 9,  // Tesla's key number
    cycles: [0, 0.33, 0.66, 1] // 3-6-9 pattern as normalized positions
  };
  
  return (
    <div className="relative">
      <div 
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-ink-shadow cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="relative h-2 w-24 bg-ink-accent rounded-full overflow-hidden">
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
      
      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="absolute right-0 mt-2 w-64 glass-dark rounded-xl shadow-lg z-10 p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-sacred text-lg" style={{ color: chakraState.color }}>
                Level {level}
              </div>
              <div className="text-sm text-gray-300">{title}</div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress to Level {level + 1}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-ink-accent rounded-full overflow-hidden">
                <motion.div 
                  className="h-full"
                  style={{ backgroundColor: chakraState.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-mystical" style={{ color: chakraState.color }}>
                {xp}
              </div>
              <div className="text-xs text-gray-400">Total Light Points</div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-ink-accent">
              <div className="text-xs text-gray-400">Recent Achievements:</div>
              <div className="text-sm mt-1">
                • Completed Heart Resonance Ritual
              </div>
              <div className="text-sm">
                • Created 3 Soul Sigils
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default XPTracker;