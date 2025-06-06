import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Send, Users, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import { 
  Circle, 
  CircleMember, 
  HeartResonanceSession,
  LoveNote,
  UserProfile
} from '../types';
import { motion } from 'framer-motion';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';
import SymbolCanvas from '../components/ui/SymbolCanvas';
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns';

const ResonanceSessionPage: React.FC = () => {
  const { circleId, sessionId } = useParams<{ circleId: string, sessionId: string }>();
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP } = useXP();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<HeartResonanceSession | null>(null);
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [activeMembers, setActiveMembers] = useState<string[]>([]);
  const [loveNotes, setLoveNotes] = useState<LoveNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [heartEnergy, setHeartEnergy] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (circleId && sessionId && user) {
      fetchSessionData();
      // Activate Heart chakra for resonance sessions
      activateChakra('Heart', 'heart_resonance');
    }
  }, [circleId, sessionId, user]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [loveNotes]);
  
  // Setup real-time subscription
  useEffect(() => {
    if (!sessionId) return;
    
    // Subscribe to new love notes
    const loveNotesSubscription = supabase
      .channel('public:love_notes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'love_notes',
        filter: `session_id=eq.${sessionId}` 
      }, async (payload) => {
        // Fetch the user info for the new note
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('id', payload.new.user_id)
          .single();
          
        if (!userError && userData) {
          const newNote = {
            ...payload.new,
            user: userData as UserProfile
          };
          
          setLoveNotes(prev => [...prev, newNote]);
          
          // Increase heart energy
          setHeartEnergy(prev => Math.min(prev + 5, 100));
        }
      })
      .subscribe();
      
    // Subscribe to active members changes
    // This would be implemented via a separate table in a real app
    
    return () => {
      supabase.removeChannel(loveNotesSubscription);
    };
  }, [sessionId]);
  
  // Simulate heart energy building over time
  useEffect(() => {
    if (!session || session.status !== 'in_progress') return;
    
    const interval = setInterval(() => {
      setHeartEnergy(prev => {
        const increase = Math.random() * 2;
        return Math.min(prev + increase, 100);
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [session]);
  
  const fetchSessionData = async () => {
    if (!circleId || !sessionId || !user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch session details with creator info
      const { data: sessionData, error: sessionError } = await supabase
        .from('heart_resonance_sessions')
        .select(`
          *,
          creator:creator_id(id, display_name, avatar_url)
        `)
        .eq('id', sessionId)
        .single();
        
      if (sessionError) throw sessionError;
      
      setSession(sessionData);
      
      // Fetch circle details
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .select('*')
        .eq('id', circleId)
        .single();
        
      if (circleError) throw circleError;
      
      setCircle(circleData);
      
      // Fetch circle members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('circle_members')
        .select(`
          *,
          user:user_id(id, display_name, avatar_url)
        `)
        .eq('circle_id', circleId);
        
      if (membersError) throw membersError;
      
      setMembers(membersData || []);
      
      // Fetch existing love notes with user info
      const { data: notesData, error: notesError } = await supabase
        .from('love_notes')
        .select(`
          *,
          user:user_id(id, display_name, avatar_url)
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
        
      if (notesError) throw notesError;
      
      setLoveNotes(notesData || []);
      
      // Initialize heart energy based on note count
      setHeartEnergy(Math.min((notesData?.length || 0) * 5, 100));
      
      // Check if the session is now
      const now = new Date();
      if (sessionData.scheduled_for) {
        const sessionTime = new Date(sessionData.scheduled_for);
        const minutesUntilSession = differenceInMinutes(sessionTime, now);
        
        // If the session should be in progress but isn't marked as such
        if (minutesUntilSession <= 0 && sessionData.status === 'scheduled') {
          // Update session status to in_progress
          const { error: updateError } = await supabase
            .from('heart_resonance_sessions')
            .update({ status: 'in_progress' })
            .eq('id', sessionId);
            
          if (!updateError) {
            setSession({
              ...sessionData,
              status: 'in_progress'
            });
          }
        }
        
        // If the session should be completed
        if (sessionData.duration_minutes && 
            minutesUntilSession < -sessionData.duration_minutes && 
            (sessionData.status === 'scheduled' || sessionData.status === 'in_progress')) {
          // Update session status to completed
          const { error: updateError } = await supabase
            .from('heart_resonance_sessions')
            .update({ status: 'completed' })
            .eq('id', sessionId);
            
          if (!updateError) {
            setSession({
              ...sessionData,
              status: 'completed'
            });
          }
        }
      }
      
      // Simulate active members (in a real app, this would come from a presence system)
      const randomMembers = membersData
        ? membersData
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.min(membersData.length, 3 + Math.floor(Math.random() * 3)))
            .map(m => m.user_id)
        : [];
        
      // Always include the current user
      if (!randomMembers.includes(user.id)) {
        randomMembers.push(user.id);
      }
      
      setActiveMembers(randomMembers);
      
    } catch (error) {
      console.error('Error fetching session data:', error);
      navigate(`/sacred-circle/${circleId}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendLoveNote = async () => {
    if (!sessionId || !user || !message.trim()) return;
    
    try {
      setIsSending(true);
      
      const { data: note, error } = await supabase
        .from('love_notes')
        .insert([
          {
            session_id: sessionId,
            user_id: user.id,
            content: message.trim()
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Note will be added via the subscription
      
      // Clear the message input
      setMessage('');
      
      // Award XP for participation
      await addXP(3);
      
    } catch (error) {
      console.error('Error sending love note:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  // Check if the current user is a member of the circle
  const isMember = members.some(member => member.user_id === user?.id);
  
  // Format the session time
  const sessionTimeFormatted = session?.scheduled_for
    ? format(new Date(session.scheduled_for), 'MMM d, yyyy - h:mm a')
    : 'Time not set';
    
  // Calculate time remaining until session or since start
  const getSessionTimeStatus = () => {
    if (!session?.scheduled_for) return '';
    
    const now = new Date();
    const sessionTime = new Date(session.scheduled_for);
    
    if (session.status === 'in_progress') {
      return 'Session in progress';
    } else if (session.status === 'completed') {
      return 'Session completed';
    } else if (sessionTime > now) {
      return `Starting ${formatDistanceToNow(sessionTime, { addSuffix: true })}`;
    } else {
      return 'Starting soon';
    }
  };
  
  // If still loading, show a spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // If the session wasn't found, show an error
  if (!session || !circle) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-gray-200 mb-2">Session Not Found</h2>
        <p className="text-gray-400 mb-4">
          The resonance session you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <button
          onClick={() => navigate(`/sacred-circle/${circleId}`)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Return to Circle
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-4">
        <button 
          onClick={() => navigate(`/sacred-circle/${circleId}`)}
          className="mr-2 p-1 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">{session.title}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Session Info and Heart Energy */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-dark-200 rounded-2xl overflow-hidden border border-dark-300 shadow-md">
            <div className="p-4 border-b border-dark-300">
              <SacredHeading 
                as="h3" 
                className="text-lg mb-2"
                chakraColor={chakraState.color}
              >
                Heart Resonance
              </SacredHeading>
              
              <p className="text-gray-300 text-sm mb-3">{session.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  <span className="text-gray-300">{sessionTimeFormatted}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span className="text-gray-300">
                    {session.duration_minutes} minutes - {getSessionTimeStatus()}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Users size={16} className="mr-2 text-gray-400" />
                  <span className="text-gray-300">
                    {activeMembers.length} active participant{activeMembers.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm text-gray-400">Heart Energy</span>
                <span className="text-sm" style={{ color: chakraState.color }}>
                  {Math.floor(heartEnergy)}%
                </span>
              </div>
              
              <div className="w-full h-3 bg-dark-300 rounded-full overflow-hidden mb-4">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: chakraState.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${heartEnergy}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              
              <div className="flex items-center text-sm text-gray-300">
                <Heart size={16} className="mr-2" style={{ color: chakraState.color }} />
                Send love notes to increase the collective heart energy
              </div>
            </div>
            
            {session.status === 'in_progress' && (
              <div 
                className="p-3 text-sm text-center"
                style={{ 
                  backgroundColor: `${chakraState.color}20`,
                  color: chakraState.color
                }}
              >
                <motion.div 
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Active Session - Your energy is being amplified!
                </motion.div>
              </div>
            )}
          </div>
          
          <div className="bg-dark-200 p-4 rounded-2xl border border-dark-300 shadow-md">
            <SacredHeading 
              as="h3" 
              className="text-lg mb-3"
              chakraColor={chakraState.color}
            >
              Active Participants
            </SacredHeading>
            
            <div className="space-y-2">
              {members
                .filter(member => activeMembers.includes(member.user_id))
                .map(member => (
                  <motion.div 
                    key={member.id} 
                    className="flex items-center p-2 rounded-lg"
                    animate={{ 
                      backgroundColor: member.user_id === user?.id 
                        ? [`${chakraState.color}10`, `${chakraState.color}20`, `${chakraState.color}10`]
                        : undefined
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-400 flex items-center justify-center">
                        {member.user?.avatar_url ? (
                          <img 
                            src={member.user.avatar_url} 
                            alt={member.user.display_name || 'Member'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 text-gray-400">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <motion.div 
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                        animate={{ 
                          backgroundColor: [
                            `${chakraState.color}80`, 
                            chakraState.color,
                            `${chakraState.color}80`
                          ],
                          boxShadow: [
                            `0 0 3px ${chakraState.color}80`,
                            `0 0 6px ${chakraState.color}`,
                            `0 0 3px ${chakraState.color}80`
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    </div>
                    
                    <div className="ml-3">
                      <div className="text-sm font-medium text-white">
                        {member.user?.display_name || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {member.role === 'creator' ? 'Creator' : 'Participant'}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
        
        {/* Right Column: Visualization and Chat */}
        <div className="md:col-span-2 space-y-6">
          {/* Resonance Visualization */}
          <div className="bg-dark-200 rounded-2xl overflow-hidden border border-dark-300 shadow-md">
            <div className="relative">
              <SymbolCanvas
                chakraColor={chakraState.color}
                intensity={heartEnergy / 100 * 0.8 + 0.2}
                geometryType="flower-of-life"
                className="h-64 w-full"
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ 
                    background: `radial-gradient(circle, ${chakraState.color}50, ${chakraState.color}00)`,
                    boxShadow: `0 0 30px ${chakraState.color}80`
                  }}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Heart 
                    size={40} 
                    fill={chakraState.color} 
                    color={chakraState.color} 
                  />
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Love Notes */}
          <div className="bg-dark-200 rounded-2xl border border-dark-300 shadow-md flex flex-col h-96">
            <div className="p-4 border-b border-dark-300">
              <SacredHeading 
                as="h3" 
                className="text-lg"
                chakraColor={chakraState.color}
              >
                Love Notes
              </SacredHeading>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loveNotes.length > 0 ? (
                loveNotes.map((note) => (
                  <LoveNoteItem 
                    key={note.id} 
                    note={note} 
                    isCurrentUser={note.user_id === user?.id}
                    chakraColor={chakraState.color}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-3 rounded-full"
                    animate={{ 
                      boxShadow: [
                        `0 0 3px ${chakraState.color}40`,
                        `0 0 6px ${chakraState.color}40`,
                        `0 0 9px ${chakraState.color}40`
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    style={{ backgroundColor: `${chakraState.color}10` }}
                  >
                    <Heart 
                      size={32} 
                      className="mx-auto mt-4"
                      style={{ color: chakraState.color }}
                    />
                  </motion.div>
                  
                  <p className="text-gray-400">
                    No love notes yet. Be the first to share your heart's wisdom.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {session.status === 'in_progress' ? (
              <div className="p-4 border-t border-dark-300">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share a love note..."
                    className="flex-1 px-4 py-2 bg-dark-300 border border-dark-400 rounded-full focus:outline-none focus:ring-2"
                    style={{ focusRingColor: chakraState.color }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendLoveNote();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendLoveNote}
                    disabled={isSending || !message.trim()}
                    className="ml-2 p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: chakraState.color,
                      color: 'white'
                    }}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="p-3 text-sm text-center border-t border-dark-300"
                style={{ 
                  backgroundColor: session.status === 'scheduled' 
                    ? '#374151' // gray
                    : session.status === 'completed' 
                    ? `${chakraState.color}10`
                    : '#4B5563' // darker gray for cancelled
                }}
              >
                {session.status === 'scheduled' ? (
                  <p className="text-gray-300">
                    Session hasn't started yet. Check back {getSessionTimeStatus()}.
                  </p>
                ) : session.status === 'completed' ? (
                  <p style={{ color: chakraState.color }}>
                    This session has ended. The love energy continues to resonate.
                  </p>
                ) : (
                  <p className="text-gray-300">
                    This session was cancelled.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface LoveNoteItemProps {
  note: LoveNote;
  isCurrentUser: boolean;
  chakraColor: string;
}

const LoveNoteItem: React.FC<LoveNoteItemProps> = ({
  note,
  isCurrentUser,
  chakraColor
}) => {
  return (
    <motion.div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`max-w-xs rounded-2xl px-4 py-2 ${
          isCurrentUser
            ? 'bg-dark-100 text-white ml-12'
            : 'mr-12'
        }`}
        style={isCurrentUser ? undefined : { 
          backgroundColor: `${chakraColor}20`,
          color: 'white'
        }}
      >
        {!isCurrentUser && (
          <div className="text-xs font-medium mb-1\" style={{ color: chakraColor }}>
            {note.user?.display_name || 'Anonymous'}
          </div>
        )}
        <p className="text-sm">{note.content}</p>
      </div>
    </motion.div>
  );
};

export default ResonanceSessionPage;