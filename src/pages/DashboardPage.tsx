import React, { useEffect, useState } from 'react';
import { Calendar, Check, Star, Aperture } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import { ContinuumSession, Task } from '../types';
import ChakraBadge from '../components/chakra/ChakraBadge';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { level, title, xp, getProgress } = useXP();
  
  const [recentSessions, setRecentSessions] = useState<ContinuumSession[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user) return;
        
        // Fetch recent continuum sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('continuum_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(5);
          
        if (sessionsError) throw sessionsError;
        
        // Fetch upcoming tasks for today
        const today = new Date().toISOString().split('T')[0];
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .eq('is_completed', false)
          .order('time', { ascending: true })
          .limit(3);
          
        if (tasksError) throw tasksError;
        
        setRecentSessions(sessions || []);
        setUpcomingTasks(tasks || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  const formatSessionType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Welcome, {user?.display_name || user?.full_name || 'Lightbearer'}
      </h1>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="md:col-span-8 space-y-6">
            {/* Energy status */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Energy Status</h2>
              <div className="flex flex-wrap gap-4">
                <div 
                  className="flex-1 min-w-[120px] p-4 rounded-lg flex flex-col items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${chakraState.color}20, ${chakraState.color}05)`,
                    boxShadow: `0 0 15px ${chakraState.color}30`
                  }}
                >
                  <ChakraBadge chakra={chakraState.type} size="lg" />
                  <div className="mt-2 text-sm text-gray-500">Current Focus</div>
                </div>
                
                <div className="flex-1 min-w-[120px] bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{level}</div>
                    <div className="text-sm text-gray-500">Level</div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full"
                        style={{ 
                          width: `${getProgress() * 100}%`,
                          backgroundColor: chakraState.color
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-[120px] bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">{title}</div>
                    <div className="text-sm text-gray-500">Ascension Title</div>
                  </div>
                  <div className="mt-2 text-center text-sm text-indigo-600">
                    {xp} XP Total
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent sessions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Recent Soul Journey Sessions</h2>
              
              {recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map(session => (
                    <div key={session.id} className="flex items-start p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          {session.session_type.includes('sigil') ? (
                            <Aperture className="h-5 w-5 text-indigo-600" />
                          ) : session.session_type.includes('tarot') ? (
                            <Star className="h-5 w-5 text-indigo-600" />
                          ) : (
                            <div className="h-5 w-5 text-indigo-600">✨</div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {formatSessionType(session.session_type)}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <time dateTime={session.timestamp}>
                            {new Date(session.timestamp).toLocaleString()}
                          </time>
                          {session.chakra && (
                            <ChakraBadge chakra={session.chakra} size="sm" />
                          )}
                          {session.xp_awarded > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              +{session.xp_awarded} XP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                    <Star className="h-8 w-8 text-indigo-600" />
                  </div>
                  <p className="text-gray-500">No journey sessions yet. Begin your first spiritual journey!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column */}
          <div className="md:col-span-4 space-y-6">
            {/* Today's tasks */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Today's Rituals</h2>
                <Calendar size={18} className="text-gray-400" />
              </div>
              
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="flex items-center p-2 rounded-md hover:bg-gray-50">
                      <div className="mr-3 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <Check className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        {task.time && (
                          <p className="text-xs text-gray-500">
                            {task.time}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No rituals scheduled for today</p>
                </div>
              )}
              
              <div className="mt-4">
                <a 
                  href="/tasks" 
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View all rituals →
                </a>
              </div>
            </div>
            
            {/* Chakra selection */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Chakra Focus</h2>
              
              <div className="space-y-2">
                {(['Root', 'Sacral', 'SolarPlexus', 'Heart', 'Throat', 'ThirdEye', 'Crown'] as ChakraType[]).map(chakra => (
                  <button
                    key={chakra}
                    onClick={() => activateChakra(chakra)}
                    className={`w-full flex items-center p-2 rounded-md ${
                      chakraState.type === chakra
                        ? 'bg-opacity-10'
                        : 'hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: chakraState.type === chakra ? `${chakraColors[chakra]}10` : undefined,
                    }}
                  >
                    <ChakraBadge chakra={chakra} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Color mapping for chakras
const chakraColors: Record<ChakraType, string> = {
  Root: '#FF0000',
  Sacral: '#FF8C00',
  SolarPlexus: '#FFFF00',
  Heart: '#00FF00',
  Throat: '#00BFFF',
  ThirdEye: '#4B0082',
  Crown: '#9400D3'
};

export default DashboardPage;