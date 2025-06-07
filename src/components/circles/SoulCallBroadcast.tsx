import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { Radio, Volume2, VolumeX, Users, Zap } from 'lucide-react';
import TattooButton from '../ui/TattooButton';

interface SoulCallBroadcastProps {
  onBroadcast?: (message: string, chakra: string) => void;
  className?: string;
}

const SoulCallBroadcast: React.FC<SoulCallBroadcastProps> = ({
  onBroadcast,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [broadcastDuration, setBroadcastDuration] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  
  // Handle broadcast timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBroadcasting) {
      // Start timer
      interval = setInterval(() => {
        setBroadcastDuration(prev => prev + 1);
        
        // Simulate users joining
        if (Math.random() > 0.7) {
          setActiveUsers(prev => Math.min(prev + 1, 12));
        }
      }, 1000);
    } else {
      // Reset timer and users
      setBroadcastDuration(0);
      setActiveUsers(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBroadcasting]);
  
  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle start broadcast
  const handleStartBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    
    setIsBroadcasting(true);
    
    // Play sound if enabled
    if (soundEnabled) {
      // This would play a sound in a real implementation
      console.log('Playing broadcast sound');
    }
    
    // Call onBroadcast callback
    if (onBroadcast) {
      onBroadcast(broadcastMessage, chakraState.type);
    }
  };
  
  // Handle stop broadcast
  const handleStopBroadcast = () => {
    setIsBroadcasting(false);
    setBroadcastMessage('');
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Soul Call Broadcast</h3>
        
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-gray-400 hover:text-white"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
      
      <AnimatePresence mode="wait">
        {isBroadcasting ? (
          <motion.div
            key="broadcasting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
              animate={{ 
                scale: [1, 1.2, 1],
                boxShadow: [
                  `0 0 20px ${chakraState.color}40`,
                  `0 0 40px ${chakraState.color}60`,
                  `0 0 20px ${chakraState.color}40`
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
              style={{ backgroundColor: chakraState.color }}
            >
              <Radio size={32} className="text-white" />
            </motion.div>
            
            <div 
              className="text-lg font-medium mb-2"
              style={{ color: chakraState.color }}
            >
              Broadcasting Soul Call
            </div>
            
            <div className="text-gray-300 mb-4">
              "{broadcastMessage}"
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-400 flex items-center">
                <Clock size={14} className="mr-1" />
                {formatDuration(broadcastDuration)}
              </div>
              
              <div className="text-sm text-gray-400 flex items-center">
                <Users size={14} className="mr-1" />
                {activeUsers} listening
              </div>
            </div>
            
            <TattooButton
              onClick={handleStopBroadcast}
              chakraColor={chakraState.color}
              variant="outline"
            >
              End Broadcast
            </TattooButton>
            
            {/* Ripple effect */}
            <div className="relative mt-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                  style={{ 
                    borderColor: chakraState.color,
                    width: 20,
                    height: 20
                  }}
                  animate={{ 
                    width: [20, 200],
                    height: [20, 200],
                    opacity: [0.8, 0],
                    borderWidth: [2, 0.5]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 1.3,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-300 mb-3">
              Send a soul call to all circle members for collective focus:
            </p>
            
            <div className="mb-4">
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter your soul call message..."
                className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                rows={3}
              />
            </div>
            
            <TattooButton
              onClick={handleStartBroadcast}
              disabled={!broadcastMessage.trim()}
              chakraColor={chakraState.color}
              className="w-full flex items-center justify-center"
            >
              <Zap size={16} className="mr-2" />
              Broadcast Soul Call
            </TattooButton>
            
            <div className="mt-3 text-xs text-gray-400 text-center">
              Broadcasting will notify all circle members and invite them to join in collective focus
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoulCallBroadcast;