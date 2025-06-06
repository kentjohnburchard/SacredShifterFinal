import React, { createContext, useState, useContext, useEffect } from 'react';
import { LightbearerLevel } from '../types';
import { supabase } from '../lib/supabase';

interface XPContextType {
  level: number;
  xp: number;
  title: string;
  levelThresholds: LightbearerLevel[];
  addXP: (points: number) => Promise<void>;
  getProgress: () => number;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export const XPProvider: React.FC<{ 
  children: React.ReactNode;
  initialXP?: number;
  initialLevel?: number;
  initialTitle?: string;
}> = ({ 
  children,
  initialXP = 0,
  initialLevel = 0,
  initialTitle = 'Seeker'
}) => {
  const [xp, setXP] = useState<number>(initialXP);
  const [level, setLevel] = useState<number>(initialLevel);
  const [title, setTitle] = useState<string>(initialTitle);
  const [levelThresholds, setLevelThresholds] = useState<LightbearerLevel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch level thresholds from database
  useEffect(() => {
    const fetchLevelThresholds = async () => {
      try {
        const { data, error } = await supabase
          .from('lightbearer_levels')
          .select('*')
          .order('level_num', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          setLevelThresholds(data);
        }
      } catch (error) {
        console.error('Error fetching level thresholds:', error);
        // Set some default thresholds if we can't fetch them
        setLevelThresholds([
          { level_num: 0, threshold: 0, title: 'Seeker', next_threshold: 100 },
          { level_num: 1, threshold: 100, title: 'Initiate', next_threshold: 250 },
          { level_num: 2, threshold: 250, title: 'Lightbearer', next_threshold: 500 },
          { level_num: 3, threshold: 500, title: 'Alchemist', next_threshold: 1000 },
          { level_num: 4, threshold: 1000, title: 'Mystic', next_threshold: 2000 },
          { level_num: 5, threshold: 2000, title: 'Sage', next_threshold: 4000 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevelThresholds();
  }, []);

  // Check for level up when XP changes
  useEffect(() => {
    if (!isLoading && levelThresholds.length > 0) {
      // Find current level based on XP
      const currentLevelInfo = levelThresholds.find((lt, index) => {
        const nextLevel = levelThresholds[index + 1];
        return nextLevel ? (xp >= lt.threshold && xp < nextLevel.threshold) : xp >= lt.threshold;
      });

      if (currentLevelInfo) {
        // Update level and title if changed
        if (level !== currentLevelInfo.level_num || title !== currentLevelInfo.title) {
          setLevel(currentLevelInfo.level_num);
          setTitle(currentLevelInfo.title);

          // Update profile in Supabase when level changes
          updateProfileLevelInfo(currentLevelInfo);
        }
      }
    }
  }, [xp, levelThresholds, isLoading, level, title]);

  const updateProfileLevelInfo = async (levelInfo: LightbearerLevel) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const userId = session.session.user.id;
        
        // Update profile with new level info
        await supabase
          .from('profiles')
          .update({
            light_points: xp,
            light_level: levelInfo.level_num,
            ascension_title: levelInfo.title,
            last_level_up: new Date().toISOString()
          })
          .eq('id', userId);
        
        // Log level up session
        await supabase
          .from('continuum_sessions')
          .insert({
            user_id: userId,
            session_type: 'level_up',
            xp_awarded: 0, // No XP for level up itself
            chakra: null, // Could set to current active chakra if needed
            timestamp: new Date().toISOString()
          });
          
        // Trigger any level up effects in UI
        // This could be handled via a separate callback or state
      }
    } catch (error) {
      console.error('Error updating profile level info:', error);
    }
  };

  const addXP = async (points: number) => {
    setXP(prevXP => {
      const newXP = prevXP + points;
      return newXP;
    });
    
    // Log XP gain to database
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const userId = session.session.user.id;
        
        // Update profile XP
        await supabase
          .from('profiles')
          .update({ light_points: xp + points })
          .eq('id', userId);
          
        // Log to lightbearer_activities
        await supabase
          .from('lightbearer_activities')
          .insert({
            user_id: userId,
            activity_type: 'xp_gain',
            points: points,
            description: `Gained ${points} XP`,
          });
      }
    } catch (error) {
      console.error('Error logging XP gain:', error);
    }
  };

  const getProgress = (): number => {
    if (!levelThresholds.length || isLoading) return 0;
    
    // Find current level threshold
    const currentLevelInfo = levelThresholds.find(lt => lt.level_num === level);
    if (!currentLevelInfo) return 0;
    
    const currentThreshold = currentLevelInfo.threshold;
    const nextThreshold = currentLevelInfo.next_threshold;
    
    // Calculate progress percentage
    const progress = (xp - currentThreshold) / (nextThreshold - currentThreshold);
    return Math.min(Math.max(progress, 0), 1); // Clamp between 0 and 1
  };

  return (
    <XPContext.Provider value={{
      level,
      xp,
      title,
      levelThresholds,
      addXP,
      getProgress,
    }}>
      {children}
    </XPContext.Provider>
  );
};

// Custom hook to use the XP context
export const useXP = () => {
  const context = useContext(XPContext);
  if (context === undefined) {
    throw new Error('useXP must be used within an XPProvider');
  }
  return context;
};