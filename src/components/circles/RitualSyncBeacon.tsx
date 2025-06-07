import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { ritualArchetypes } from '../../data/sacredCircleData';
import { Calendar, Clock, Users, Moon, Zap } from 'lucide-react';
import TattooButton from '../ui/TattooButton';

interface RitualSyncBeaconProps {
  onScheduleRitual?: (ritualId: string, date: string, intention: string) => void;
  className?: string;
}

const RitualSyncBeacon: React.FC<RitualSyncBeaconProps> = ({
  onScheduleRitual,
  className = ''
}) => {
  const { chakraState, activateChakra } = useChakra();
  const [selectedRitual, setSelectedRitual] = useState<string | null>(null);
  const [ritualDate, setRitualDate] = useState('');
  const [ritualTime, setRitualTime] = useState('');
  const [ritualIntention, setRitualIntention] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentMoonPhase, setCurrentMoonPhase] = useState<string>('');
  
  // Get ritual by ID
  const getSelectedRitual = () => {
    return ritualArchetypes.find(r => r.id === selectedRitual);
  };
  
  // Calculate current moon phase (simplified)
  useEffect(() => {
    const calculateMoonPhase = () => {
      // This is a simplified calculation for demo purposes
      const phases = [
        'New Moon', 'Waxing Crescent', 'First Quarter', 
        'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 
        'Last Quarter', 'Waning Crescent'
      ];
      
      // Get a random phase for demo
      const randomPhase = phases[Math.floor(Math.random() * phases.length)];
      setCurrentMoonPhase(randomPhase);
    };
    
    calculateMoonPhase();
  }, []);
  
  // Handle ritual selection
  const handleRitualSelect = (ritualId: string) => {
    setSelectedRitual(ritualId);
    
    // Set default intention based on ritual
    const ritual = ritualArchetypes.find(r => r.id === ritualId);
    if (ritual) {
      setRitualIntention(ritual.description.split('.')[0]);
      activateChakra(ritual.primaryChakra);
    }
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setRitualDate(tomorrow.toISOString().split('T')[0]);
    
    // Set default time to 8:00 PM
    setRitualTime('20:00');
  };
  
  // Handle schedule ritual
  const handleScheduleRitual = () => {
    if (!selectedRitual || !ritualDate || !ritualTime || !ritualIntention.trim()) return;
    
    setIsScheduling(true);
    
    // Combine date and time
    const dateTime = `${ritualDate}T${ritualTime}:00Z`;
    
    // Simulate scheduling delay
    setTimeout(() => {
      if (onScheduleRitual) {
        onScheduleRitual(selectedRitual, dateTime, ritualIntention);
      }
      
      setIsScheduling(false);
      setShowConfirmation(true);
      
      // Reset form
      setSelectedRitual(null);
      setRitualDate('');
      setRitualTime('');
      setRitualIntention('');
      
      // Hide confirmation after 3 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    }, 1500);
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
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Ritual Sync Beacon</h3>
        
        <div 
          className="px-3 py-1 rounded-full text-xs flex items-center"
          style={{ 
            backgroundColor: `${chakraState.color}20`,
            color: chakraState.color
          }}
        >
          <Moon size={12} className="mr-1" />
          {currentMoonPhase}
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
            <Calendar className="mx-auto mb-2" />
            <p>Ritual successfully scheduled!</p>
            <p className="text-sm mt-1 text-gray-300">Circle members will be notified.</p>
          </motion.div>
        ) : isScheduling ? (
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
            <p className="text-white">Sending ritual beacon...</p>
          </motion.div>
        ) : selectedRitual ? (
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
                    backgroundColor: `${getChakraColor(getSelectedRitual()?.primaryChakra || 'Heart')}20`
                  }}
                >
                  {getSelectedRitual()?.primaryChakra.charAt(0)}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-white">{getSelectedRitual()?.name}</div>
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <span>{getSelectedRitual()?.primaryChakra} Chakra</span>
                    <span className="mx-1">•</span>
                    <span>{getSelectedRitual()?.timelineAffinity} timeline</span>
                    <span className="mx-1">•</span>
                    <span>{getSelectedRitual()?.duration} min</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date & Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={ritualDate}
                    onChange={(e) => setRitualDate(e.target.value)}
                    className="px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                    style={{ focusRingColor: chakraState.color }}
                  />
                  <input
                    type="time"
                    value={ritualTime}
                    onChange={(e) => setRitualTime(e.target.value)}
                    className="px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                    style={{ focusRingColor: chakraState.color }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Ritual Intention</label>
                <textarea
                  value={ritualIntention}
                  onChange={(e) => setRitualIntention(e.target.value)}
                  placeholder="Set your intention for this ritual"
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                  style={{ focusRingColor: chakraState.color }}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedRitual(null)}
                className="px-3 py-1.5 bg-dark-300 text-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              
              <TattooButton
                onClick={handleScheduleRitual}
                disabled={!ritualDate || !ritualTime || !ritualIntention.trim()}
                chakraColor={chakraState.color}
                className="flex-1 flex items-center justify-center"
              >
                <Calendar size={16} className="mr-2" />
                Schedule Ritual
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
              Select a ritual archetype to schedule with your circle:
            </p>
            
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {ritualArchetypes.map(ritual => (
                <motion.div
                  key={ritual.id}
                  className="p-3 rounded-lg bg-dark-300 cursor-pointer"
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: `rgba(30, 30, 30, 0.8)` 
                  }}
                  onClick={() => handleRitualSelect(ritual.id)}
                >
                  <div className="flex items-start">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ 
                        backgroundColor: `${getChakraColor(ritual.primaryChakra)}20`
                      }}
                    >
                      {ritual.primaryChakra.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-white">{ritual.name}</div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">{ritual.description}</div>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <span 
                          className="px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${getChakraColor(ritual.primaryChakra)}20`,
                            color: getChakraColor(ritual.primaryChakra)
                          }}
                        >
                          {ritual.primaryChakra}
                        </span>
                        <span className="mx-2 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {ritual.duration} min
                        </span>
                        <span className="flex items-center">
                          <Users size={12} className="mr-1" />
                          {ritual.minParticipants}-{ritual.maxParticipants}
                        </span>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: ritual.timelineAffinity === 'past' ? '#C6282820' : 
                                        ritual.timelineAffinity === 'present' ? '#66BB6A20' : 
                                        '#AB47BC20',
                        color: ritual.timelineAffinity === 'past' ? '#C62828' : 
                              ritual.timelineAffinity === 'present' ? '#66BB6A' : 
                              '#AB47BC'
                      }}
                    >
                      {ritual.timelineAffinity}
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

export default RitualSyncBeacon;