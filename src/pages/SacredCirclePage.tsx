import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { supabase } from '../lib/supabase';
import { Circle, ChakraType } from '../types';
import { motion } from 'framer-motion';
import { Users, Grid, Activity, MessageSquare, Calendar, Plus, Settings, Zap, Compass } from 'lucide-react';
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
import RitualScheduler from '../components/circles/RitualScheduler';
import ChakraBalanceMonitor from '../components/circles/ChakraBalanceMonitor';
import TimelineCohesionMonitor from '../components/circles/TimelineCohesionMonitor';
import SigilActivationConsole from '../components/circles/SigilActivationConsole';
import SoulThreadViewer from '../components/circles/SoulThreadViewer';
import CircleModeration from '../components/circles/CircleModeration';

// Import placeholder data
import { circleMembersData } from '../data/sacredCircleData';

const SacredCirclePage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const navigate = useNavigate();
  
  const [circles, setCircles] = useState<Circle[]>([]);
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCircle, setIsCreatingCircle] = useState(false);
  const [activeTab, setActiveTab] = useState('community');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'rings' | 'totems'>('rings');
  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
  const [showRitualScheduler, setShowRitualScheduler] = useState(false);
  const [showSigilConsole, setShowSigilConsole] = useState(false);
  
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
        
        const myCirclesList = Array.from(allMyCirclesMap.values());
        setMyCircles(myCirclesList);
        
        // Set active circle to first one
        if (myCirclesList.length > 0) {
          setActiveCircle(myCirclesList[0]);
        }
      } else {
        setMyCircles(createdCircles || []);
        
        // Set active circle to first one
        if (createdCircles && createdCircles.length > 0) {
          setActiveCircle(createdCircles[0]);
        }
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
    
    // Get member's chakra and activate it
    const member = circleMembersData.find(m => m.id === memberId);
    if (member) {
      activateChakra(member.primaryChakra);
    }
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
  
  const handleSuggestRitual = (chakraOrTimeline: ChakraType | 'past' | 'present' | 'future') => {
    // Show ritual scheduler with pre-selected options
    setShowRitualScheduler(true);
    
    // If it's a chakra, activate it
    if (['Root', 'Sacral', 'SolarPlexus', 'Heart', 'Throat', 'ThirdEye', 'Crown'].includes(chakraOrTimeline as string)) {
      activateChakra(chakraOrTimeline as ChakraType);
    }
  };
  
  const handleActivateSigil = (sigilId: string, activationType: string, scheduledTime?: string) => {
    // In a real app, you would activate the sigil
    console.log('Activated sigil:', sigilId, activationType, scheduledTime);
  };
  
  const isCreator = activeCircle?.creator_id === user?.id;
  
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
          {activeCircle && (
            <div className="text-lg font-medium text-white">
              {activeCircle.name}
            </div>
          )}
          
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
              value="sigils"
              className="flex items-center px-4 py-2 text-gray-400 border-b-2 border-transparent"
              activeClassName="text-white border-current"
              style={{ borderColor: activeTab === 'sigils' ? chakraState.color : 'transparent' }}
            >
              <Zap size={18} className="mr-2" />
              Sigils
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
            {isCreator && (
              <TabsTrigger 
                value="admin"
                className="flex items-center px-4 py-2 text-gray-400 border-b-2 border-transparent"
                activeClassName="text-white border-current"
                style={{ borderColor: activeTab === 'admin' ? chakraState.color : 'transparent' }}
              >
                <Settings size={18} className="mr-2" />
                Admin
              </TabsTrigger>
            )}
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
                        src={circleMembersData.find(m => m.id === selectedMember)?.avatarUrl} 
                        alt={circleMembersData.find(m => m.id === selectedMember)?.displayName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div>
                      <div className="text-xl font-medium text-white">
                        {circleMembersData.find(m => m.id === selectedMember)?.displayName}
                      </div>
                      <div className="text-gray-400">
                        {circleMembersData.find(m => m.id === selectedMember)?.soulName}
                      </div>
                      <div className="mt-1 flex items-center">
                        <ChakraBadge 
                          chakra={circleMembersData.find(m => m.id === selectedMember)?.primaryChakra || 'Heart'} 
                          size="sm" 
                        />
                        <span className="ml-2 text-xs text-gray-400">
                          Level {circleMembersData.find(m => m.id === selectedMember)?.xpLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="p-3 rounded-lg mb-4"
                    style={{ 
                      backgroundColor: circleMembersData.find(m => m.id === selectedMember)?.timelineAlignment === 'past' ? '#C6282820' : 
                                      circleMembersData.find(m => m.id === selectedMember)?.timelineAlignment === 'present' ? '#66BB6A20' : 
                                      '#AB47BC20',
                      color: circleMembersData.find(m => m.id === selectedMember)?.timelineAlignment === 'past' ? '#C62828' : 
                            circleMembersData.find(m => m.id === selectedMember)?.timelineAlignment === 'present' ? '#66BB6A' : 
                            '#AB47BC'
                    }}
                  >
                    <div className="text-sm">
                      {circleMembersData.find(m => m.id === selectedMember)?.timelineAlignment.charAt(0).toUpperCase() + 
                       circleMembersData.find(m => m.id === selectedMember)?.timelineAlignment.slice(1)} Timeline Alignment
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Status Message</div>
                    <div className="p-3 rounded-lg bg-dark-300 text-gray-200">
                      "{circleMembersData.find(m => m.id === selectedMember)?.statusMessage}"
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SoulThreadViewer onMemberSelect={handleMemberSelect} />
            <SacredLeaderboard onMemberSelect={handleMemberSelect} />
          </div>
        </TabsContent>
        
        <TabsContent value="rituals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {showRitualScheduler ? (
                <div className="bg-dark-200 p-4 rounded-2xl border border-dark-300 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Schedule New Ritual</h3>
                    <button
                      onClick={() => setShowRitualScheduler(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <RitualScheduler 
                    circleId={activeCircle?.id || ''}
                    onScheduleComplete={() => setShowRitualScheduler(false)}
                  />
                </div>
              ) : (
                <div className="flex justify-end mb-4">
                  <TattooButton
                    onClick={() => setShowRitualScheduler(true)}
                    chakraColor={chakraState.color}
                    className="flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Schedule New Ritual
                  </TattooButton>
                </div>
              )}
              
              <RitualLogDisplay onRitualSelect={handleRitualSelect} />
            </div>
            
            <div className="space-y-6">
              <ChakraBalanceMonitor onSuggestRitual={handleSuggestRitual} />
              <TimelineCohesionMonitor onSuggestRitual={handleSuggestRitual} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="sigils" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {showSigilConsole ? (
                <div className="bg-dark-200 p-4 rounded-2xl border border-dark-300 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Sigil Activation Console</h3>
                    <button
                      onClick={() => setShowSigilConsole(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <SigilActivationConsole onActivateSigil={handleActivateSigil} />
                </div>
              ) : (
                <div className="flex justify-end mb-4">
                  <TattooButton
                    onClick={() => setShowSigilConsole(true)}
                    chakraColor={chakraState.color}
                    className="flex items-center"
                  >
                    <Zap size={16} className="mr-1" />
                    Activate Sigils
                  </TattooButton>
                </div>
              )}
              
              <div className="bg-dark-200 p-4 rounded-2xl border border-dark-300">
                <h3 className="text-lg font-medium text-white mb-4">Shared Sigil Board</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sharedSigilBoardData.slice(0, 6).map(sigil => (
                    <div key={sigil.sigilId} className="p-3 rounded-lg bg-dark-300">
                      <div className="flex items-start">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                          style={{ 
                            backgroundColor: `${getChakraColor(sigil.chakra)}20`
                          }}
                        >
                          {getEvolutionStageIcon(sigil.evolutionStage)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-white">{sigil.intention}</div>
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <span>{sigil.chakra} Chakra</span>
                            <span className="mx-1">•</span>
                            <span>{sigil.timeline} timeline</span>
                            <span className="mx-1">•</span>
                            <span>{sigil.evolutionStage}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="flex items-center text-xs">
                            <Heart size={12} className="mr-1 text-pink-400" />
                            <span className="text-gray-300">{sigil.likes}</span>
                          </div>
                          <div className="flex items-center text-xs mt-1">
                            <Zap size={12} className="mr-1 text-yellow-400" />
                            <span className="text-gray-300">{sigil.resonanceImpact}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <TattooButton
                    chakraColor={chakraState.color}
                    size="sm"
                    variant="outline"
                  >
                    View All Sigils
                  </TattooButton>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <SigilPingSystem onPingSigil={handlePingSigil} />
              <SigilActivationConsole onActivateSigil={handleActivateSigil} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="messages">
          <MessageScrolls onSendMessage={handleSendMessage} />
        </TabsContent>
        
        <TabsContent value="admin">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CircleModeration circleId={activeCircle?.id || ''} isCreator={isCreator} />
            <div className="space-y-6">
              <ChakraBalanceMonitor onSuggestRitual={handleSuggestRitual} />
              <TimelineCohesionMonitor onSuggestRitual={handleSuggestRitual} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper functions
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
  
  return chakraColors[chakra] || '#ffffff';
};

const getEvolutionStageIcon = (stage: string) => {
  switch(stage) {
    case 'seed': return '🌱';
    case 'sprout': return '🌿';
    case 'bloom': return '🌸';
    case 'mature': return '🌳';
    case 'transcendent': return '✨';
    default: return '🌱';
  }
};

export default SacredCirclePage;