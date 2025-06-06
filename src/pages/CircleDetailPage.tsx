import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import { 
  Circle, 
  CircleMember, 
  CirclePost, 
  HeartResonanceSession,
  CircleComment,
  UserProfile
} from '../types';
import CircleHeader from '../components/circles/CircleHeader';
import CirclePostComponent from '../components/circles/CirclePost';
import CreatePostForm from '../components/circles/CreatePostForm';
import HeartResonanceCard from '../components/circles/HeartResonanceCard';
import CircleChat from '../components/circles/CircleChat';
import { Plus, Calendar, MessageCircle, Users, Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';

const CircleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { chakraState } = useChakra();
  const { addXP } = useXP();
  const navigate = useNavigate();
  
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [posts, setPosts] = useState<CirclePost[]>([]);
  const [sessions, setSessions] = useState<HeartResonanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  // New session form state
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  
  useEffect(() => {
    if (id && user) {
      fetchCircleData();
    }
  }, [id, user]);
  
  const fetchCircleData = async () => {
    if (!id || !user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch circle details
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .select('*')
        .eq('id', id)
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
        .eq('circle_id', id);
        
      if (membersError) throw membersError;
      
      setMembers(membersData || []);
      
      // Fetch circle posts with user info
      const { data: postsData, error: postsError } = await supabase
        .from('circle_posts')
        .select(`
          *,
          user:user_id(id, display_name, avatar_url),
          comment_count:circle_comments(count)
        `)
        .eq('circle_id', id)
        .order('created_at', { ascending: false });
        
      if (postsError) throw postsError;
      
      setPosts(postsData || []);
      
      // Fetch resonance sessions with creator info
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('heart_resonance_sessions')
        .select(`
          *,
          creator:creator_id(id, display_name, avatar_url)
        `)
        .eq('circle_id', id)
        .order('scheduled_for', { ascending: true });
        
      if (sessionsError) throw sessionsError;
      
      setSessions(sessionsData || []);
      
    } catch (error) {
      console.error('Error fetching circle data:', error);
      navigate('/sacred-circle');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreatePost = async (content: string, imageUrl?: string) => {
    if (!id || !user || !circle) return;
    
    try {
      const { data: post, error } = await supabase
        .from('circle_posts')
        .insert([
          {
            circle_id: id,
            user_id: user.id,
            content,
            image_url: imageUrl
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the current user's info to the post
      const enrichedPost = {
        ...post,
        user: {
          id: user.id,
          display_name: user.display_name || user.full_name || 'User',
          avatar_url: user.avatar_url
        },
        comment_count: 0
      };
      
      // Update posts list
      setPosts([enrichedPost, ...posts]);
      
      // Award XP for creating a post
      await addXP(5);
      
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };
  
  const handleAddComment = async (postId: string, content: string) => {
    if (!user) return;
    
    try {
      const { data: comment, error } = await supabase
        .from('circle_comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the current user's info to the comment
      const enrichedComment = {
        ...comment,
        user: {
          id: user.id,
          display_name: user.display_name || user.full_name || 'User',
          avatar_url: user.avatar_url
        }
      };
      
      // Fetch the updated post with new comment
      const { data: updatedPost, error: postError } = await supabase
        .from('circle_posts')
        .select(`
          *,
          user:user_id(id, display_name, avatar_url),
          comments:circle_comments(
            *,
            user:user_id(id, display_name, avatar_url)
          ),
          comment_count:circle_comments(count)
        `)
        .eq('id', postId)
        .single();
      
      if (postError) throw postError;
      
      // Update the posts list
      setPosts(posts.map(post => 
        post.id === postId ? updatedPost : post
      ));
      
      // Award XP for commenting
      await addXP(2);
      
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('circle_posts')
        .delete()
        .eq('id', postId);
        
      if (error) throw error;
      
      // Update posts list
      setPosts(posts.filter(post => post.id !== postId));
      
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  
  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const { error } = await supabase
        .from('circle_comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      
      // Fetch the updated post without the deleted comment
      const { data: updatedPost, error: postError } = await supabase
        .from('circle_posts')
        .select(`
          *,
          user:user_id(id, display_name, avatar_url),
          comments:circle_comments(
            *,
            user:user_id(id, display_name, avatar_url)
          ),
          comment_count:circle_comments(count)
        `)
        .eq('id', postId)
        .single();
      
      if (postError) throw postError;
      
      // Update the posts list
      setPosts(posts.map(post => 
        post.id === postId ? updatedPost : post
      ));
      
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  const handleCreateSession = async () => {
    if (!id || !user || !circle) return;
    
    try {
      setIsSubmittingSession(true);
      
      if (!sessionTitle.trim() || !sessionDate || !sessionTime) {
        alert('Please fill out all required fields');
        return;
      }
      
      // Combine date and time
      const scheduledFor = new Date(`${sessionDate}T${sessionTime}`);
      
      // Create the session
      const { data: session, error } = await supabase
        .from('heart_resonance_sessions')
        .insert([
          {
            circle_id: id,
            creator_id: user.id,
            title: sessionTitle,
            description: sessionDescription || null,
            scheduled_for: scheduledFor.toISOString(),
            duration_minutes: sessionDuration,
            status: 'scheduled'
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the current user's info to the session
      const enrichedSession = {
        ...session,
        creator: {
          id: user.id,
          display_name: user.display_name || user.full_name || 'User',
          avatar_url: user.avatar_url
        }
      };
      
      // Update sessions list
      setSessions([...sessions, enrichedSession]);
      
      // Reset form
      setSessionTitle('');
      setSessionDescription('');
      setSessionDate('');
      setSessionTime('');
      setSessionDuration(60);
      setIsCreatingSession(false);
      
      // Award XP for creating a session
      await addXP(10);
      
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setIsSubmittingSession(false);
    }
  };
  
  const handleJoinCircle = async () => {
    if (!id || !user) return;
    
    try {
      const { error } = await supabase
        .from('circle_members')
        .insert([
          {
            circle_id: id,
            user_id: user.id,
            role: 'member'
          }
        ]);
        
      if (error) throw error;
      
      // Add user to members list
      const newMember: CircleMember = {
        id: crypto.randomUUID(),
        circle_id: id,
        user_id: user.id,
        role: 'member',
        joined_at: new Date().toISOString(),
        user: {
          id: user.id,
          display_name: user.display_name || user.full_name || 'User',
          avatar_url: user.avatar_url,
          onboarding_completed: true,
          light_level: 0,
          light_points: 0,
          ascension_title: 'Seeker'
        }
      };
      
      setMembers([...members, newMember]);
      
    } catch (error) {
      console.error('Error joining circle:', error);
      alert('Failed to join circle. Please try again.');
    }
  };
  
  const handleLeaveCircle = async () => {
    if (!id || !user) return;
    
    // Confirm before leaving
    if (!confirm('Are you sure you want to leave this circle?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .eq('circle_id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Remove user from members list
      setMembers(members.filter(member => member.user_id !== user.id));
      
      // Navigate back to circles page
      navigate('/sacred-circle');
      
    } catch (error) {
      console.error('Error leaving circle:', error);
      alert('Failed to leave circle. Please try again.');
    }
  };
  
  const handleJoinSession = (sessionId: string) => {
    navigate(`/sacred-circle/${id}/session/${sessionId}`);
  };
  
  // Check if the current user is a member of the circle
  const isMember = members.some(member => member.user_id === user?.id);
  
  // Check if the current user is the creator of the circle
  const isCreator = circle?.creator_id === user?.id;
  
  // If still loading, show a spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // If the circle wasn't found, show an error
  if (!circle) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-gray-200 mb-2">Circle Not Found</h2>
        <p className="text-gray-400 mb-4">
          The sacred circle you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <button
          onClick={() => navigate('/sacred-circle')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Return to Circles
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <CircleHeader
        circle={circle}
        members={members}
        isCreator={isCreator}
        onJoin={handleJoinCircle}
        onLeave={handleLeaveCircle}
        isMember={isMember}
      />
      
      {!isMember ? (
        <div className="bg-dark-200 p-6 rounded-2xl text-center border border-dark-300">
          <p className="text-gray-300 mb-4">
            Join this sacred circle to view posts and participate in heart resonance sessions.
          </p>
          <TattooButton
            onClick={handleJoinCircle}
            chakraColor={chakraState.color}
          >
            Join Circle
          </TattooButton>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <Tabs
              defaultValue="posts"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b border-dark-300 mb-6">
                <TabsList className="flex">
                  <TabsTrigger 
                    value="posts"
                    className="flex items-center px-4 py-2 text-gray-400 border-b-2 border-transparent"
                    activeClassName="text-white border-current"
                    style={{ borderColor: activeTab === 'posts' ? chakraState.color : 'transparent' }}
                  >
                    <MessageCircle size={18} className="mr-2" />
                    Posts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="messages"
                    className="flex items-center px-4 py-2 text-gray-400 border-b-2 border-transparent"
                    activeClassName="text-white border-current"
                    style={{ borderColor: activeTab === 'messages' ? chakraState.color : 'transparent' }}
                  >
                    <MessageSquare size={18} className="mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger 
                    value="resonance"
                    className="flex items-center px-4 py-2 text-gray-400 border-b-2 border-transparent"
                    activeClassName="text-white border-current"
                    style={{ borderColor: activeTab === 'resonance' ? chakraState.color : 'transparent' }}
                  >
                    <Heart size={18} className="mr-2" />
                    Heart Resonance
                  </TabsTrigger>
                  <TabsTrigger 
                    value="members"
                    className="flex items-center px-4 py-2 text-gray-400 border-b-2 border-transparent"
                    activeClassName="text-white border-current"
                    style={{ borderColor: activeTab === 'members' ? chakraState.color : 'transparent' }}
                  >
                    <Users size={18} className="mr-2" />
                    Members
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="posts" className="space-y-6">
                <CreatePostForm
                  circleId={id}
                  onCreatePost={handleCreatePost}
                />
                
                {posts.length > 0 ? (
                  posts.map(post => (
                    <CirclePostComponent 
                      key={post.id} 
                      post={post} 
                      onAddComment={handleAddComment}
                      onDeletePost={handleDeletePost}
                      onDeleteComment={handleDeleteComment}
                    />
                  ))
                ) : (
                  <div className="bg-dark-200 p-6 rounded-2xl text-center border border-dark-300">
                    <p className="text-gray-400">
                      No posts in this circle yet. Be the first to share!
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="messages">
                <CircleChat circleId={id} />
              </TabsContent>
              
              <TabsContent value="resonance">
                <div className="mb-6 flex justify-between items-center">
                  <SacredHeading 
                    as="h3" 
                    className="text-lg"
                    chakraColor={chakraState.color}
                  >
                    Heart Resonance Sessions
                  </SacredHeading>
                  
                  <TattooButton
                    onClick={() => setIsCreatingSession(true)}
                    size="sm"
                    chakraColor={chakraState.color}
                    className="flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    New Session
                  </TattooButton>
                </div>
                
                {isCreatingSession && (
                  <motion.div 
                    className="bg-dark-200 p-5 rounded-2xl border border-dark-300 shadow-md mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-white">Create Resonance Session</h3>
                      <button 
                        onClick={() => setIsCreatingSession(false)}
                        className="text-gray-400 hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Session Title
                        </label>
                        <input
                          type="text"
                          value={sessionTitle}
                          onChange={(e) => setSessionTitle(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                          style={{ focusRingColor: chakraState.color }}
                          placeholder="e.g., Heart Chakra Activation"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={sessionDescription}
                          onChange={(e) => setSessionDescription(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                          style={{ focusRingColor: chakraState.color }}
                          placeholder="Describe what this session is about..."
                        ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                            style={{ focusRingColor: chakraState.color }}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Time
                          </label>
                          <input
                            type="time"
                            value={sessionTime}
                            onChange={(e) => setSessionTime(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                            style={{ focusRingColor: chakraState.color }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Duration (minutes)
                        </label>
                        <select
                          value={sessionDuration}
                          onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                          className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                          style={{ focusRingColor: chakraState.color }}
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>60 minutes</option>
                          <option value={90}>90 minutes</option>
                          <option value={120}>120 minutes</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingSession(false)}
                          className="px-4 py-2 border border-gray-500 text-gray-300 rounded-2xl hover:bg-dark-300"
                        >
                          Cancel
                        </button>
                        
                        <TattooButton
                          onClick={handleCreateSession}
                          disabled={isSubmittingSession || !sessionTitle.trim() || !sessionDate || !sessionTime}
                          chakraColor={chakraState.color}
                        >
                          {isSubmittingSession ? (
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
                          ) : 'Create Session'}
                        </TattooButton>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {sessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sessions.map(session => (
                      <HeartResonanceCard 
                        key={session.id} 
                        session={session} 
                        onJoin={handleJoinSession} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-dark-200 p-6 rounded-2xl text-center border border-dark-300">
                    <p className="text-gray-400">
                      No heart resonance sessions scheduled yet. Create one to connect with circle members.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="members">
                <div className="bg-dark-200 p-6 rounded-2xl border border-dark-300">
                  <SacredHeading 
                    as="h3" 
                    className="text-lg mb-4"
                    chakraColor={chakraState.color}
                  >
                    Circle Members
                  </SacredHeading>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {members.map((member) => (
                      <div 
                        key={member.id} 
                        className="flex items-center p-3 rounded-lg hover:bg-dark-300"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-400 flex items-center justify-center mr-3">
                          {member.user?.avatar_url ? (
                            <img 
                              src={member.user.avatar_url} 
                              alt={member.user.display_name || 'Member'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 text-gray-400">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="font-medium text-white">
                            {member.user?.display_name || 'Anonymous'}
                          </div>
                          <div className="text-xs flex items-center">
                            <span 
                              className="px-2 py-0.5 rounded-full text-xs"
                              style={{ 
                                backgroundColor: member.role === 'creator' 
                                  ? `${chakraState.color}30` 
                                  : 'rgba(107, 114, 128, 0.3)',
                                color: member.role === 'creator'
                                  ? chakraState.color
                                  : 'rgb(156, 163, 175)'
                              }}
                            >
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircleDetailPage;