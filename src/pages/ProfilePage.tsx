import React, { useState, useEffect } from 'react';
import { User, Settings, Camera, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import { ChakraType } from '../types';
import ChakraBadge from '../components/chakra/ChakraBadge';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';
import SymbolCanvas from '../components/ui/SymbolCanvas';
import { motion } from 'framer-motion';

const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { chakraState } = useChakra();
  const { level, title, xp } = useXP();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Stats and historical data
  const [activityStats, setActivityStats] = useState({
    totalSigils: 0,
    totalSessions: 0,
    completedTasks: 0,
    dominantChakra: 'Heart' as ChakraType
  });
  
  useEffect(() => {
    if (user) {
      // Initialize form with user data
      setDisplayName(user.display_name || '');
      setFullName(user.full_name || '');
      setAvatarUrl(user.avatar_url || '');
      
      // Fetch activity stats
      fetchActivityStats();
    }
  }, [user]);
  
  const fetchActivityStats = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch sigil count
      const { count: sigilCount, error: sigilError } = await supabase
        .from('fractal_glyphs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (sigilError) throw sigilError;
      
      // Fetch session count
      const { count: sessionCount, error: sessionError } = await supabase
        .from('continuum_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (sessionError) throw sessionError;
      
      // Fetch completed tasks count
      const { count: taskCount, error: taskError } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true);
        
      if (taskError) throw taskError;
      
      // Get dominant chakra (most activated)
      const { data: chakraData, error: chakraError } = await supabase
        .from('user_chakra_activations')
        .select('chakra_tag, count')
        .eq('user_id', user.id)
        .group('chakra_tag')
        .order('count', { ascending: false })
        .limit(1);
      
      if (chakraError) throw chakraError;
      
      const dominantChakra = chakraData && chakraData.length > 0
        ? chakraData[0].chakra_tag as ChakraType
        : user.chakra_highlight || 'Heart' as ChakraType;
      
      setActivityStats({
        totalSigils: sigilCount || 0,
        totalSessions: sessionCount || 0,
        completedTasks: taskCount || 0,
        dominantChakra
      });
      
    } catch (error) {
      console.error('Error fetching activity stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          display_name: displayName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Refresh the profile in the auth context
      await refreshProfile();
      
      // Show success message
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Exit editing mode
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Tesla's 3-6-9 pattern for staggered animations
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.3, // 3 tenths
        duration: 0.6,  // 6 tenths
        ease: [0.3, 0, 0.6, 1] // Tesla curve - emphasis on 3 and 6
      }
    })
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <SacredHeading 
        as="h1" 
        className="text-2xl mb-6"
        chakraColor={chakraState.color}
        withGlow
        withAnimation
      >
        Soul Profile
      </SacredHeading>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile and Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <motion.div
            className="bg-dark-200 p-6 rounded-2xl shadow-chakra-glow border border-dark-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isEditing ? (
              // Edit Form
              <form onSubmit={handleSubmit}>
                <div className="mb-6 flex justify-between items-center">
                  <SacredHeading 
                    as="h2" 
                    className="text-xl"
                    chakraColor={chakraState.color}
                  >
                    Edit Profile
                  </SacredHeading>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-md">
                    {errorMessage}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRingColor: chakraState.color }}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRingColor: chakraState.color }}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-300 mb-1">
                      Avatar URL
                    </label>
                    <input
                      id="avatarUrl"
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRingColor: chakraState.color }}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter a URL for your avatar image
                    </p>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-500 text-gray-300 rounded-2xl hover:bg-dark-300"
                    >
                      Cancel
                    </button>
                    
                    <TattooButton
                      type="submit"
                      disabled={isSaving}
                      chakraColor={chakraState.color}
                    >
                      {isSaving ? (
                        <>
                          <motion.span 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="inline-block mr-2"
                          >
                            ⟳
                          </motion.span>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </TattooButton>
                  </div>
                </div>
              </form>
            ) : (
              // Profile Display
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <SacredHeading 
                    as="h2" 
                    className="text-xl"
                    chakraColor={chakraState.color}
                  >
                    Lightbearer Profile
                  </SacredHeading>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-gray-300 hover:text-white"
                  >
                    <Settings size={20} />
                  </button>
                </div>
                
                {successMessage && (
                  <div className="mb-4 p-3 bg-green-900 text-green-100 rounded-md flex items-center">
                    <CheckCircle size={16} className="mr-2" />
                    {successMessage}
                  </div>
                )}
                
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <div 
                      className="w-20 h-20 rounded-full bg-dark-300 flex items-center justify-center overflow-hidden"
                      style={{
                        boxShadow: `0 0 15px ${chakraState.color}40`
                      }}
                    >
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt={displayName || "User"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div 
                      className="absolute -bottom-1 -right-1 rounded-full p-1"
                      style={{ 
                        backgroundColor: chakraState.color,
                        boxShadow: `0 0 10px ${chakraState.color}`
                      }}
                    >
                      <Camera size={14} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-white">
                      {displayName || "Unnamed Lightbearer"}
                    </h3>
                    <p className="text-gray-400">
                      {fullName || "Update your profile to add your name"}
                    </p>
                    <div className="flex items-center mt-1">
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: `${chakraState.color}20`,
                          color: chakraState.color
                        }}
                      >
                        Level {level}
                      </span>
                      <span className="mx-2 text-gray-600">•</span>
                      <span className="text-xs text-gray-400">{title}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div 
                    className="p-4 rounded-2xl bg-dark-300 flex flex-col items-center justify-center"
                    style={{ 
                      background: `radial-gradient(circle at center, ${chakraState.color}10, transparent)` 
                    }}
                  >
                    <div className="text-2xl font-bold" style={{ color: chakraState.color }}>
                      {xp}
                    </div>
                    <div className="text-xs text-gray-400">Light Points</div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-dark-300 flex flex-col items-center justify-center">
                    <ChakraBadge chakra={activityStats.dominantChakra} showLabel={true} size="sm" />
                    <div className="text-xs text-gray-400 mt-1">Dominant Chakra</div>
                  </div>
                </div>
                
                <div className="border-t border-dark-300 pt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Activity Summary</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-dark-300 rounded-lg text-center">
                      <div className="text-lg font-bold text-white">{activityStats.totalSigils}</div>
                      <div className="text-xs text-gray-500">Sigils</div>
                    </div>
                    <div className="p-3 bg-dark-300 rounded-lg text-center">
                      <div className="text-lg font-bold text-white">{activityStats.totalSessions}</div>
                      <div className="text-xs text-gray-500">Sessions</div>
                    </div>
                    <div className="p-3 bg-dark-300 rounded-lg text-center">
                      <div className="text-lg font-bold text-white">{activityStats.completedTasks}</div>
                      <div className="text-xs text-gray-500">Tasks</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Account Security */}
          <motion.div
            className="bg-dark-200 p-6 rounded-2xl shadow-chakra-glow border border-dark-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <SacredHeading 
              as="h2" 
              className="text-xl mb-4"
              chakraColor={chakraState.color}
            >
              Account Security
            </SacredHeading>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-white">Email Address</div>
                  <div className="text-sm text-gray-400">{user.email || 'No email available'}</div>
                </div>
                <div className="text-xs px-2 py-1 bg-green-900 text-green-100 rounded-full">
                  Verified
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-white">Password</div>
                  <div className="text-sm text-gray-400">••••••••</div>
                </div>
                <button className="text-xs px-2 py-1 bg-dark-300 text-gray-300 rounded-full hover:bg-dark-400">
                  Change
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-400">Not enabled</div>
                </div>
                <button className="text-xs px-2 py-1 bg-dark-300 text-gray-300 rounded-full hover:bg-dark-400">
                  Enable
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Right Column: Energy Signature */}
        <motion.div
          className="bg-dark-200 p-6 rounded-2xl shadow-chakra-glow border border-dark-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <SacredHeading 
            as="h2" 
            className="text-xl mb-4"
            chakraColor={chakraState.color}
          >
            Energy Signature
          </SacredHeading>
          
          <div className="mb-4">
            <SymbolCanvas
              chakraColor={chakraState.color}
              intensity={0.8}
              geometryType="flower-of-life"
              className="h-48 mb-4"
            />
          </div>
          
          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
          >
            <motion.div 
              className="p-3 rounded-2xl"
              custom={0}
              variants={itemVariants}
              style={{ 
                background: `linear-gradient(135deg, ${chakraState.color}20, ${chakraState.color}05)`,
                boxShadow: `0 0 10px ${chakraState.color}30`
              }}
            >
              <div className="text-xs text-gray-400 mb-1">Resonant Frequency</div>
              <div className="text-lg font-medium" style={{ color: chakraState.color }}>
                {chakraState.frequency} Hz
              </div>
            </motion.div>
            
            <motion.div 
              custom={1}
              variants={itemVariants}
              className="p-3 rounded-2xl bg-dark-300"
            >
              <div className="text-xs text-gray-400 mb-1">Fibonacci Sequence</div>
              <div className="flex justify-between items-center">
                {[1, 1, 2, 3, 5, 8, 13].map((num, index) => (
                  <motion.div 
                    key={index}
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    animate={{ 
                      backgroundColor: [
                        `${chakraState.color}10`, 
                        `${chakraState.color}30`, 
                        `${chakraState.color}10`
                      ],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 3 + index, // Tesla's 3
                      repeat: Infinity, 
                      repeatType: "mirror", 
                      delay: index * 0.6 // Tesla's 6
                    }}
                  >
                    <span className="text-xs" style={{ color: chakraState.color }}>{num}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              custom={2}
              variants={itemVariants}
              className="p-3 rounded-2xl bg-dark-300"
            >
              <div className="text-xs text-gray-400 mb-1">Tesla's 3-6-9 Key</div>
              <div className="flex justify-center space-x-8">
                <motion.div 
                  className="text-center"
                  animate={{ 
                    y: [0, -3, 0],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="text-2xl font-heading" style={{ color: chakraState.color }}>3</div>
                  <div className="text-xs text-gray-400">Creation</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  animate={{ 
                    y: [0, -3, 0],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  <div className="text-2xl font-heading" style={{ color: chakraState.color }}>6</div>
                  <div className="text-xs text-gray-400">Balance</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  animate={{ 
                    y: [0, -3, 0],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 9, repeat: Infinity }}
                >
                  <div className="text-2xl font-heading" style={{ color: chakraState.color }}>9</div>
                  <div className="text-xs text-gray-400">Harmony</div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;