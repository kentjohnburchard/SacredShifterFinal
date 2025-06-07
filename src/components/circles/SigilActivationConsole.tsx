import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { sharedSigilBoardData } from '../../data/sacredCircleData';
import { Zap, Clock, Moon, Heart, Users, Eye, Calendar, Filter } from 'lucide-react';
import TattooButton from '../ui/TattooButton';
import ChakraBadge from '../chakra/ChakraBadge';
import { ChakraType } from '../../types';

interface SigilActivationConsoleProps {
  onActivateSigil?: (sigilId: string, activationType: string, scheduledTime?: string) => void;
  className?: string;
}

const SigilActivationConsole: React.FC<SigilActivationConsoleProps> = ({
  onActivateSigil,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const [selectedSigil, setSelectedSigil] = useState<string | null>(null);
  const [activationType, setActivationType] = useState<'immediate' | 'scheduled' | 'lunar'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [lunarPhase, setLunarPhase] = useState<'new' | 'full' | 'first-quarter' | 'last-quarter'>('full');
  const [isActivating, setIsActivating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [filterChakra, setFilterChakra] = useState<ChakraType | 'all'>('all');
  const [filterTimeline, setFilterTimeline] = useState<'all' | 'past' | 'present' | 'future'>('all');
  
  // Set default date and time on mount
  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);
    
    // Set default time to 8:00 PM
    setScheduledTime('20:00');
  }, []);
  
  // Get sigil by ID
  const getSelectedSigil = () => {
    return sharedSigilBoardData.find(s => s.sigilId === selectedSigil);
  };
  
  // Filter sigils
  const getFilteredSigils = () => {
    return sharedSigilBoardData.filter(sigil => {
      if (filterChakra !== 'all' && sigil.chakra !== filterChakra) {
        return false;
      }
      
      if (filterTimeline !== 'all' && sigil.timeline !== filterTimeline) {
        return false;
      }
      
      return true;
    });
  };
  
  // Get chakra color
  const getChakraColor = (chakra: ChakraType): string => {
    const chakraColors: Record<ChakraType, string> = {
      Root: 'var(--chakra-root)',
      Sacral: 'var(--chakra-sacral)',
      SolarPlexus: 'var(--chakra-solarplexus)',
      Heart: 'var(--chakra-heart)',
      Throat: 'var(--chakra-throat)',
      ThirdEye: 'var(--chakra-thirdeye)',
      Crown: 'var(--chakra-crown)'
    };
    
    return chakraColors[chakra];
  };
  
  // Get timeline color
  const getTimelineColor = (timeline: string): string => {
    switch(timeline) {
      case 'past': return 'var(--chakra-root)';
      case 'present': return 'var(--chakra-heart)';
      case 'future': return 'var(--chakra-crown)';
      default: return chakraState.color;
    }
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
  
  // Handle activate sigil
  const handleActivateSigil = () => {
    if (!selectedSigil) return;
    
    setIsActivating(true);
    
    // Prepare activation data
    let activationData = '';
    let scheduledDateTime = '';
    
    if (activationType === 'scheduled' && scheduledDate && scheduledTime) {
      scheduledDateTime = `${scheduledDate}T${scheduledTime}:00`;
      activationData = `scheduled:${scheduledDateTime}`;
    } else if (activationType === 'lunar') {
      activationData = `lunar:${lunarPhase}`;
    } else {
      activationData = 'immediate';
    }
    
    // Simulate activation delay
    setTimeout(() => {
      if (onActivateSigil) {
        onActivateSigil(selectedSigil, activationData, scheduledDateTime);
      }
      
      setIsActivating(false);
      setSelectedSigil(null);
      setShowConfirmation(true);
      
      // Hide confirmation after 3 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    }, 1500);
  };
  
  // Get next lunar phase date (simplified)
  const getNextLunarPhaseDate = (phase: string): string => {
    // This would be calculated based on actual lunar calendar
    // For demo, just return a date in the near future
    const date = new Date();
    
    switch(phase) {
      case 'new': 
        date.setDate(date.getDate() + 14);
        break;
      case 'full': 
        date.setDate(date.getDate() + 7);
        break;
      case 'first-quarter': 
        date.setDate(date.getDate() + 3);
        break;
      case 'last-quarter': 
        date.setDate(date.getDate() + 10);
        break;
    }
    
    return date.toLocaleDateString();
  };
  
  const filteredSigils = getFilteredSigils();
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Sigil Activation Console</h3>
        
        <div className="flex items-center space-x-2">
          <select
            value={filterChakra}
            onChange={(e) => setFilterChakra(e.target.value as ChakraType | 'all')}
            className="bg-dark-300 border-none text-gray-300 text-xs rounded-md focus:outline-none focus:ring-2 py-1 px-2"
            style={{ focusRingColor: chakraState.color }}
          >
            <option value="all">All Chakras</option>
            <option value="Root">Root</option>
            <option value="Sacral">Sacral</option>
            <option value="SolarPlexus">Solar Plexus</option>
            <option value="Heart">Heart</option>
            <option value="Throat">Throat</option>
            <option value="ThirdEye">Third Eye</option>
            <option value="Crown">Crown</option>
          </select>
          
          <select
            value={filterTimeline}
            onChange={(e) => setFilterTimeline(e.target.value as 'all' | 'past' | 'present' | 'future')}
            className="bg-dark-300 border-none text-gray-300 text-xs rounded-md focus:outline-none focus:ring-2 py-1 px-2"
            style={{ focusRingColor: chakraState.color }}
          >
            <option value="all">All Timelines</option>
            <option value="past">Past</option>
            <option value="present">Present</option>
            <option value="future">Future</option>
          </select>
        </div>
      </div>
      
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
            <p>Sigil activation {activationType === 'immediate' ? 'initiated' : 'scheduled'}!</p>
            <p className="text-sm mt-1 text-gray-300">
              {activationType === 'immediate' 
                ? 'The sigil is now active in the quantum field.'
                : activationType === 'scheduled'
                ? `Activation scheduled for ${new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}`
                : `Activation will occur during the next ${lunarPhase.replace('-', ' ')} moon (${getNextLunarPhaseDate(lunarPhase)})`}
            </p>
          </motion.div>
        ) : isActivating ? (
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
            <p className="text-white">
              {activationType === 'immediate' 
                ? 'Activating sigil...'
                : 'Scheduling activation...'}
            </p>
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
              <div className="text-sm text-gray-400 mb-2">Activation Type</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActivationType('immediate')}
                  className={`p-2 rounded-lg text-center ${
                    activationType === 'immediate'
                      ? 'ring-2'
                      : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                  style={{
                    backgroundColor: activationType === 'immediate' ? `${chakraState.color}20` : undefined,
                    ringColor: activationType === 'immediate' ? chakraState.color : undefined
                  }}
                >
                  <Zap size={16} className="mx-auto mb-1" style={{ color: activationType === 'immediate' ? chakraState.color : 'white' }} />
                  <div className="text-xs">Immediate</div>
                </button>
                
                <button
                  onClick={() => setActivationType('scheduled')}
                  className={`p-2 rounded-lg text-center ${
                    activationType === 'scheduled'
                      ? 'ring-2'
                      : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                  style={{
                    backgroundColor: activationType === 'scheduled' ? `${chakraState.color}20` : undefined,
                    ringColor: activationType === 'scheduled' ? chakraState.color : undefined
                  }}
                >
                  <Calendar size={16} className="mx-auto mb-1" style={{ color: activationType === 'scheduled' ? chakraState.color : 'white' }} />
                  <div className="text-xs">Scheduled</div>
                </button>
                
                <button
                  onClick={() => setActivationType('lunar')}
                  className={`p-2 rounded-lg text-center ${
                    activationType === 'lunar'
                      ? 'ring-2'
                      : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                  style={{
                    backgroundColor: activationType === 'lunar' ? `${chakraState.color}20` : undefined,
                    ringColor: activationType === 'lunar' ? chakraState.color : undefined
                  }}
                >
                  <Moon size={16} className="mx-auto mb-1" style={{ color: activationType === 'lunar' ? chakraState.color : 'white' }} />
                  <div className="text-xs">Lunar</div>
                </button>
              </div>
            </div>
            
            {activationType === 'scheduled' && (
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Schedule Activation</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                    style={{ focusRingColor: chakraState.color }}
                  />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                    style={{ focusRingColor: chakraState.color }}
                  />
                </div>
              </div>
            )}
            
            {activationType === 'lunar' && (
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Lunar Phase</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLunarPhase('new')}
                    className={`p-2 rounded-lg text-center ${
                      lunarPhase === 'new'
                        ? 'ring-2'
                        : 'bg-dark-300 hover:bg-dark-400'
                    }`}
                    style={{
                      backgroundColor: lunarPhase === 'new' ? `${chakraState.color}20` : undefined,
                      ringColor: lunarPhase === 'new' ? chakraState.color : undefined
                    }}
                  >
                    <div className="text-sm font-medium text-white">New Moon</div>
                    <div className="text-xs text-gray-400 mt-1">{getNextLunarPhaseDate('new')}</div>
                  </button>
                  
                  <button
                    onClick={() => setLunarPhase('full')}
                    className={`p-2 rounded-lg text-center ${
                      lunarPhase === 'full'
                        ? 'ring-2'
                        : 'bg-dark-300 hover:bg-dark-400'
                    }`}
                    style={{
                      backgroundColor: lunarPhase === 'full' ? `${chakraState.color}20` : undefined,
                      ringColor: lunarPhase === 'full' ? chakraState.color : undefined
                    }}
                  >
                    <div className="text-sm font-medium text-white">Full Moon</div>
                    <div className="text-xs text-gray-400 mt-1">{getNextLunarPhaseDate('full')}</div>
                  </button>
                  
                  <button
                    onClick={() => setLunarPhase('first-quarter')}
                    className={`p-2 rounded-lg text-center ${
                      lunarPhase === 'first-quarter'
                        ? 'ring-2'
                        : 'bg-dark-300 hover:bg-dark-400'
                    }`}
                    style={{
                      backgroundColor: lunarPhase === 'first-quarter' ? `${chakraState.color}20` : undefined,
                      ringColor: lunarPhase === 'first-quarter' ? chakraState.color : undefined
                    }}
                  >
                    <div className="text-sm font-medium text-white">First Quarter</div>
                    <div className="text-xs text-gray-400 mt-1">{getNextLunarPhaseDate('first-quarter')}</div>
                  </button>
                  
                  <button
                    onClick={() => setLunarPhase('last-quarter')}
                    className={`p-2 rounded-lg text-center ${
                      lunarPhase === 'last-quarter'
                        ? 'ring-2'
                        : 'bg-dark-300 hover:bg-dark-400'
                    }`}
                    style={{
                      backgroundColor: lunarPhase === 'last-quarter' ? `${chakraState.color}20` : undefined,
                      ringColor: lunarPhase === 'last-quarter' ? chakraState.color : undefined
                    }}
                  >
                    <div className="text-sm font-medium text-white">Last Quarter</div>
                    <div className="text-xs text-gray-400 mt-1">{getNextLunarPhaseDate('last-quarter')}</div>
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedSigil(null)}
                className="px-3 py-1.5 bg-dark-300 text-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              
              <TattooButton
                onClick={handleActivateSigil}
                chakraColor={chakraState.color}
                className="flex-1 flex items-center justify-center"
              >
                <Zap size={16} className="mr-2" />
                {activationType === 'immediate' 
                  ? 'Activate Now' 
                  : activationType === 'scheduled'
                  ? 'Schedule Activation'
                  : 'Set Lunar Activation'}
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
              Select a sigil to activate or schedule for activation:
            </p>
            
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {filteredSigils.length > 0 ? (
                filteredSigils.map(sigil => (
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
                          <span className="mx-1">•</span>
                          <span>{sigil.evolutionStage}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="flex items-center text-xs">
                          <Heart size={12} className="mr-1 text-pink-400" />
                          <span className="text-gray-300">{sigil.likes}</span>
                        </div>
                        <div className="flex items-center text-xs mt-1">
                          <Zap size={12} className="mr-1 text-yellow-400" />
                          <span className="text-gray-300">{sigil.resonanceImpact}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No sigils match your current filters.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SigilActivationConsole;