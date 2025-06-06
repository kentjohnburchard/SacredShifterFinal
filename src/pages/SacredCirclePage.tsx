import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Search, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { supabase } from '../lib/supabase';
import { Circle } from '../types';
import { motion } from 'framer-motion';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';

const SacredCirclePage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  const navigate = useNavigate();
  
  const [circles, setCircles] = useState<Circle[]>([]);
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCircle, setIsCreatingCircle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDescription, setNewCircleDescription] = useState('');
  const [newCircleImageUrl, setNewCircleImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchCircles();
    }
  }, [user]);
  
  const fetchCircles = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch circles I've created
      const { data: createdCircles, error: createdError } = await supabase
        .from('circles')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });
        
      if (createdError) throw createdError;
      
      // Fetch circles I'm a member of
      const { data: memberCircles, error: memberError } = await supabase
        .from('circle_members')
        .select('circle_id')
        .eq('user_id', user.id);
        
      if (memberError) throw memberError;
      
      if (memberCircles && memberCircles.length > 0) {
        const circleIds = memberCircles.map(cm => cm.circle_id);
        
        const { data: joinedCircles, error: joinedError } = await supabase
          .from('circles')
          .select('*')
          .in('id', circleIds)
          .order('created_at', { ascending: false });
          
        if (joinedError) throw joinedError;
        
        // Combine both lists, removing duplicates
        const allMyCirclesMap = new Map();
        [...(createdCircles || []), ...(joinedCircles || [])].forEach(circle => {
          allMyCirclesMap.set(circle.id, circle);
        });
        
        setMyCircles(Array.from(allMyCirclesMap.values()));
      } else {
        setMyCircles(createdCircles || []);
      }
      
      // Also fetch some public circles for discovery
      const { data: publicCircles, error: publicError } = await supabase
        .from('circles')
        .select('*')
        .order('love_level', { ascending: false })
        .limit(10);
        
      if (publicError) throw publicError;
      
      setCircles(publicCircles || []);
      
    } catch (error) {
      console.error('Error fetching circles:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateCircle = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      if (!newCircleName.trim()) {
        setErrorMessage('Please enter a name for your circle');
        return;
      }
      
      const { data: circle, error } = await supabase
        .from('circles')
        .insert([
          {
            name: newCircleName.trim(),
            description: newCircleDescription.trim() || null,
            image_url: newCircleImageUrl.trim() || null,
            creator_id: user.id,
            love_level: 0
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Add creator as a member with 'creator' role
      const { error: memberError } = await supabase
        .from('circle_members')
        .insert([
          {
            circle_id: circle.id,
            user_id: user.id,
            role: 'creator'
          }
        ]);
        
      if (memberError) throw memberError;
      
      // Reset form
      setNewCircleName('');
      setNewCircleDescription('');
      setNewCircleImageUrl('');
      setIsCreatingCircle(false);
      
      // Update circles list
      setMyCircles([circle, ...myCircles]);
      
      // Navigate to the new circle
      navigate(`/sacred-circle/${circle.id}`);
      
    } catch (error) {
      console.error('Error creating circle:', error);
      setErrorMessage('Failed to create circle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleJoinCircle = async (circleId: string) => {
    if (!user) return;
    
    try {
      // Check if already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('circle_members')
        .select('*')
        .eq('circle_id', circleId)
        .eq('user_id', user.id);
        
      if (checkError) throw checkError;
      
      if (existingMember && existingMember.length > 0) {
        // Already a member, navigate to circle
        navigate(`/sacred-circle/${circleId}`);
        return;
      }
      
      // Add as a member
      const { error: joinError } = await supabase
        .from('circle_members')
        .insert([
          {
            circle_id: circleId,
            user_id: user.id,
            role: 'member'
          }
        ]);
        
      if (joinError) throw joinError;
      
      // Navigate to the circle
      navigate(`/sacred-circle/${circleId}`);
      
    } catch (error) {
      console.error('Error joining circle:', error);
      alert('Failed to join circle. Please try again.');
    }
  };
  
  const filteredCircles = searchQuery.trim() 
    ? circles.filter(circle => 
        circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (circle.description && circle.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : circles;
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <SacredHeading 
          as="h1" 
          className="text-2xl"
          chakraColor={chakraState.color}
          withGlow
        >
          Sacred Circles
        </SacredHeading>
        
        <TattooButton
          onClick={() => setIsCreatingCircle(true)}
          chakraColor={chakraState.color}
          className="flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Create Circle
        </TattooButton>
      </div>
      
      {isCreatingCircle && (
        <motion.div 
          className="bg-dark-200 p-6 rounded-2xl shadow-chakra-glow border border-dark-300 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <SacredHeading 
              as="h2" 
              className="text-xl"
              chakraColor={chakraState.color}
            >
              Create New Circle
            </SacredHeading>
            <button 
              onClick={() => setIsCreatingCircle(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-md">
              {errorMessage}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Circle Name
              </label>
              <input
                type="text"
                value={newCircleName}
                onChange={(e) => setNewCircleName(e.target.value)}
                className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                placeholder="e.g., Heart Chakra Healers"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={newCircleDescription}
                onChange={(e) => setNewCircleDescription(e.target.value)}
                className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                placeholder="Describe the purpose of your sacred circle..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Circle Image URL (Optional)
              </label>
              <input
                type="text"
                value={newCircleImageUrl}
                onChange={(e) => setNewCircleImageUrl(e.target.value)}
                className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a URL for your circle image
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingCircle(false)}
                className="px-4 py-2 border border-gray-500 text-gray-300 rounded-2xl hover:bg-dark-300"
              >
                Cancel
              </button>
              
              <TattooButton
                onClick={handleCreateCircle}
                disabled={isSubmitting || !newCircleName.trim()}
                chakraColor={chakraState.color}
              >
                {isSubmitting ? (
                  <>
                    <motion.span 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2"
                    >
                      ⟳
                    </motion.span>
                    Creating...
                  </>
                ) : 'Create Circle'}
              </TattooButton>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* My Circles Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <Users size={20} className="mr-2 text-gray-400" />
          <SacredHeading 
            as="h2" 
            className="text-xl"
            chakraColor={chakraState.color}
          >
            My Sacred Circles
          </SacredHeading>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : myCircles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCircles.map((circle) => (
              <CircleCard 
                key={circle.id} 
                circle={circle} 
                onJoin={() => navigate(`/sacred-circle/${circle.id}`)} 
                isMember={true}
                chakraColor={chakraState.color}
              />
            ))}
          </div>
        ) : (
          <div className="bg-dark-200 p-6 rounded-2xl text-center">
            <p className="text-gray-400 mb-4">You haven't joined any sacred circles yet.</p>
            <TattooButton
              onClick={() => setIsCreatingCircle(true)}
              chakraColor={chakraState.color}
              variant="outline"
              size="sm"
            >
              Create Your First Circle
            </TattooButton>
          </div>
        )}
      </div>
      
      {/* Discover Circles Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SacredHeading 
            as="h2" 
            className="text-xl"
            chakraColor={chakraState.color}
          >
            Discover Sacred Circles
          </SacredHeading>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search circles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-dark-300 border border-dark-400 rounded-full text-sm focus:outline-none focus:ring-2"
              style={{ focusRingColor: chakraState.color }}
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredCircles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCircles.map((circle) => (
              <CircleCard 
                key={circle.id} 
                circle={circle}
                onJoin={() => handleJoinCircle(circle.id)}
                isMember={myCircles.some(c => c.id === circle.id)}
                chakraColor={chakraState.color}
              />
            ))}
          </div>
        ) : (
          <div className="bg-dark-200 p-6 rounded-2xl text-center">
            <p className="text-gray-400">
              {searchQuery ? 'No circles match your search.' : 'No circles available for discovery.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface CircleCardProps {
  circle: Circle;
  onJoin: () => void;
  isMember: boolean;
  chakraColor: string;
}

const CircleCard: React.FC<CircleCardProps> = ({ 
  circle, 
  onJoin, 
  isMember,
  chakraColor
}) => {
  return (
    <motion.div 
      className="bg-dark-200 rounded-2xl shadow-md overflow-hidden border border-dark-300"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-32 bg-gradient-to-b from-dark-100 to-dark-300 relative">
        {circle.image_url ? (
          <img 
            src={circle.image_url} 
            alt={circle.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="absolute inset-0 sacred-geometry-bg opacity-30"
            style={{ 
              background: `radial-gradient(circle at center, ${chakraColor}40, transparent), var(--bg-image)` 
            }}
          ></div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{circle.name}</h3>
        
        {circle.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {circle.description}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Heart size={16} className="mr-1 text-pink-500" />
            <span className="text-sm text-gray-400">{circle.love_level || 0}</span>
          </div>
          
          <TattooButton
            onClick={onJoin}
            chakraColor={chakraColor}
            variant={isMember ? "outline" : "primary"}
            size="sm"
          >
            {isMember ? 'Enter Circle' : 'Join Circle'}
          </TattooButton>
        </div>
      </div>
    </motion.div>
  );
};

export default SacredCirclePage;