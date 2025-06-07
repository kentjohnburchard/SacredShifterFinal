import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Line, Text } from 'react-konva';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { circleMembersData, ritualLogData } from '../../data/sacredCircleData';
import { Users, Activity, Info } from 'lucide-react';

interface SoulThreadViewerProps {
  onMemberSelect?: (memberId: string) => void;
  className?: string;
}

const SoulThreadViewer: React.FC<SoulThreadViewerProps> = ({
  onMemberSelect,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const [viewMode, setViewMode] = useState<'connections' | 'history'>('connections');
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [connectionStrengths, setConnectionStrengths] = useState<Record<string, Record<string, number>>>({});
  const [stageSize, setStageSize] = useState({ width: 600, height: 400 });
  const [memberPositions, setMemberPositions] = useState<Record<string, { x: number, y: number }>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate stage size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.clientWidth,
          height: 400
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Calculate member positions and connection strengths
  useEffect(() => {
    calculateMemberPositions();
    calculateConnectionStrengths();
  }, [stageSize]);
  
  // Calculate member positions in a circle
  const calculateMemberPositions = () => {
    const positions: Record<string, { x: number, y: number }> = {};
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;
    
    circleMembersData.forEach((member, index) => {
      const angle = (index * 2 * Math.PI / circleMembersData.length);
      positions[member.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    setMemberPositions(positions);
  };
  
  // Calculate connection strengths between members
  const calculateConnectionStrengths = () => {
    const strengths: Record<string, Record<string, number>> = {};
    
    // Initialize strengths
    circleMembersData.forEach(member => {
      strengths[member.id] = {};
      
      circleMembersData.forEach(otherMember => {
        if (member.id !== otherMember.id) {
          strengths[member.id][otherMember.id] = 0;
        }
      });
    });
    
    // Calculate strengths based on shared rituals
    ritualLogData.forEach(ritual => {
      const participants = ritual.participants;
      
      // For each pair of participants, increment connection strength
      for (let i = 0; i < participants.length; i++) {
        for (let j = i + 1; j < participants.length; j++) {
          const member1 = participants[i];
          const member2 = participants[j];
          
          if (strengths[member1] && strengths[member1][member2]) {
            strengths[member1][member2] += 1;
            strengths[member2][member1] += 1;
          }
        }
      }
    });
    
    setConnectionStrengths(strengths);
  };
  
  // Get member by ID
  const getMemberById = (id: string) => {
    return circleMembersData.find(m => m.id === id);
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
  
  // Get timeline color
  const getTimelineColor = (timeline: string): string => {
    switch(timeline) {
      case 'past': return 'var(--chakra-root)';
      case 'present': return 'var(--chakra-heart)';
      case 'future': return 'var(--chakra-crown)';
      default: return chakraState.color;
    }
  };
  
  // Handle member click
  const handleMemberClick = (memberId: string) => {
    setSelectedMember(memberId);
    if (onMemberSelect) {
      onMemberSelect(memberId);
    }
  };
  
  // Get shared rituals between members
  const getSharedRituals = (member1Id: string, member2Id: string) => {
    return ritualLogData.filter(ritual => 
      ritual.participants.includes(member1Id) && 
      ritual.participants.includes(member2Id)
    );
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Soul Thread Viewer</h3>
        
        <div className="flex items-center bg-dark-300 rounded-full p-1">
          <button
            onClick={() => setViewMode('connections')}
            className={`px-3 py-1 rounded-full text-sm ${
              viewMode === 'connections' 
                ? 'bg-dark-200 text-white' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users size={16} />
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-3 py-1 rounded-full text-sm ${
              viewMode === 'history' 
                ? 'bg-dark-200 text-white' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Activity size={16} />
          </button>
        </div>
      </div>
      
      <div ref={containerRef} className="relative">
        <Stage width={stageSize.width} height={stageSize.height}>
          <Layer>
            {/* Connection lines */}
            {Object.entries(connectionStrengths).map(([memberId, connections]) => {
              if (!memberPositions[memberId]) return null;
              
              return Object.entries(connections)
                .filter(([otherMemberId, strength]) => {
                  // Only show connections for selected member or strong connections
                  return (
                    (selectedMember === memberId || selectedMember === otherMemberId) ||
                    (hoveredMember === memberId || hoveredMember === otherMemberId) ||
                    (strength > 1 && !selectedMember && !hoveredMember)
                  );
                })
                .map(([otherMemberId, strength]) => {
                  if (!memberPositions[otherMemberId]) return null;
                  
                  const member = getMemberById(memberId);
                  const otherMember = getMemberById(otherMemberId);
                  
                  if (!member || !otherMember) return null;
                  
                  const isHighlighted = 
                    (selectedMember === memberId || selectedMember === otherMemberId) ||
                    (hoveredMember === memberId || hoveredMember === otherMemberId);
                  
                  // Calculate color based on chakras
                  const color1 = getChakraColor(member.primaryChakra);
                  const color2 = getChakraColor(otherMember.primaryChakra);
                  
                  // Use gradient for line
                  const gradient = {
                    start: { x: memberPositions[memberId].x, y: memberPositions[memberId].y },
                    end: { x: memberPositions[otherMemberId].x, y: memberPositions[otherMemberId].y },
                    colorStops: [0, color1, 1, color2]
                  };
                  
                  return (
                    <Line
                      key={`${memberId}-${otherMemberId}`}
                      points={[
                        memberPositions[memberId].x,
                        memberPositions[memberId].y,
                        memberPositions[otherMemberId].x,
                        memberPositions[otherMemberId].y
                      ]}
                      stroke={isHighlighted ? chakraState.color : '#555'}
                      strokeWidth={isHighlighted ? 2 : 1}
                      opacity={isHighlighted ? 0.8 : 0.3 + (strength * 0.1)}
                      // fillLinearGradientStartPoint={gradient.start}
                      // fillLinearGradientEndPoint={gradient.end}
                      // fillLinearGradientColorStops={gradient.colorStops}
                    />
                  );
                });
            })}
            
            {/* Member nodes */}
            {circleMembersData.map(member => {
              if (!memberPositions[member.id]) return null;
              
              const isSelected = selectedMember === member.id;
              const isHovered = hoveredMember === member.id;
              const position = memberPositions[member.id];
              
              return (
                <React.Fragment key={member.id}>
                  <Circle
                    x={position.x}
                    y={position.y}
                    radius={isSelected || isHovered ? 15 : 12}
                    fill={getChakraColor(member.primaryChakra)}
                    opacity={isSelected || isHovered ? 1 : 0.7}
                    stroke={isSelected ? 'white' : undefined}
                    strokeWidth={isSelected ? 2 : 0}
                    shadowColor={getChakraColor(member.primaryChakra)}
                    shadowBlur={isSelected || isHovered ? 10 : 5}
                    shadowOpacity={isSelected || isHovered ? 0.8 : 0.5}
                    onMouseEnter={() => setHoveredMember(member.id)}
                    onMouseLeave={() => setHoveredMember(null)}
                    onClick={() => handleMemberClick(member.id)}
                  />
                  
                  {(isSelected || isHovered) && (
                    <Text
                      x={position.x}
                      y={position.y + 20}
                      text={member.displayName}
                      fontSize={12}
                      fill="white"
                      align="center"
                      offsetX={member.displayName.length * 3}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Layer>
        </Stage>
        
        {/* Info overlay */}
        {selectedMember && hoveredMember && selectedMember !== hoveredMember && (
          <div className="absolute top-4 left-4 bg-dark-100 p-3 rounded-lg max-w-xs">
            <div className="text-sm font-medium text-white mb-1">Connection Details</div>
            <div className="text-xs text-gray-400">
              {getMemberById(selectedMember)?.displayName} & {getMemberById(hoveredMember)?.displayName}
            </div>
            
            <div className="mt-2">
              <div className="text-xs text-gray-300 mb-1">
                Shared Rituals: {getSharedRituals(selectedMember, hoveredMember).length}
              </div>
              
              <div className="text-xs text-gray-400">
                {getSharedRituals(selectedMember, hoveredMember).length > 0 
                  ? `Most recent: ${getSharedRituals(selectedMember, hoveredMember)[0].ritualName}`
                  : 'No shared rituals yet'}
              </div>
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-dark-100 p-2 rounded-lg text-xs text-gray-400 flex items-center">
          <Info size={12} className="mr-1" />
          Thicker lines = stronger connections
        </div>
      </div>
      
      {viewMode === 'history' && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-white mb-2">Recent Shared Rituals</h4>
          
          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
            {ritualLogData.slice(0, 3).map(ritual => (
              <div key={ritual.ritualId} className="p-2 rounded-lg bg-dark-300">
                <div className="text-sm font-medium text-white">{ritual.ritualName}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {new Date(ritual.datePerformed).toLocaleDateString()} • {ritual.participants.length} participants
                </div>
                <div className="flex mt-1 space-x-1">
                  {ritual.participants.slice(0, 5).map(participantId => {
                    const member = getMemberById(participantId);
                    if (!member) return null;
                    
                    return (
                      <div 
                        key={participantId} 
                        className="w-5 h-5 rounded-full overflow-hidden"
                        title={member.displayName}
                      >
                        <img 
                          src={member.avatarUrl} 
                          alt={member.displayName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                  {ritual.participants.length > 5 && (
                    <div className="w-5 h-5 rounded-full bg-dark-400 flex items-center justify-center text-xs text-gray-300">
                      +{ritual.participants.length - 5}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoulThreadViewer;