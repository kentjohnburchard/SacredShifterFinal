import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { supabase } from '../lib/supabase';
import { Circle } from '../types';
import { motion } from 'framer-motion';
import { Users, Grid, Activity, MessageSquare, Calendar } from 'lucide-react';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';
import FloatingFormulas from '../components/ui/FloatingFormulas';

// Import Sacred Circle components
import CircleRings from '../components/circles/CircleRings';
import TimelineTotem from '../components/circles/TimelineTotem';
import SigilPingSystem from '../components/circles/SigilPingSystem';
import RitualSyncBeacon from '../components/circles/RitualSyncBeacon';
import SoulCallBroadcast from '../components/circles/SoulCallBroadcast';
import SacredLeaderboard from '../components/circles/SacredLeaderboard';
import MessageScrolls from '../components/circles/MessageScrolls';
import RitualLogDisplay from '../components/circles/RitualLogDisplay';
import CircleMetrics from '../components/circles/CircleMetrics';

// Import placeholder data
import { circleMembersData } from '../data/sacredCircleData';

const SacredCirclePage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  const navigate = useNavigate();
  
  const [circles, setCircles] = useState<Circle[]>([]);
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCircle, setIsCreatingCircle] = useState(false);
  const [activeTab, setActiveTab] = useState('community');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'rings' | 'totems'>('rings');
  
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
  
  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(memberId);
    // In a real app, you would fetch member details and show a profile modal
    console.log('Selected member:', memberId);
  };
  
  const handlePingSigil = (sigilId: string) => {
    // In a real app, you would broadcast the sigil to all members
    console.log('Pinged sigil:', sigilId);
  };
  
  const handleScheduleRitual = (ritualId: string, date: string, intention: string) => {
    // In a real app, you would create a ritual and notify members
    console.log('Scheduled ritual:', ritualId, date, intention);
  };
  
  const handleSoulCall = (message: string, chakra: string) => {
    // In a real app, you would broadcast the soul call to all members
    console.log('Soul call broadcast:', message, chakra);
  };
  
  const handleSendMessage = (message: string, emojiIntent: string, sigilId?: string) => {
    // In a real app, you would send the message to the circle
    console.log('Sent message:', message, emojiIntent, sigilId);
  };
  
  const handleRitualSelect = (ritualId: string) => {
    // In a real app, you would show ritual details
    console.log('Selected ritual:', ritualId);
  };
  
  // Get selected member
  const getSelectedMember = () => {
    return circleMembersData.find(m => m.id === selectedMember);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <SacredHeading 
          as="h1" 
          className="text-2xl"
          chakraColor={chakraState.color}
          withGlow
        >
          Sacred Circle
        </SacredHeading>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-dark-300 rounded-full p-1">
            <button
              onClick={() => setViewMode('rings')}
              className={`px-3 py-1 rounded-full text-sm ${
                viewMode === 'rings' 
                  ? 'bg-dark-200 text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('totems')}
              className={`px-3 py-1 rounded-full text-sm ${
                viewMode === 'totems' 
                  ? 'bg-dark-200 text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Activity size={16} />
            </button>
          </div>
          
          <TattooButton
            onClick={() => setIsCreatingCircle(true)}
            chakraColor={chakraState.color}
            className="flex items-center"
          >
            <Users size={18} className="mr-1" />
            My Circles
          </TattooButton>
        </div>
      </div>
      
      <Tabs
        defaultValue="community"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="border-b border-dark-300 mb-6">
          <TabsList className="flex">
            <TabsTrigger 
              value="community"
              className="flex items-center px-4 py-2 text-gray-400 border-b-2 border-transparent"
              activeClassName="text-white border-current"
              style={{ borderColor: activeTab === 'community' ? chakraState.color : 'transparent' }}
            >
              <Users size={18} className="mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger 
              value="rituals"
              className="flex items-center px-4 py-2 text-gray-400 border-b-2 border-transparent"
              activeClassName="text-white border-current"
              style={{ borderColor: activeTab === 'rituals' ? chakraState.color : 'transparent' }}
            >
              <Calendar size={18} className="mr-2" />
              Rituals
            </TabsTrigger>
            <TabsTrigger 
              value="messages"
              className="flex items-center px-4 py-2 text-gray-400 border-b-2 border-transparent"
              activeClassName="text-white border-current"
              style={{ borderColor: activeTab === 'messages' ? chakraState.color : 'transparent' }}
            >
              <MessageSquare size={18} className="mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main visualization area */}
            <div className="lg:col-span-2 bg-dark-200 p-4 rounded-2xl border border-dark-300 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <FloatingFormulas density="low" />
              </div>
              
              {viewMode === 'rings' ? (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Chakra-Based Circle Rings</h3>
                  <CircleRings onMemberSelect={handleMemberSelect} />
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Timeline Totem Poles</h3>
                  <div className="flex justify-around">
                    <TimelineTotem timeline="past" onMemberSelect={handleMemberSelect} />
                    <TimelineTotem timeline="present" onMemberSelect={handleMemberSelect} />
                    <TimelineTotem timeline="future" onMemberSelect={handleMemberSelect} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Right sidebar */}
            <div className="space-y-6">
              {selectedMember ? (
                <motion.div
                  className="bg-dark-200 p-4 rounded-2xl border border-dark-300"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-white">Member Profile</h3>
                    <button
                      onClick={() => setSelectedMember(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      <img 
                        src={getSelectedMember()?.avatarUrl} 
                        alt={getSelectedMember()?.displayName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div>
                      <div className="text-xl font-medium text-white">{getSelectedMember()?.displayName}</div>
                      <div className="text-gray-400">{getSelectedMember()?.soulName}</div>
                      <div className="mt-1 flex items-center">
                        <ChakraBadge chakra={getSelectedMember()?.primaryChakra || 'Heart'} size="sm" />
                        <span className="ml-2 text-xs text-gray-400">Level {getSelectedMember()?.xpLevel}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="p-3 rounded-lg mb-4"
                    style={{ 
                      backgroundColor: getSelectedMember()?.timelineAlignment === 'past' ? '#C6282820' : 
                                      getSelectedMember()?.timelineAlignment === 'present' ? '#66BB6A20' : 
                                      '#AB47BC20',
                      color: getSelectedMember()?.timelineAlignment === 'past' ? '#C62828' : 
                            getSelectedMember()?.timelineAlignment === 'present' ? '#66BB6A' : 
                            '#AB47BC'
                    }}
                  >
                    <div className="text-sm">
                      {getSelectedMember()?.timelineAlignment.charAt(0).toUpperCase() + 
                       getSelectedMember()?.timelineAlignment.slice(1)} Timeline Alignment
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Status Message</div>
                    <div className="p-3 rounded-lg bg-dark-300 text-gray-200">
                      "{getSelectedMember()?.statusMessage}"
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <TattooButton
                      chakraColor={chakraState.color}
                      size="sm"
                      variant="outline"
                    >
                      Send Message
                    </TattooButton>
                    
                    <TattooButton
                      chakraColor={chakraState.color}
                      size="sm"
                    >
                      Invite to Ritual
                    </TattooButton>
                  </div>
                </motion.div>
              ) : (
                <>
                  <SigilPingSystem onPingSigil={handlePingSigil} />
                  <SoulCallBroadcast onBroadcast={handleSoulCall} />
                </>
              )}
              
              <CircleMetrics />
            </div>
          </div>
          
          <SacredLeaderboard onMemberSelect={handleMemberSelect} />
        </TabsContent>
        
        <TabsContent value="rituals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RitualLogDisplay onRitualSelect={handleRitualSelect} />
            </div>
            
            <div>
              <RitualSyncBeacon onScheduleRitual={handleScheduleRitual} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="messages">
          <MessageScrolls onSendMessage={handleSendMessage} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SacredCirclePage;