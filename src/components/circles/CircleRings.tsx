import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { ChakraType } from '../../types';
import { circleMembersData } from '../../data/sacredCircleData';
import ChakraBadge from '../chakra/ChakraBadge';

interface CircleRingsProps {
  onMemberSelect?: (memberId: string) => void;
  className?: string;
}

const CircleRings: React.FC<CircleRingsProps> = ({
  onMemberSelect,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  
  // Group members by chakra
  const membersByChakra: Record<ChakraType, typeof circleMembersData> = {
    Root: circleMembersData.filter(m => m.primaryChakra === 'Root'),
    Sacral: circleMembersData.filter(m => m.primaryChakra === 'Sacral'),
    SolarPlexus: circleMembersData.filter(m => m.primaryChakra === 'SolarPlexus'),
    Heart: circleMembersData.filter(m => m.primaryChakra === 'Heart'),
    Throat: circleMembersData.filter(m => m.primaryChakra === 'Throat'),
    ThirdEye: circleMembersData.filter(m => m.primaryChakra === 'ThirdEye'),
    Crown: circleMembersData.filter(m => m.primaryChakra === 'Crown')
  };
  
  // Chakra ring configuration
  const chakraRings: { chakra: ChakraType; radius: number }[] = [
    { chakra: 'Root', radius: 220 },
    { chakra: 'Sacral', radius: 190 },
    { chakra: 'SolarPlexus', radius: 160 },
    { chakra: 'Heart', radius: 130 },
    { chakra: 'Throat', radius: 100 },
    { chakra: 'ThirdEye', radius: 70 },
    { chakra: 'Crown', radius: 40 }
  ];
  
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
  
  return (
    <div className={`relative w-full h-[500px] ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Chakra rings */}
        {chakraRings.map(({ chakra, radius }) => (
          <motion.div
            key={chakra}
            className="absolute rounded-full border"
            style={{
              width: radius * 2,
              height: radius * 2,
              borderColor: `${getChakraColor(chakra)}40`,
              backgroundColor: `${getChakraColor(chakra)}10`
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: [
                `0 0 10px ${getChakraColor(chakra)}20`,
                `0 0 20px ${getChakraColor(chakra)}20`,
                `0 0 10px ${getChakraColor(chakra)}20`
              ]
            }}
            transition={{ 
              duration: 0.5, 
              delay: chakraRings.findIndex(r => r.chakra === chakra) * 0.1,
              boxShadow: {
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
        ))}
        
        {/* Center point */}
        <motion.div
          className="absolute rounded-full z-10"
          style={{
            width: 20,
            height: 20,
            backgroundColor: chakraState.color
          }}
          animate={{ 
            boxShadow: [
              `0 0 10px ${chakraState.color}40`,
              `0 0 20px ${chakraState.color}60`,
              `0 0 10px ${chakraState.color}40`
            ],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Members on rings */}
        {chakraRings.map(({ chakra, radius }) => {
          const members = membersByChakra[chakra];
          return members.map((member, index) => {
            // Calculate position on the circle
            const angle = (index * (2 * Math.PI / members.length));
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <motion.div
                key={member.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`
                }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  scale: hoveredMember === member.id ? 1.2 : 1,
                  boxShadow: hoveredMember === member.id ? 
                    `0 0 15px ${getChakraColor(chakra)}` : 
                    `0 0 5px ${getChakraColor(chakra)}40`
                }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
                onClick={() => onMemberSelect && onMemberSelect(member.id)}
              >
                <div 
                  className="relative w-10 h-10 rounded-full overflow-hidden cursor-pointer"
                  style={{ 
                    border: `2px solid ${getChakraColor(chakra)}`,
                    boxShadow: `0 0 10px ${getChakraColor(chakra)}40`
                  }}
                >
                  <img 
                    src={member.avatarUrl} 
                    alt={member.displayName} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Timeline indicator */}
                  <div 
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full border border-dark-300"
                    style={{ 
                      backgroundColor: member.timelineAlignment === 'past' ? '#C62828' : 
                                      member.timelineAlignment === 'present' ? '#66BB6A' : 
                                      '#AB47BC'
                    }}
                  />
                </div>
                
                {/* Hover info */}
                {hoveredMember === member.id && (
                  <motion.div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 bg-dark-100 rounded-lg p-2 shadow-lg z-30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-center">
                      <div className="font-medium text-white text-sm">{member.displayName}</div>
                      <div className="text-xs text-gray-400">{member.soulName}</div>
                      <div className="mt-1 flex justify-center">
                        <ChakraBadge chakra={member.primaryChakra} size="sm" />
                      </div>
                      <div className="mt-1 text-xs text-gray-400">Level {member.xpLevel}</div>
                      <div 
                        className="mt-1 text-xs px-2 py-0.5 rounded-full mx-auto w-fit"
                        style={{ 
                          backgroundColor: member.timelineAlignment === 'past' ? '#C6282820' : 
                                          member.timelineAlignment === 'present' ? '#66BB6A20' : 
                                          '#AB47BC20',
                          color: member.timelineAlignment === 'past' ? '#C62828' : 
                                member.timelineAlignment === 'present' ? '#66BB6A' : 
                                '#AB47BC'
                        }}
                      >
                        {member.timelineAlignment.charAt(0).toUpperCase() + member.timelineAlignment.slice(1)} Timeline
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Aura trail for recent activity */}
                {new Date(member.lastRitual).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                  <motion.div
                    className="absolute inset-0 rounded-full -z-10"
                    animate={{ 
                      scale: [1, 1.8, 1],
                      opacity: [0.7, 0, 0.7]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    style={{ backgroundColor: getChakraColor(chakra) }}
                  />
                )}
              </motion.div>
            );
          });
        })}
      </div>
    </div>
  );
};

export default CircleRings;