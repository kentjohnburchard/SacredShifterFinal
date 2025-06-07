import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { sharedSigilBoardData } from '../../data/sacredCircleData';
import { Send, Heart, MessageCircle, Zap } from 'lucide-react';
import TattooButton from '../ui/TattooButton';

interface SigilPingSystemProps {
  onPingSigil?: (sigilId: string) => void;
  className?: string;
}

const SigilPingSystem: React.FC<SigilPingSystemProps> = ({
  onPingSigil,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const [selectedSigil, setSelectedSigil] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingMessage, setPingMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Get sigil by ID
  const getSelectedSigil = () => {
    return sharedSigilBoardData.find(s => s.sigilId === selectedSigil);
  };
  
  // Get chakra color
  const getChakraColor = (chakra: string): string => {
    const chakraColors: Record<string, string> = {
      Root: 'var(--chakra-root)',
      Sacral: 'var(--chakra-sacral)',
      SolarPlexus: 'var(--chakra-solarplexus)',
      Heart: 'var(--chakra-heart)',
      Throat: 'var(--chakra-throat)',
      ThirdEye: 'var(--chakra-thirdeye)',
      Crown: 'var(--chakra-crown)'
    };
    
    return chakraColors[chakra] || chakraState.color;
  };
  
  // Get evolution stage icon
  const getEvolutionStageIcon = (stage: string) => {
    switch(stage) {
      case 'seed': return '🌱';
      case 'sprout': return '🌿';
      case 'bloom': return '🌸';
      case 'mature': return '🌳';
      case 'transcendent': return '✨';
      default: return '🌱';
    }
  };
  
  // Handle ping sigil
  const handlePingSigil = () => {
    if (!selectedSigil) return;
    
    setIsPinging(true);
    
    // Simulate ping delay
    setTimeout(() => {
      if (onPingSigil) {
        onPingSigil(selectedSigil);
      }
      
      setIsPinging(false);
      setSelectedSigil(null);
      setPingMessage('');
      setShowConfirmation(true);
      
      // Hide confirmation after 3 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    }, 1500);
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <h3 className="text-lg font-medium text-white mb-4">Sigil Ping System</h3>
      
      <AnimatePresence>
        {showConfirmation ? (
          <motion.div
            className="p-4 rounded-lg text-center"
            style={{ 
              backgroundColor: `${chakraState.color}20`,
              color: chakraState.color
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Zap className="mx-auto mb-2" />
            <p>Sigil successfully pinged to the circle!</p>
            <p className="text-sm mt-1 text-gray-300">Members will receive your activation request.</p>
          </motion.div>
        ) : isPinging ? (
          <motion.div
            className="p-4 rounded-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-12 h-12 mx-auto mb-3 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                boxShadow: [
                  `0 0 10px ${chakraState.color}40`,
                  `0 0 30px ${chakraState.color}60`,
                  `0 0 10px ${chakraState.color}40`
                ]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop"
              }}
              style={{ backgroundColor: chakraState.color }}
            />
            <p className="text-white">Pinging sigil to the circle...</p>
          </motion.div>
        ) : selectedSigil ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 p-3 rounded-lg bg-dark-300">
              <div className="flex items-start">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                  style={{ 
                    backgroundColor: `${getChakraColor(getSelectedSigil()?.chakra || 'Heart')}20`
                  }}
                >
                  {getEvolutionStageIcon(getSelectedSigil()?.evolutionStage || 'seed')}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-white">{getSelectedSigil()?.intention}</div>
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <span>{getSelectedSigil()?.chakra} Chakra</span>
                    <span className="mx-1">•</span>
                    <span>{getSelectedSigil()?.timeline} timeline</span>
                    <span className="mx-1">•</span>
                    <span>{getSelectedSigil()?.evolutionStage}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                value={pingMessage}
                onChange={(e) => setPingMessage(e.target.value)}
                placeholder="Add a message with your ping (optional)"
                className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedSigil(null)}
                className="px-3 py-1.5 bg-dark-300 text-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              
              <TattooButton
                onClick={handlePingSigil}
                chakraColor={chakraState.color}
                className="flex-1 flex items-center justify-center"
              >
                <Send size={16} className="mr-2" />
                Ping Sigil
              </TattooButton>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-300 mb-3">
              Select a sigil to ping to the circle for collective activation:
            </p>
            
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {sharedSigilBoardData.map(sigil => (
                <motion.div
                  key={sigil.sigilId}
                  className="p-3 rounded-lg bg-dark-300 cursor-pointer"
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: `rgba(30, 30, 30, 0.8)` 
                  }}
                  onClick={() => setSelectedSigil(sigil.sigilId)}
                >
                  <div className="flex items-start">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ 
                        backgroundColor: `${getChakraColor(sigil.chakra)}20`
                      }}
                    >
                      {getEvolutionStageIcon(sigil.evolutionStage)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-white">{sigil.intention}</div>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <span>{sigil.chakra} Chakra</span>
                        <span className="mx-1">•</span>
                        <span>{sigil.timeline} timeline</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-xs">
                        <Heart size={12} className="mr-1 text-pink-400" />
                        <span className="text-gray-300">{sigil.likes}</span>
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <MessageCircle size={12} className="mr-1 text-gray-400" />
                        <span className="text-gray-300">{sigil.comments}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SigilPingSystem;