import React from 'react';
import { Calendar, Clock, Users } from 'lucide-react';
import { HeartResonanceSession } from '../../types';
import { useChakra } from '../../context/ChakraContext';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';
import TattooButton from '../ui/TattooButton';

interface HeartResonanceCardProps {
  session: HeartResonanceSession;
  onJoin: (sessionId: string) => void;
}

const HeartResonanceCard: React.FC<HeartResonanceCardProps> = ({ session, onJoin }) => {
  const { chakraState } = useChakra();
  
  const getStatusColor = () => {
    switch(session.status) {
      case 'scheduled':
        return '#8B5CF6'; // Purple
      case 'in_progress':
        return '#10B981'; // Green
      case 'completed':
        return '#6B7280'; // Gray
      case 'cancelled':
        return '#EF4444'; // Red
      default:
        return '#8B5CF6'; // Default purple
    }
  };
  
  const getStatusText = () => {
    switch(session.status) {
      case 'scheduled':
        return 'Scheduled';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Scheduled';
    }
  };
  
  // Check if the session is scheduled for the future
  const isUpcoming = session.scheduled_for 
    ? new Date(session.scheduled_for) > new Date() 
    : false;
    
  // Format the scheduled time
  const scheduledTime = session.scheduled_for 
    ? format(new Date(session.scheduled_for), 'MMM d, yyyy - h:mm a')
    : 'Time not set';
  
  return (
    <motion.div 
      className="bg-dark-200 rounded-2xl p-5 border border-dark-300 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-white">{session.title}</h3>
        <div 
          className="px-2 py-1 text-xs rounded-full font-medium"
          style={{ 
            backgroundColor: `${getStatusColor()}30`,
            color: getStatusColor()
          }}
        >
          {getStatusText()}
        </div>
      </div>
      
      {session.description && (
        <p className="text-gray-300 text-sm mb-4">{session.description}</p>
      )}
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <Calendar size={16} className="mr-2 text-gray-400" />
          <span className="text-gray-300">{scheduledTime}</span>
        </div>
        
        {session.duration_minutes && (
          <div className="flex items-center text-sm">
            <Clock size={16} className="mr-2 text-gray-400" />
            <span className="text-gray-300">{session.duration_minutes} minutes</span>
          </div>
        )}
        
        <div className="flex items-center text-sm">
          <Users size={16} className="mr-2 text-gray-400" />
          <span className="text-gray-300">
            Created by {session.creator?.display_name || 'Unknown'}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-400">
          Created {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
        </div>
        
        {isUpcoming && session.status !== 'cancelled' && (
          <TattooButton
            onClick={() => onJoin(session.id)}
            size="sm"
            chakraColor={chakraState.color}
          >
            Join Session
          </TattooButton>
        )}
      </div>
      
      {session.status === 'in_progress' && (
        <div 
          className="mt-3 p-3 rounded-md text-sm text-center"
          style={{ 
            backgroundColor: `${chakraState.color}20`,
            color: chakraState.color
          }}
        >
          <motion.div 
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            This session is currently active! Join now to participate.
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default HeartResonanceCard;