import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { circleMembersData } from '../../data/sacredCircleData';
import ChakraBadge from '../chakra/ChakraBadge';
import { Clock, ArrowUp, ArrowDown } from 'lucide-react';

interface TimelineTotemProps {
  timeline: 'past' | 'present' | 'future';
  onMemberSelect?: (memberId: string) => void;
  className?: string;
}

const TimelineTotem: React.FC<TimelineTotemProps> = ({
  timeline,
  onMemberSelect,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  
  // Filter members by timeline
  const members = circleMembersData.filter(m => m.timelineAlignment === timeline);
  
  // Sort members by XP level (highest first)
  const sortedMembers = [...members].sort((a, b) => b.xpLevel - a.xpLevel);
  
  // Get timeline color
  const getTimelineColor = (): string => {
    switch(timeline) {
      case 'past': return 'var(--chakra-root)';
      case 'present': return 'var(--chakra-heart)';
      case 'future': return 'var(--chakra-crown)';
    }
  };
  
  // Get timeline icon
  const getTimelineIcon = () => {
    switch(timeline) {
      case 'past': return <ArrowDown size={18} />;
      case 'present': return <Clock size={18} />;
      case 'future': return <ArrowUp size={18} />;
    }
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Timeline header */}
      <motion.div
        className="mb-4 px-4 py-2 rounded-full flex items-center"
        style={{ 
          backgroundColor: `${getTimelineColor()}20`,
          color: getTimelineColor(),
          boxShadow: `0 0 10px ${getTimelineColor()}40`
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="mr-2">{getTimelineIcon()}</span>
        <span className="font-medium">{timeline.charAt(0).toUpperCase() + timeline.slice(1)} Timeline</span>
        <span className="ml-2 bg-dark-200 px-2 rounded-full text-xs">{members.length}</span>
      </motion.div>
      
      {/* Totem pole */}
      <div className="relative">
        {/* Central pole */}
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 w-1 rounded-full"
          style={{ 
            backgroundColor: `${getTimelineColor()}40`,
            height: `${Math.max(sortedMembers.length * 70, 100)}px`,
            top: 20,
            boxShadow: `0 0 10px ${getTimelineColor()}20`
          }}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(sortedMembers.length * 70, 100)}px` }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Members on totem */}
        {sortedMembers.map((member, index) => (
          <motion.div
            key={member.id}
            className="relative mb-16"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{ zIndex: 10 - index }}
          >
            <motion.div
              className="flex items-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
              onClick={() => onMemberSelect && onMemberSelect(member.id)}
            >
              {/* Member avatar */}
              <div 
                className="w-12 h-12 rounded-full overflow-hidden"
                style={{ 
                  border: `2px solid ${getTimelineColor()}`,
                  boxShadow: `0 0 10px ${getTimelineColor()}40`
                }}
              >
                <img 
                  src={member.avatarUrl} 
                  alt={member.displayName} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Member info */}
              <div className="ml-3">
                <div className="font-medium text-white">{member.displayName}</div>
                <div className="flex items-center">
                  <ChakraBadge chakra={member.primaryChakra} size="sm" />
                  <span className="ml-2 text-xs text-gray-400">Lvl {member.xpLevel}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Status message */}
            {hoveredMember === member.id && (
              <motion.div
                className="absolute left-0 right-0 mt-2 p-2 bg-dark-100 rounded-lg text-sm text-gray-300"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                "{member.statusMessage}"
              </motion.div>
            )}
            
            {/* Aura trail for recent activity */}
            {new Date(member.lastRitual).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full -z-10"
                animate={{ 
                  width: ['100%', '150%', '100%'],
                  height: ['100%', '150%', '100%'],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{ 
                  backgroundColor: getTimelineColor(),
                  filter: `blur(8px)`
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TimelineTotem;