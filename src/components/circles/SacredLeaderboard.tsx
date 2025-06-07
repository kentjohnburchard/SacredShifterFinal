import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { circleMembersData, ritualLogData, sharedSigilBoardData } from '../../data/sacredCircleData';
import { Trophy, Zap, Heart, Star, Filter } from 'lucide-react';
import ChakraBadge from '../chakra/ChakraBadge';

type LeaderboardCategory = 'resonance' | 'rituals' | 'sigils';

interface SacredLeaderboardProps {
  onMemberSelect?: (memberId: string) => void;
  className?: string;
}

const SacredLeaderboard: React.FC<SacredLeaderboardProps> = ({
  onMemberSelect,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const [category, setCategory] = useState<LeaderboardCategory>('resonance');
  
  // Calculate member stats
  const memberStats = circleMembersData.map(member => {
    // Count rituals participated in
    const ritualCount = ritualLogData.filter(ritual => 
      ritual.participants.includes(member.id)
    ).length;
    
    // Count sigils created
    const sigilCount = sharedSigilBoardData.filter(sigil => 
      sigil.createdBy === member.id
    ).length;
    
    // Calculate average resonance
    const memberRituals = ritualLogData.filter(ritual => 
      ritual.participants.includes(member.id)
    );
    
    const avgResonance = memberRituals.length > 0
      ? memberRituals.reduce((sum, ritual) => sum + ritual.resonanceScore, 0) / memberRituals.length
      : 0;
    
    // Calculate sigil impact
    const sigilImpact = sharedSigilBoardData
      .filter(sigil => sigil.createdBy === member.id)
      .reduce((sum, sigil) => sum + sigil.resonanceImpact, 0);
    
    return {
      ...member,
      ritualCount,
      sigilCount,
      avgResonance,
      sigilImpact
    };
  });
  
  // Sort members based on category
  const getSortedMembers = () => {
    switch(category) {
      case 'resonance':
        return [...memberStats].sort((a, b) => b.avgResonance - a.avgResonance);
      case 'rituals':
        return [...memberStats].sort((a, b) => b.ritualCount - a.ritualCount);
      case 'sigils':
        return [...memberStats].sort((a, b) => b.sigilImpact - a.sigilImpact);
    }
  };
  
  // Get category icon
  const getCategoryIcon = (cat: LeaderboardCategory) => {
    switch(cat) {
      case 'resonance': return <Zap size={16} />;
      case 'rituals': return <Star size={16} />;
      case 'sigils': return <Heart size={16} />;
    }
  };
  
  // Get category label
  const getCategoryLabel = (cat: LeaderboardCategory) => {
    switch(cat) {
      case 'resonance': return 'Resonance';
      case 'rituals': return 'Ritual Mastery';
      case 'sigils': return 'Sigil Impact';
    }
  };
  
  // Get value for current category
  const getCategoryValue = (member: typeof memberStats[0]) => {
    switch(category) {
      case 'resonance': return `${Math.round(member.avgResonance)}%`;
      case 'rituals': return member.ritualCount;
      case 'sigils': return Math.round(member.sigilImpact);
    }
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
  
  const sortedMembers = getSortedMembers();
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white flex items-center">
          <Trophy size={18} className="mr-2" style={{ color: chakraState.color }} />
          Sacred Leaderboard
        </h3>
        
        <div className="flex items-center">
          <Filter size={14} className="mr-1 text-gray-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as LeaderboardCategory)}
            className="bg-dark-300 border-none text-gray-300 text-sm rounded-md focus:outline-none focus:ring-2"
            style={{ focusRingColor: chakraState.color }}
          >
            <option value="resonance">Resonance</option>
            <option value="rituals">Ritual Mastery</option>
            <option value="sigils">Sigil Impact</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
        {sortedMembers.map((member, index) => (
          <motion.div
            key={member.id}
            className="p-3 rounded-lg bg-dark-300 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => onMemberSelect && onMemberSelect(member.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-center">
              {/* Rank */}
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-medium"
                style={{ 
                  backgroundColor: index < 3 ? 
                    (index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32') + '30' : 
                    'rgba(255,255,255,0.1)',
                  color: index < 3 ? 
                    (index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32') : 
                    'rgba(255,255,255,0.7)'
                }}
              >
                {index + 1}
              </div>
              
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img 
                    src={member.avatarUrl} 
                    alt={member.displayName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Aura for top 3 */}
                {index < 3 && (
                  <motion.div
                    className="absolute inset-0 rounded-full -z-10"
                    animate={{ 
                      scale: [1, 1.4, 1],
                      opacity: [0.7, 0, 0.7]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    style={{ 
                      backgroundColor: index === 0 ? '#FFD700' : 
                                      index === 1 ? '#C0C0C0' : 
                                      '#CD7F32'
                    }}
                  />
                )}
              </div>
              
              {/* Member info */}
              <div className="ml-3 flex-1">
                <div className="font-medium text-white">{member.displayName}</div>
                <div className="flex items-center text-xs text-gray-400">
                  <ChakraBadge chakra={member.primaryChakra} size="sm" showLabel={false} />
                  <span className="ml-1">{member.primaryChakra}</span>
                  <span className="mx-1">•</span>
                  <span>Level {member.xpLevel}</span>
                </div>
              </div>
              
              {/* Category value */}
              <div 
                className="px-3 py-1 rounded-full text-sm font-medium flex items-center"
                style={{ 
                  backgroundColor: `${getChakraColor(member.primaryChakra)}20`,
                  color: getChakraColor(member.primaryChakra)
                }}
              >
                {getCategoryIcon(category)}
                <span className="ml-1">{getCategoryValue(member)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-dark-300 text-center">
        <p className="text-xs text-gray-400">
          This leaderboard celebrates growth and contribution, not competition.
          All members are valued for their unique gifts.
        </p>
      </div>
    </div>
  );
};

export default SacredLeaderboard;