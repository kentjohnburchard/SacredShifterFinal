import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useChakra } from '../../context/ChakraContext';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, Users, Moon, Zap, Target, Compass } from 'lucide-react';
import TattooButton from '../ui/TattooButton';
import ChakraBadge from '../chakra/ChakraBadge';
import { ChakraType } from '../../types';
import { ritualArchetypes } from '../../data/sacredCircleData';

interface RitualSchedulerProps {
  circleId: string;
  onScheduleComplete?: () => void;
  className?: string;
}

const RitualScheduler: React.FC<RitualSchedulerProps> = ({
  circleId,
  onScheduleComplete,
  className = ''
}) => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  
  // Form state
  const [step, setStep] = useState(1);
  const [ritualType, setRitualType] = useState('');
  const [chakraFocus, setChakraFocus] = useState<ChakraType>(chakraState.type);
  const [timelineFocus, setTimelineFocus] = useState<'past' | 'present' | 'future'>('present');
  const [intentionCategory, setIntentionCategory] = useState<'healing' | 'manifesting' | 'releasing' | 'initiating'>('healing');
  const [customIntention, setCustomIntention] = useState('');
  const [ritualDate, setRitualDate] = useState('');
  const [ritualTime, setRitualTime] = useState('');
  const [ritualDuration, setRitualDuration] = useState(30);
  const [broadcastToAll, setBroadcastToAll] = useState(true);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMoonPhase, setCurrentMoonPhase] = useState<string>('');
  const [nextCelestialEvent, setNextCelestialEvent] = useState<{name: string, date: string} | null>(null);
  
  // Set default date and time on mount
  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setRitualDate(tomorrow.toISOString().split('T')[0]);
    
    // Set default time to 8:00 PM
    setRitualTime('20:00');
    
    // Calculate moon phase (simplified)
    calculateMoonPhase();
    
    // Get next celestial event
    getNextCelestialEvent();
  }, []);
  
  // Calculate current moon phase (simplified)
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
  
  // Get next celestial event
  const getNextCelestialEvent = () => {
    // Sample celestial events
    const events = [
      { name: 'Full Moon', date: '2025-07-12' },
      { name: 'Mercury Retrograde', date: '2025-07-25' },
      { name: 'Summer Solstice', date: '2025-06-21' },
      { name: 'Lunar Eclipse', date: '2025-08-07' }
    ];
    
    // Sort by date and get the next one
    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) > now);
    upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (upcomingEvents.length > 0) {
      setNextCelestialEvent(upcomingEvents[0]);
    }
  };
  
  // Handle ritual type selection
  const handleRitualTypeSelect = (type: string) => {
    setRitualType(type);
    
    // Find the ritual archetype
    const ritual = ritualArchetypes.find(r => r.id === type);
    if (ritual) {
      // Set defaults based on ritual
      setChakraFocus(ritual.primaryChakra);
      setTimelineFocus(ritual.timelineAffinity);
      setRitualDuration(ritual.duration);
      activateChakra(ritual.primaryChakra);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!user || !circleId) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate form
      if (!ritualType || !chakraFocus || !timelineFocus || !intentionCategory || !ritualDate || !ritualTime) {
        setError('Please fill out all required fields');
        setIsSubmitting(false);
        return;
      }
      
      // Combine date and time
      const scheduledFor = new Date(`${ritualDate}T${ritualTime}`);
      
      // Get ritual name
      const ritual = ritualArchetypes.find(r => r.id === ritualType);
      const ritualName = ritual ? ritual.name : 'Custom Ritual';
      
      // Create intention text
      const intentionText = customIntention.trim() || 
        `${getIntentionPrefix(intentionCategory)} through ${chakraFocus} chakra activation in the ${timelineFocus} timeline`;
      
      // Create the ritual session
      const { data, error } = await supabase
        .from('heart_resonance_sessions')
        .insert([
          {
            circle_id: circleId,
            creator_id: user.id,
            title: ritualName,
            description: intentionText,
            scheduled_for: scheduledFor.toISOString(),
            duration_minutes: ritualDuration,
            status: 'scheduled',
            ritual_type: ritualType,
            chakra_focus: chakraFocus,
            timeline_focus: timelineFocus,
            intention_category: intentionCategory,
            broadcast_to_all: broadcastToAll
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // If broadcast is enabled, create a soul call
      if (broadcastToAll) {
        await supabase
          .from('circle_messages')
          .insert([
            {
              circle_id: circleId,
              user_id: user.id,
              content: `📣 I've scheduled a new ritual: "${ritualName}" for ${scheduledFor.toLocaleString()}. Join me for ${intentionText}!`,
              message_type: 'ritual_announcement'
            }
          ]);
      }
      
      // Call onScheduleComplete callback
      if (onScheduleComplete) {
        onScheduleComplete();
      }
      
    } catch (error) {
      console.error('Error scheduling ritual:', error);
      setError('Failed to schedule ritual. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get intention prefix based on category
  const getIntentionPrefix = (category: string): string => {
    switch(category) {
      case 'healing': return 'Healing and restoration';
      case 'manifesting': return 'Manifesting abundance';
      case 'releasing': return 'Releasing blockages';
      case 'initiating': return 'Initiating transformation';
      default: return 'Collective intention';
    }
  };
  
  // Render step content
  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Select Ritual Type</h4>
            
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {ritualArchetypes.map(ritual => (
                <motion.div
                  key={ritual.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    ritualType === ritual.id 
                      ? 'bg-dark-100 ring-2' 
                      : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                  style={{
                    ringColor: ritualType === ritual.id ? chakraState.color : undefined
                  }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleRitualTypeSelect(ritual.id)}
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
          </div>
        );
        
      case 2:
        return (
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Ritual Focus</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Chakra Alignment</label>
                <div className="grid grid-cols-7 gap-2">
                  {(['Root', 'Sacral', 'SolarPlexus', 'Heart', 'Throat', 'ThirdEye', 'Crown'] as ChakraType[]).map((chakra) => (
                    <motion.button
                      key={chakra}
                      type="button"
                      onClick={() => {
                        setChakraFocus(chakra);
                        activateChakra(chakra);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2 rounded-md text-xs text-center transition-colors ${
                        chakraFocus === chakra
                          ? 'ring-2 ring-offset-2 font-semibold'
                          : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
                      }`}
                      style={{
                        backgroundColor: chakraFocus === chakra 
                          ? `${getChakraColor(chakra)}20` 
                          : undefined,
                        color: chakraFocus === chakra 
                          ? getChakraColor(chakra) 
                          : undefined,
                        ringColor: chakraFocus === chakra 
                          ? getChakraColor(chakra) 
                          : undefined
                      }}
                    >
                      {chakra}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Timeline Focus</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['past', 'present', 'future'] as const).map((timeline) => (
                    <motion.button
                      key={timeline}
                      type="button"
                      onClick={() => setTimelineFocus(timeline)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-lg text-center ${
                        timelineFocus === timeline
                          ? 'ring-2'
                          : 'bg-dark-300 hover:bg-dark-400'
                      }`}
                      style={{
                        backgroundColor: timelineFocus === timeline 
                          ? timeline === 'past' ? '#C6282820' : 
                            timeline === 'present' ? '#66BB6A20' : 
                            '#AB47BC20'
                          : undefined,
                        color: timelineFocus === timeline 
                          ? timeline === 'past' ? '#C62828' : 
                            timeline === 'present' ? '#66BB6A' : 
                            '#AB47BC'
                          : 'white',
                        ringColor: timelineFocus === timeline 
                          ? timeline === 'past' ? '#C62828' : 
                            timeline === 'present' ? '#66BB6A' : 
                            '#AB47BC'
                          : undefined
                      }}
                    >
                      <div className="font-medium mb-1">
                        {timeline.charAt(0).toUpperCase() + timeline.slice(1)}
                      </div>
                      <div className="text-xs opacity-80">
                        {timeline === 'past' ? 'Ancestral wisdom' : 
                         timeline === 'present' ? 'Current reality' : 
                         'Future potential'}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Intention Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['healing', 'manifesting', 'releasing', 'initiating'] as const).map((category) => (
                    <motion.button
                      key={category}
                      type="button"
                      onClick={() => setIntentionCategory(category)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-lg text-center ${
                        intentionCategory === category
                          ? 'ring-2'
                          : 'bg-dark-300 hover:bg-dark-400'
                      }`}
                      style={{
                        backgroundColor: intentionCategory === category 
                          ? `${chakraState.color}20`
                          : undefined,
                        ringColor: intentionCategory === category 
                          ? chakraState.color
                          : undefined
                      }}
                    >
                      <div className="font-medium text-white">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Custom Intention (Optional)</label>
                <textarea
                  value={customIntention}
                  onChange={(e) => setCustomIntention(e.target.value)}
                  placeholder="Enter a custom intention for this ritual..."
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                  style={{ focusRingColor: chakraState.color }}
                  rows={2}
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Schedule & Notify</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Date</label>
                  <input
                    type="date"
                    value={ritualDate}
                    onChange={(e) => setRitualDate(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                    style={{ focusRingColor: chakraState.color }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Time</label>
                  <input
                    type="time"
                    value={ritualTime}
                    onChange={(e) => setRitualTime(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                    style={{ focusRingColor: chakraState.color }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Duration (minutes)</label>
                <select
                  value={ritualDuration}
                  onChange={(e) => setRitualDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                  style={{ focusRingColor: chakraState.color }}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="broadcast"
                  checked={broadcastToAll}
                  onChange={(e) => setBroadcastToAll(e.target.checked)}
                  className="h-4 w-4 rounded border-dark-400 bg-dark-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="broadcast" className="ml-2 text-sm text-gray-300">
                  Broadcast Soul Call to all circle members
                </label>
              </div>
              
              {/* Celestial timing suggestions */}
              {currentMoonPhase && (
                <div 
                  className="p-3 rounded-lg"
                  style={{ 
                    backgroundColor: `${chakraState.color}15`,
                    border: `1px solid ${chakraState.color}30`
                  }}
                >
                  <div className="flex items-start">
                    <Moon size={16} className="mr-2 mt-0.5" style={{ color: chakraState.color }} />
                    <div>
                      <div className="text-sm font-medium" style={{ color: chakraState.color }}>
                        Current Moon Phase: {currentMoonPhase}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        {currentMoonPhase === 'Full Moon' 
                          ? 'Excellent time for manifestation and amplification rituals.'
                          : currentMoonPhase === 'New Moon'
                          ? 'Perfect for new beginnings and setting intentions.'
                          : currentMoonPhase.includes('Waxing')
                          ? 'Good for growth and building energy.'
                          : 'Ideal for release work and inner reflection.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {nextCelestialEvent && (
                <div className="p-3 rounded-lg bg-dark-300">
                  <div className="flex items-start">
                    <Compass size={16} className="mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-white">
                        Upcoming: {nextCelestialEvent.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {nextCelestialEvent.date} - Consider aligning your ritual with this event for amplified energy.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
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
        <h3 className="text-lg font-medium text-white">Ritual Sync Scheduler</h3>
        
        {/* Step indicator */}
        <div className="flex items-center space-x-1">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`w-2 h-2 rounded-full ${
                s === step 
                  ? 'bg-white' 
                  : s < step 
                  ? 'bg-gray-400' 
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
      
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1 || isSubmitting}
          className={`px-3 py-1.5 rounded-md text-sm ${
            step === 1 || isSubmitting
              ? 'bg-dark-400 text-gray-500 cursor-not-allowed'
              : 'bg-dark-300 text-gray-300 hover:bg-dark-400'
          }`}
        >
          Back
        </button>
        
        {step < 3 ? (
          <TattooButton
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !ritualType}
            chakraColor={chakraState.color}
            size="sm"
          >
            Next
          </TattooButton>
        ) : (
          <TattooButton
            onClick={handleSubmit}
            disabled={isSubmitting || !ritualType || !chakraFocus || !timelineFocus || !intentionCategory || !ritualDate || !ritualTime}
            chakraColor={chakraState.color}
            size="sm"
          >
            {isSubmitting ? (
              <>
                <motion.span 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block mr-1"
                >
                  ⟳
                </motion.span>
                Scheduling...
              </>
            ) : 'Schedule Ritual'}
          </TattooButton>
        )}
      </div>
    </div>
  );
};

export default RitualScheduler;