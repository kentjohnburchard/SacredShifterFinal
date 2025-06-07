import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { circleMembersData } from '../../data/sacredCircleData';
import { AlertCircle, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import TattooButton from '../ui/TattooButton';

interface TimelineCohesionMonitorProps {
  onSuggestRitual?: (timeline: 'past' | 'present' | 'future') => void;
  className?: string;
}

const TimelineCohesionMonitor: React.FC<TimelineCohesionMonitorProps> = ({
  onSuggestRitual,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const [timelineDistribution, setTimelineDistribution] = useState({
    past: 0,
    present: 0,
    future: 0
  });
  const [cohesionScore, setCohesionScore] = useState(0);
  const [driftAlert, setDriftAlert] = useState<'past' | 'present' | 'future' | null>(null);
  
  // Calculate timeline distribution on mount
  useEffect(() => {
    calculateTimelineDistribution();
  }, []);
  
  // Calculate timeline distribution from members
  const calculateTimelineDistribution = () => {
    const distribution = {
      past: 0,
      present: 0,
      future: 0
    };
    
    // Count members by timeline alignment
    circleMembersData.forEach(member => {
      distribution[member.timelineAlignment]++;
    });
    
    // Convert to percentages
    const total = circleMembersData.length;
    Object.keys(distribution).forEach(timeline => {
      distribution[timeline as keyof typeof distribution] = Math.round((distribution[timeline as keyof typeof distribution] / total) * 100);
    });
    
    setTimelineDistribution(distribution);
    
    // Calculate cohesion score
    // Ideal distribution is 20% past, 60% present, 20% future
    const pastDiff = Math.abs(distribution.past - 20);
    const presentDiff = Math.abs(distribution.present - 60);
    const futureDiff = Math.abs(distribution.future - 20);
    
    // Higher score means better cohesion (100 is perfect)
    const score = 100 - ((pastDiff + presentDiff + futureDiff) / 3);
    setCohesionScore(Math.round(score));
    
    // Check for drift
    if (distribution.past > 40) {
      setDriftAlert('past');
    } else if (distribution.future > 40) {
      setDriftAlert('future');
    } else if (distribution.present < 30) {
      setDriftAlert('present');
    } else {
      setDriftAlert(null);
    }
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
  
  // Get cohesion score color
  const getCohesionScoreColor = (): string => {
    if (cohesionScore >= 80) return '#66BB6A'; // Green
    if (cohesionScore >= 60) return '#FFC107'; // Amber
    return '#EF5350'; // Red
  };
  
  // Get suggested ritual for timeline
  const getSuggestedRitual = (timeline: 'past' | 'present' | 'future'): string => {
    switch(timeline) {
      case 'past': 
        return 'Present Moment Anchoring';
      case 'present': 
        return 'Collective Presence Activation';
      case 'future': 
        return 'Grounding & Integration';
    }
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <h3 className="text-lg font-medium text-white mb-4">Timeline Cohesion Monitor</h3>
      
      {/* Cohesion score */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-400">Cohesion Score</div>
          <div 
            className="text-lg font-medium"
            style={{ color: getCohesionScoreColor() }}
          >
            {cohesionScore}%
          </div>
        </div>
        
        <div className="w-full h-3 bg-dark-300 rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            style={{ backgroundColor: getCohesionScoreColor() }}
            initial={{ width: 0 }}
            animate={{ width: `${cohesionScore}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>Fragmented</span>
          <span>Balanced</span>
          <span>Unified</span>
        </div>
      </div>
      
      {/* Timeline distribution */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Timeline Distribution</div>
        
        <div className="grid grid-cols-3 gap-2">
          {(['past', 'present', 'future'] as const).map((timeline) => (
            <div key={timeline} className="text-center">
              <div className="h-20 bg-dark-300 rounded-lg overflow-hidden relative">
                <motion.div
                  className="absolute bottom-0 left-0 right-0"
                  style={{ 
                    backgroundColor: getTimelineColor(timeline),
                    height: `${timelineDistribution[timeline]}%`
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${timelineDistribution[timeline]}%` }}
                  transition={{ duration: 1 }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
                  {timelineDistribution[timeline]}%
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1 capitalize">{timeline}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Drift alert */}
      {driftAlert && (
        <motion.div
          className="mb-4 p-3 rounded-lg"
          style={{ 
            backgroundColor: `${getTimelineColor(driftAlert)}15`,
            border: `1px solid ${getTimelineColor(driftAlert)}30`
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start">
            <AlertCircle size={16} className="mr-2 mt-0.5" style={{ color: getTimelineColor(driftAlert) }} />
            <div>
              <div className="text-sm font-medium" style={{ color: getTimelineColor(driftAlert) }}>
                {driftAlert === 'past' 
                  ? 'Too many members stuck in Past timeline' 
                  : driftAlert === 'future'
                  ? 'Too many members focused on Future timeline'
                  : 'Not enough members anchored in Present timeline'}
              </div>
              <div className="text-xs text-gray-300 mt-1">
                {driftAlert === 'past' 
                  ? 'This can create stagnation and difficulty manifesting new experiences.' 
                  : driftAlert === 'future'
                  ? 'This can create disconnection from current reality and grounding.'
                  : 'This can create a lack of cohesion and practical manifestation.'}
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <TattooButton
              onClick={() => onSuggestRitual && onSuggestRitual(driftAlert === 'past' ? 'present' : driftAlert === 'future' ? 'past' : 'present')}
              chakraColor={getTimelineColor(driftAlert)}
              size="sm"
            >
              Schedule {getSuggestedRitual(driftAlert)}
            </TattooButton>
          </div>
        </motion.div>
      )}
      
      {/* Timeline anchor suggestions */}
      <div className="space-y-3">
        <div className="text-sm text-gray-400 mb-1">Timeline Anchor Suggestions</div>
        
        <div className="p-3 rounded-lg bg-dark-300">
          <div className="flex items-center">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
              style={{ 
                backgroundColor: `${getTimelineColor('past')}20`,
                color: getTimelineColor('past')
              }}
            >
              <ArrowLeft size={16} />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Ancestral Wisdom Retrieval</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Connect to past timeline for healing and integration
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-dark-300">
          <div className="flex items-center">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
              style={{ 
                backgroundColor: `${getTimelineColor('present')}20`,
                color: getTimelineColor('present')
              }}
            >
              <Clock size={16} />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Present Moment Anchoring</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Strengthen connection to now for manifestation power
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-dark-300">
          <div className="flex items-center">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
              style={{ 
                backgroundColor: `${getTimelineColor('future')}20`,
                color: getTimelineColor('future')
              }}
            >
              <ArrowRight size={16} />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Future Vision Quest</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Connect to future timeline for inspiration and direction
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineCohesionMonitor;