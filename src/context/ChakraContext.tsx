import React, { createContext, useState, useContext, useEffect } from 'react';
import { ChakraType, ChakraState } from '../types';
import { supabase } from '../lib/supabase';

// Define chakra colors and frequencies
const chakraConfig: Record<ChakraType, { color: string; frequency: number }> = {
  Root: { color: 'var(--chakra-root)', frequency: 396 }, 
  Sacral: { color: 'var(--chakra-sacral)', frequency: 417 }, 
  SolarPlexus: { color: 'var(--chakra-solarplexus)', frequency: 528 }, 
  Heart: { color: 'var(--chakra-heart)', frequency: 639 }, 
  Throat: { color: 'var(--chakra-throat)', frequency: 741 }, 
  ThirdEye: { color: 'var(--chakra-thirdeye)', frequency: 852 }, 
  Crown: { color: 'var(--chakra-crown)', frequency: 963 }, 
};

interface ChakraContextType {
  activeChakra: ChakraType;
  chakraState: ChakraState;
  activateChakra: (chakra: ChakraType, activationType?: string) => void;
  getUserChakraActivations: () => Promise<any[]>;
}

const ChakraContext = createContext<ChakraContextType | undefined>(undefined);

export const ChakraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeChakra, setActiveChakra] = useState<ChakraType>('Heart');
  const [chakraIntensity, setChakraIntensity] = useState<number>(0.5);
  
  const chakraState: ChakraState = {
    type: activeChakra,
    frequency: chakraConfig[activeChakra].frequency,
    color: chakraConfig[activeChakra].color,
    intensity: chakraIntensity
  };
  
  // Set CSS variables for global chakra theming
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--chakra-color', chakraState.color);
    root.style.setProperty('--chakra-frequency', chakraState.frequency.toString());
    root.style.setProperty('--chakra-intensity', chakraState.intensity.toString());
    
    // Remove all chakra classes
    document.body.classList.remove(
      'chakra-root', 
      'chakra-sacral', 
      'chakra-solar-plexus', 
      'chakra-heart', 
      'chakra-throat', 
      'chakra-third-eye', 
      'chakra-crown'
    );
    
    // Add the current chakra class
    document.body.classList.add(`chakra-${activeChakra.toLowerCase().replace(/\s+/g, '-')}`);
  }, [activeChakra, chakraState]);
  
  const activateChakra = async (chakra: ChakraType, activationType = 'manual') => {
    setActiveChakra(chakra);
    
    // Gradually increase intensity for visual effect
    setChakraIntensity(0.2);
    setTimeout(() => setChakraIntensity(0.5), 300);
    setTimeout(() => setChakraIntensity(0.8), 600);
    setTimeout(() => setChakraIntensity(0.5), 900);
    
    try {
      // Log chakra activation to database
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const userId = session.session.user.id;
        
        // Update user's chakra highlight in profiles
        await supabase
          .from('profiles')
          .update({ chakra_highlight: chakra })
          .eq('id', userId);
        
        // Log activation to user_chakra_activations
        await supabase
          .from('user_chakra_activations')
          .insert({
            user_id: userId,
            chakra_tag: chakra,
            activation_type: activationType
          });
      }
    } catch (error) {
      console.error('Error activating chakra:', error);
    }
  };
  
  const getUserChakraActivations = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const userId = session.session.user.id;
        
        const { data, error } = await supabase
          .from('user_chakra_activations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching chakra activations:', error);
      return [];
    }
  };
  
  return (
    <ChakraContext.Provider value={{ 
      activeChakra,
      chakraState,
      activateChakra, 
      getUserChakraActivations
    }}>
      {children}
    </ChakraContext.Provider>
  );
};

// Custom hook to use the chakra context
export const useChakra = () => {
  const context = useContext(ChakraContext);
  if (context === undefined) {
    throw new Error('useChakra must be used within a ChakraProvider');
  }
  return context;
};