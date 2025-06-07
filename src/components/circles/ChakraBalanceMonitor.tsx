import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { ChakraType } from '../../types';
import { circleMembersData } from '../../data/sacredCircleData';
import { AlertCircle, Activity, ArrowRight } from 'lucide-react';
import ChakraBadge from '../chakra/ChakraBadge';
import TattooButton from '../ui/TattooButton';

interface ChakraBalanceMonitorProps {
  onSuggestRitual?: (chakra: ChakraType) => void;
  className?: string;
}

const ChakraBalanceMonitor: React.FC<ChakraBalanceMonitorProps> = ({
  onSuggestRitual,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const [chakraDistribution, setChakraDistribution] = useState<Record<ChakraType, number>>({
    Root: 0,
    Sacral: 0,
    SolarPlexus: 0,
    Heart: 0,
    Throat: 0,
    ThirdEye: 0,
    Crown: 0
  });
  const [weakestChakra, setWeakestChakra] = useState<ChakraType | null>(null);
  const [strongestChakra, setStrongestChakra] = useState<ChakraType | null>(null);
  const [showPoll, setShowPoll] = useState(false);
  const [pollVotes, setPollVotes] = useState<Record<ChakraType, number>>({
    Root: 0,
    Sacral: 0,
    SolarPlexus: 0,
    Heart: 0,
    Throat: 0,
    ThirdEye: 0,
    Crown: 0
  });
  const [userVoted, setUserVoted] = useState(false);
  
  // Calculate chakra distribution on mount
  useEffect(() => {
    calculateChakraDistribution();
  }, []);
  
  // Calculate chakra distribution from members
  const calculateChakraDistribution = () => {
    const distribution: Record<ChakraType, number> = {
      Root: 0,
      Sacral: 0,
      SolarPlexus: 0,
      Heart: 0,
      Throat: 0,
      ThirdEye: 0,
      Crown: 0
    };
    
    // Count members by primary chakra
    circleMembersData.forEach(member => {
      distribution[member.primaryChakra]++;
    });
    
    // Convert to percentages
    const total = circleMembersData.length;
    Object.keys(distribution).forEach(chakra => {
      distribution[chakra as ChakraType] = Math.round((distribution[chakra as ChakraType] / total) * 100);
    });
    
    setChakraDistribution(distribution);
    
    // Find weakest and strongest chakras
    let min = 100;
    let max = 0;
    let weakest: ChakraType = 'Root';
    let strongest: ChakraType = 'Root';
    
    Object.entries(distribution).forEach(([chakra, value]) => {
      if (value < min) {
        min = value;
        weakest = chakra as ChakraType;
      }
      if (value > max) {
        max = value;
        strongest = chakra as ChakraType;
      }
    });
    
    setWeakestChakra(weakest);
    setStrongestChakra(strongest);
  };
  
  // Handle vote in poll
  const handleVote = (chakra: ChakraType) => {
    if (userVoted) return;
    
    setPollVotes({
      ...pollVotes,
      [chakra]: pollVotes[chakra] + 1
    });
    
    setUserVoted(true);
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
  
  // Get suggested ritual for weakest chakra
  const getSuggestedRitual = (): string => {
    if (!weakestChakra) return '';
    
    switch(weakestChakra) {
      case 'Root': return 'Grounding Meditation';
      case 'Sacral': return 'Creative Flow Activation';
      case 'SolarPlexus': return 'Power Center Ignition';
      case 'Heart': return 'Heart Opening Ceremony';
      case 'Throat': return 'Voice Activation Ritual';
      case 'ThirdEye': return 'Vision Quest Journey';
      case 'Crown': return 'Divine Connection Meditation';
    }
  };
  
  // Get total poll votes
  const getTotalVotes = (): number => {
    return Object.values(pollVotes).reduce((sum, count) => sum + count, 0);
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Chakra Balance Monitor</h3>
        
        <button
          onClick={() => setShowPoll(!showPoll)}
          className="text-sm px-2 py-1 rounded-full bg-dark-300 text-gray-300 hover:bg-dark-400"
        >
          {showPoll ? 'Show Distribution' : 'Start Poll'}
        </button>
      </div>
      
      {showPoll ? (
        <div>
          <div className="mb-4 text-center">
            <h4 className="text-sm font-medium text-white mb-2">Which chakra do you feel out of sync with today?</h4>
            <p className="text-xs text-gray-400 mb-4">Your vote helps determine our next group ritual focus.</p>
            
            <div className="grid grid-cols-7 gap-2">
              {(Object.keys(chakraDistribution) as ChakraType[]).map((chakra) => (
                <motion.button
                  key={chakra}
                  onClick={() => handleVote(chakra)}
                  disabled={userVoted}
                  className={`p-2 rounded-md flex flex-col items-center ${
                    userVoted 
                      ? 'cursor-default' 
                      : 'hover:bg-dark-400'
                  }`}
                  whileHover={userVoted ? {} : { scale: 1.05 }}
                >
                  <div 
                    className="w-8 h-8 rounded-full mb-1 flex items-center justify-center"
                    style={{ 
                      backgroundColor: `${getChakraColor(chakra)}20`,
                      color: getChakraColor(chakra)
                    }}
                  >
                    {chakra.charAt(0)}
                  </div>
                  <div className="text-xs text-gray-400">{chakra}</div>
                </motion.button>
              ))}
            </div>
            
            {userVoted && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-white mb-2">Poll Results</h4>
                
                <div className="space-y-2">
                  {(Object.keys(pollVotes) as ChakraType[]).map((chakra) => {
                    const percentage = getTotalVotes() > 0 
                      ? Math.round((pollVotes[chakra] / getTotalVotes()) * 100) 
                      : 0;
                    
                    return (
                      <div key={chakra} className="flex items-center">
                        <div className="w-20 text-xs text-gray-400">{chakra}</div>
                        <div className="flex-1 mx-2">
                          <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full"
                              style={{ backgroundColor: getChakraColor(chakra) }}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                        <div className="w-8 text-xs text-right text-gray-400">{percentage}%</div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 text-center">
                  <TattooButton
                    onClick={() => {
                      // Find chakra with most votes
                      let maxVotes = 0;
                      let maxChakra: ChakraType = 'Heart';
                      
                      Object.entries(pollVotes).forEach(([chakra, votes]) => {
                        if (votes > maxVotes) {
                          maxVotes = votes;
                          maxChakra = chakra as ChakraType;
                        }
                      });
                      
                      if (onSuggestRitual) {
                        onSuggestRitual(maxChakra);
                      }
                    }}
                    chakraColor={chakraState.color}
                    size="sm"
                  >
                    Schedule Ritual for Top Result
                  </TattooButton>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Chakra distribution visualization */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-400">Circle Chakra Distribution</div>
              <div className="flex items-center text-sm">
                <span className="text-gray-400 mr-1">Dominant:</span>
                <ChakraBadge chakra={strongestChakra || 'Heart'} size="sm" />
              </div>
            </div>
            
            <div className="h-4 bg-dark-300 rounded-full overflow-hidden flex">
              {(Object.entries(chakraDistribution) as [ChakraType, number][]).map(([chakra, value]) => {
                return (
                  <motion.div
                    key={chakra}
                    className="h-full"
                    style={{ 
                      width: `${value}%`,
                      backgroundColor: getChakraColor(chakra)
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1 }}
                  />
                );
              })}
            </div>
            
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>R</span>
              <span>S</span>
              <span>SP</span>
              <span>H</span>
              <span>T</span>
              <span>TE</span>
              <span>C</span>
            </div>
          </div>
          
          {/* Imbalance alert */}
          {weakestChakra && chakraDistribution[weakestChakra] < 10 && (
            <motion.div
              className="mb-4 p-3 rounded-lg"
              style={{ 
                backgroundColor: `${getChakraColor(weakestChakra)}15`,
                border: `1px solid ${getChakraColor(weakestChakra)}30`
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start">
                <AlertCircle size={16} className="mr-2 mt-0.5" style={{ color: getChakraColor(weakestChakra) }} />
                <div>
                  <div className="text-sm font-medium" style={{ color: getChakraColor(weakestChakra) }}>
                    {weakestChakra} Chakra Under-Activated
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    Your circle would benefit from a {weakestChakra} chakra balancing ritual.
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <TattooButton
                  onClick={() => onSuggestRitual && onSuggestRitual(weakestChakra)}
                  chakraColor={getChakraColor(weakestChakra)}
                  size="sm"
                >
                  Schedule {getSuggestedRitual()}
                </TattooButton>
              </div>
            </motion.div>
          )}
          
          {/* Chakra insights */}
          <div className="space-y-3">
            {(Object.entries(chakraDistribution) as [ChakraType, number][])
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([chakra, value]) => (
                <div key={chakra} className="p-3 rounded-lg bg-dark-300">
                  <div className="flex items-center justify-between mb-1">
                    <ChakraBadge chakra={chakra} size="sm" />
                    <div className="text-sm" style={{ color: getChakraColor(chakra) }}>{value}%</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {value > 25 
                      ? `Strong ${chakra} energy in your circle. Great for ${getChakraStrength(chakra)}.`
                      : value > 15
                      ? `Balanced ${chakra} energy present.`
                      : `Could benefit from more ${chakra} activation.`}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get chakra strengths
const getChakraStrength = (chakra: ChakraType): string => {
  switch(chakra) {
    case 'Root': return 'grounding and stability work';
    case 'Sacral': return 'creative projects and emotional flow';
    case 'SolarPlexus': return 'manifestation and willpower';
    case 'Heart': return 'healing and compassion rituals';
    case 'Throat': return 'communication and expression';
    case 'ThirdEye': return 'intuition and visioning';
    case 'Crown': return 'spiritual connection and higher wisdom';
  }
};

export default ChakraBalanceMonitor;