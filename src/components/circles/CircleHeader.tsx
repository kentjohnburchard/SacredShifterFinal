import React from 'react';
import { Heart, Users, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Circle, CircleMember } from '../../types';
import { useChakra } from '../../context/ChakraContext';
import TattooButton from '../ui/TattooButton';

interface CircleHeaderProps {
  circle: Circle;
  members: CircleMember[];
  isCreator: boolean;
  onJoin: () => void;
  onLeave: () => void;
  isMember: boolean;
}

const CircleHeader: React.FC<CircleHeaderProps> = ({
  circle,
  members,
  isCreator,
  onJoin,
  onLeave,
  isMember
}) => {
  const { chakraState } = useChakra();
  const navigate = useNavigate();
  
  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <button 
          onClick={() => navigate('/sacred-circle')}
          className="mr-2 p-1 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white">{circle.name}</h1>
      </div>
      
      <div className="bg-dark-200 rounded-2xl overflow-hidden border border-dark-300">
        <div className="h-48 relative">
          {circle.image_url ? (
            <img 
              src={circle.image_url} 
              alt={circle.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-200 to-dark-100">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 sacred-geometry-bg opacity-40"
                style={{ backgroundColor: `${chakraState.color}10` }}
              />
            </div>
          )}
          
          <motion.div 
            className="absolute bottom-0 left-0 right-0 py-2 px-4 bg-gradient-to-t from-black to-transparent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="flex items-center px-3 py-1 rounded-full bg-black bg-opacity-50"
                  style={{ boxShadow: `0 0 10px ${chakraState.color}40` }}
                >
                  <Users size={16} className="mr-2 text-gray-300" />
                  <span className="text-sm text-gray-200">
                    {members.length} {members.length === 1 ? 'Member' : 'Members'}
                  </span>
                </div>
                
                <div 
                  className="flex items-center px-3 py-1 rounded-full bg-black bg-opacity-50 ml-2"
                  style={{ boxShadow: `0 0 10px ${chakraState.color}40` }}
                >
                  <Heart size={16} className="mr-2 text-pink-400" />
                  <span className="text-sm text-gray-200">{circle.love_level || 0}</span>
                </div>
              </div>
              
              {isMember ? (
                isCreator ? (
                  <TattooButton
                    chakraColor={chakraState.color}
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/sacred-circle/${circle.id}/edit`)}
                  >
                    Edit Circle
                  </TattooButton>
                ) : (
                  <TattooButton
                    chakraColor={chakraState.color}
                    size="sm"
                    variant="outline"
                    onClick={onLeave}
                  >
                    Leave Circle
                  </TattooButton>
                )
              ) : (
                <TattooButton
                  chakraColor={chakraState.color}
                  size="sm"
                  onClick={onJoin}
                >
                  Join Circle
                </TattooButton>
              )}
            </div>
          </motion.div>
        </div>
        
        <div className="p-4">
          {circle.description && (
            <p className="text-gray-300 mb-4">
              {circle.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="relative group">
                <div 
                  className="w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center overflow-hidden"
                  style={{ 
                    boxShadow: member.role === 'creator' ? `0 0 0 2px ${chakraState.color}` : undefined 
                  }}
                >
                  {member.user?.avatar_url ? (
                    <img 
                      src={member.user.avatar_url} 
                      alt={member.user.display_name || 'Member'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users size={16} className="text-gray-400" />
                  )}
                </div>
                
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-dark-200 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {member.user?.display_name || 'Member'}
                  {member.role === 'creator' && (
                    <span className="ml-1 text-xs\" style={{ color: chakraState.color }}>
                      (Creator)
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {members.length > 5 && (
              <div className="w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center text-gray-400 text-xs">
                +{members.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleHeader;