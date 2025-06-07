import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { ritualLogData, circleMembersData } from '../../data/sacredCircleData';
import { Calendar, Clock, Users, Zap, Search } from 'lucide-react';
import { format } from 'date-fns';

interface RitualLogDisplayProps {
  onRitualSelect?: (ritualId: string) => void;
  className?: string;
}

const RitualLogDisplay: React.FC<RitualLogDisplayProps> = ({
  onRitualSelect,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter rituals by search query
  const filteredRituals = ritualLogData.filter(ritual => 
    ritual.ritualName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ritual.intention.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get member by ID
  const getMemberById = (id: string) => {
    return circleMembersData.find(m => m.id === id);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy - h:mm a');
  };
  
  // Get resonance color
  const getResonanceColor = (score: number): string => {
    if (score >= 90) return '#AB47BC'; // Purple for excellent
    if (score >= 75) return '#66BB6A'; // Green for good
    if (score >= 60) return '#FFC107'; // Amber for moderate
    return '#EF5350'; // Red for low
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Ritual Log</h3>
        
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rituals..."
            className="pl-8 pr-3 py-1 bg-dark-300 border border-dark-400 rounded-full text-sm text-white focus:outline-none focus:ring-2"
            style={{ focusRingColor: chakraState.color }}
          />
          <Search size={14} className="absolute left-2.5 top-1.5 text-gray-400" />
        </div>
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {filteredRituals.length > 0 ? (
          filteredRituals.map((ritual, index) => (
            <motion.div
              key={ritual.ritualId}
              className="p-4 rounded-lg bg-dark-300 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => onRitualSelect && onRitualSelect(ritual.ritualId)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-medium text-white">{ritual.ritualName}</h4>
                <div 
                  className="px-2 py-1 text-xs rounded-full flex items-center"
                  style={{ 
                    backgroundColor: `${getResonanceColor(ritual.resonanceScore)}20`,
                    color: getResonanceColor(ritual.resonanceScore)
                  }}
                >
                  <Zap size={12} className="mr-1" />
                  {ritual.resonanceScore}%
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-3">
                "{ritual.intention}"
              </p>
              
              <div className="text-xs text-gray-400 mb-3">
                <div className="font-medium text-gray-300">Outcome:</div>
                <p>{ritual.outcome}</p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {ritual.participants.map(participantId => {
                  const member = getMemberById(participantId);
                  if (!member) return null;
                  
                  return (
                    <div 
                      key={participantId} 
                      className="w-6 h-6 rounded-full overflow-hidden"
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
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center">
                  <Calendar size={12} className="mr-1" />
                  {formatDate(ritual.datePerformed)}
                </div>
                
                <div className="flex items-center">
                  <Users size={12} className="mr-1" />
                  {ritual.participants.length} participants
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            No rituals found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default RitualLogDisplay;