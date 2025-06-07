import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useChakra } from './ChakraContext';
import { useXP } from './XPProvider';
import { supabase } from '../lib/supabase';
import { 
  Sigil, 
  SigilSticker, 
  ChakraType, 
  TimelineNode, 
  CodexEntry,
  UniversalLaw,
  ResonanceScore,
  SigilEvolutionStage
} from '../types';

// Define the shape of our Codex context
interface CodexContextType {
  // Sigil Management
  sigils: Sigil[];
  selectedSigil: Sigil | null;
  selectSigil: (sigil: Sigil) => void;
  recordSigil: (parameters: any) => Promise<Sigil | null>;
  evolveSigil: (sigilId: string, intention: string) => Promise<Sigil | null>;
  
  // Timeline Management
  timelineNodes: TimelineNode[];
  selectedNode: TimelineNode | null;
  selectTimelineNode: (node: TimelineNode) => void;
  alignToTimeline: (sigilId: string, nodeId: string) => Promise<boolean>;
  getSigilTimelineAlignment: (sigilId: string) => TimelineNode | null;
  
  // Resonance & Compliance
  getResonanceScore: (sigilId: string) => ResonanceScore;
  getEvolutionStage: (sigilId: string) => SigilEvolutionStage;
  checkUniversalLawCompliance: (sigilId: string) => UniversalLaw[];
  getQuantumResonance: () => number;
  
  // Codex Entries
  codexEntries: CodexEntry[];
  addCodexEntry: (entry: Omit<CodexEntry, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  
  // Board Management
  sigilBoards: any[];
  activeSigilBoard: any | null;
  selectSigilBoard: (boardId: string) => void;
  createSigilBoard: (name: string, description?: string) => Promise<any>;
  updateSigilBoard: (boardId: string, updates: any) => Promise<void>;
  
  // State
  isLoading: boolean;
  error: string | null;
}

// Create the context
const CodexContext = createContext<CodexContextType | undefined>(undefined);

// Universal laws for compliance checking
const UNIVERSAL_LAWS: UniversalLaw[] = [
  { id: 'law-of-vibration', name: 'Law of Vibration', description: 'Everything vibrates at a specific frequency' },
  { id: 'law-of-correspondence', name: 'Law of Correspondence', description: 'As above, so below; as within, so without' },
  { id: 'law-of-polarity', name: 'Law of Polarity', description: 'Everything has its opposite' },
  { id: 'law-of-rhythm', name: 'Law of Rhythm', description: 'All things rise and fall in a measured motion' },
  { id: 'law-of-cause-effect', name: 'Law of Cause & Effect', description: 'Every action has a reaction' },
  { id: 'law-of-gender', name: 'Law of Gender', description: 'Masculine and feminine principles exist in all things' },
  { id: 'law-of-attraction', name: 'Law of Attraction', description: 'Like attracts like' },
  { id: 'law-of-perpetual-transmutation', name: 'Law of Perpetual Transmutation', description: 'Energy is always in motion and can be converted' },
  { id: 'law-of-relativity', name: 'Law of Relativity', description: 'Everything is relative and connected' },
];

// Provider component
export const CodexProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP } = useXP();
  
  // State for sigils and timeline
  const [sigils, setSigils] = useState<Sigil[]>([]);
  const [selectedSigil, setSelectedSigil] = useState<Sigil | null>(null);
  const [timelineNodes, setTimelineNodes] = useState<TimelineNode[]>([
    {
      id: 'past-echo',
      name: 'Past Echo',
      description: 'Integrate wisdom from your journey',
      chakra: 'Root',
      x: 150,
      y: 300,
      color: 'var(--chakra-root)'
    },
    {
      id: 'present-flow',
      name: 'Present Flow',
      description: 'Embody your current truth',
      chakra: 'Heart',
      x: 400,
      y: 150,
      color: 'var(--chakra-heart)'
    },
    {
      id: 'future-vision',
      name: 'Future Vision',
      description: 'Manifest your highest potential',
      chakra: 'Crown',
      x: 650,
      y: 300,
      color: 'var(--chakra-crown)'
    }
  ]);
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null);
  const [sigilAlignments, setSigilAlignments] = useState<Record<string, string>>({});
  const [codexEntries, setCodexEntries] = useState<CodexEntry[]>([]);
  const [sigilBoards, setSigilBoards] = useState<any[]>([]);
  const [activeSigilBoard, setActiveSigilBoard] = useState<any | null>(null);
  const [resonanceScores, setResonanceScores] = useState<Record<string, ResonanceScore>>({});
  const [evolutionStages, setEvolutionStages] = useState<Record<string, SigilEvolutionStage>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch sigils and other data on mount
  useEffect(() => {
    if (user) {
      fetchSigils();
      fetchCodexEntries();
      fetchSigilBoards();
    }
  }, [user]);
  
  // Calculate resonance scores and evolution stages when sigils change
  useEffect(() => {
    if (sigils.length > 0) {
      calculateResonanceScores();
      determineEvolutionStages();
    }
  }, [sigils, sigilAlignments]);
  
  // Fetch sigils from Supabase
  const fetchSigils = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('fractal_glyphs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSigils(data || []);
      if (data && data.length > 0) {
        setSelectedSigil(data[0]);
      }
      
      // Fetch sigil alignments
      const { data: alignments, error: alignmentsError } = await supabase
        .from('sigil_alignments')
        .select('sigil_id, timeline_node_id')
        .eq('user_id', user?.id);
        
      if (alignmentsError) throw alignmentsError;
      
      if (alignments) {
        const alignmentMap: Record<string, string> = {};
        alignments.forEach(a => {
          alignmentMap[a.sigil_id] = a.timeline_node_id;
        });
        setSigilAlignments(alignmentMap);
      }
      
    } catch (error) {
      console.error('Error fetching sigils:', error);
      setError('Failed to load sigils');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch codex entries
  const fetchCodexEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('codex_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setCodexEntries(data || []);
    } catch (error) {
      console.error('Error fetching codex entries:', error);
    }
  };
  
  // Fetch sigil boards
  const fetchSigilBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('sigil_boards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSigilBoards(data || []);
      if (data && data.length > 0) {
        setActiveSigilBoard(data[0]);
      }
    } catch (error) {
      console.error('Error fetching sigil boards:', error);
    }
  };
  
  // Calculate resonance scores for all sigils
  const calculateResonanceScores = () => {
    const scores: Record<string, ResonanceScore> = {};
    
    sigils.forEach(sigil => {
      // Base resonance starts at 50
      let baseResonance = 50;
      
      // Check if sigil is aligned to a timeline node
      const alignedNodeId = sigilAlignments[sigil.id];
      if (alignedNodeId) {
        const node = timelineNodes.find(n => n.id === alignedNodeId);
        if (node) {
          // Bonus for alignment
          baseResonance += 20;
          
          // Extra bonus if chakra matches node chakra
          if (node.chakra === sigil.parameters.chakra) {
            baseResonance += 15;
          }
        }
      }
      
      // Tesla number bonus (3, 6, 9)
      const frequency = sigil.parameters.frequency.toString();
      if (frequency.includes('3') || frequency.includes('6') || frequency.includes('9')) {
        baseResonance += 10;
      }
      
      // Intention clarity bonus (based on length of intention)
      const intentionLength = sigil.parameters.intention.length;
      if (intentionLength > 30) {
        baseResonance += 5;
      }
      
      // Cap at 100
      const finalResonance = Math.min(baseResonance, 100);
      
      // Calculate harmony with current chakra state
      const chakraHarmony = sigil.parameters.chakra === chakraState.type ? 100 : 
        getChakraHarmony(sigil.parameters.chakra as ChakraType, chakraState.type);
      
      // Calculate frequency alignment
      const frequencyAlignment = 100 - Math.min(100, Math.abs(sigil.parameters.frequency - chakraState.frequency) / 10);
      
      scores[sigil.id] = {
        overall: finalResonance,
        chakraHarmony,
        frequencyAlignment,
        timelineAlignment: alignedNodeId ? 100 : 0,
        universalLawCompliance: calculateLawCompliance(sigil)
      };
    });
    
    setResonanceScores(scores);
  };
  
  // Determine evolution stages for all sigils
  const determineEvolutionStages = () => {
    const stages: Record<string, SigilEvolutionStage> = {};
    
    sigils.forEach(sigil => {
      // Base on creation date (newer = earlier stage)
      const creationDate = new Date(sigil.created_at);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Get resonance score
      const resonance = resonanceScores[sigil.id]?.overall || 50;
      
      // Determine stage based on age and resonance
      let stage: SigilEvolutionStage;
      
      if (daysSinceCreation < 1) {
        stage = 'seed';
      } else if (daysSinceCreation < 3) {
        stage = resonance > 70 ? 'sprout' : 'seed';
      } else if (daysSinceCreation < 7) {
        stage = resonance > 80 ? 'bloom' : resonance > 60 ? 'sprout' : 'seed';
      } else if (daysSinceCreation < 14) {
        stage = resonance > 85 ? 'mature' : resonance > 70 ? 'bloom' : resonance > 50 ? 'sprout' : 'seed';
      } else {
        stage = resonance > 90 ? 'transcendent' : resonance > 80 ? 'mature' : resonance > 65 ? 'bloom' : resonance > 40 ? 'sprout' : 'seed';
      }
      
      stages[sigil.id] = stage;
    });
    
    setEvolutionStages(stages);
  };
  
  // Calculate compliance with universal laws
  const calculateLawCompliance = (sigil: Sigil): number => {
    // This would be a complex algorithm in a real app
    // For now, we'll use a simple random value between 60-100
    return 60 + Math.floor(Math.random() * 40);
  };
  
  // Get chakra harmony between two chakras (0-100)
  const getChakraHarmony = (chakra1: ChakraType, chakra2: ChakraType): number => {
    const chakraIndex: Record<ChakraType, number> = {
      'Root': 1,
      'Sacral': 2,
      'SolarPlexus': 3,
      'Heart': 4,
      'Throat': 5,
      'ThirdEye': 6,
      'Crown': 7
    };
    
    // Calculate distance between chakras (1-6)
    const distance = Math.abs(chakraIndex[chakra1] - chakraIndex[chakra2]);
    
    // Convert to harmony score (0-100)
    // Adjacent chakras have 80% harmony, opposite chakras have 30% harmony
    return 100 - (distance * 12);
  };
  
  // Select a sigil
  const selectSigil = (sigil: Sigil) => {
    setSelectedSigil(sigil);
    
    // If sigil is aligned to a timeline node, select that node too
    const nodeId = sigilAlignments[sigil.id];
    if (nodeId) {
      const node = timelineNodes.find(n => n.id === nodeId);
      if (node) {
        setSelectedNode(node);
        activateChakra(node.chakra);
      }
    }
  };
  
  // Record a new sigil
  const recordSigil = async (parameters: any): Promise<Sigil | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('fractal_glyphs')
        .insert([
          {
            user_id: user.id,
            parameters
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Add to local state
      const newSigil = data as Sigil;
      setSigils([newSigil, ...sigils]);
      setSelectedSigil(newSigil);
      
      // Award XP
      await addXP(25);
      
      // Log to continuum_sessions
      await supabase
        .from('continuum_sessions')
        .insert([
          {
            user_id: user.id,
            session_type: 'sigil_creation',
            xp_awarded: 25,
            chakra: parameters.chakra,
            frequency: parameters.frequency,
            timestamp: new Date().toISOString()
          }
        ]);
      
      // Add a codex entry
      await addCodexEntry({
        title: `Sigil: ${parameters.intention}`,
        content: `Created a new sigil with the intention: ${parameters.intention}`,
        type: 'sigil_creation',
        chakra: parameters.chakra,
        tags: ['sigil', parameters.chakra.toLowerCase()]
      });
      
      return newSigil;
    } catch (error) {
      console.error('Error recording sigil:', error);
      setError('Failed to create sigil');
      return null;
    }
  };
  
  // Evolve an existing sigil
  const evolveSigil = async (sigilId: string, intention: string): Promise<Sigil | null> => {
    if (!user) return null;
    
    try {
      // Find the original sigil
      const originalSigil = sigils.find(s => s.id === sigilId);
      if (!originalSigil) throw new Error('Sigil not found');
      
      // Create evolved parameters
      const evolvedParameters = {
        ...originalSigil.parameters,
        intention,
        evolution_stage: evolutionStages[sigilId] || 'seed',
        evolution_parent: sigilId,
        evolution_date: new Date().toISOString()
      };
      
      // Create new sigil
      const { data, error } = await supabase
        .from('fractal_glyphs')
        .insert([
          {
            user_id: user.id,
            parameters: evolvedParameters
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Add to local state
      const newSigil = data as Sigil;
      setSigils([newSigil, ...sigils]);
      setSelectedSigil(newSigil);
      
      // Award XP
      await addXP(40);
      
      // Log to continuum_sessions
      await supabase
        .from('continuum_sessions')
        .insert([
          {
            user_id: user.id,
            session_type: 'sigil_evolution',
            xp_awarded: 40,
            chakra: evolvedParameters.chakra,
            frequency: evolvedParameters.frequency,
            timestamp: new Date().toISOString()
          }
        ]);
      
      // Add a codex entry
      await addCodexEntry({
        title: `Sigil Evolution: ${intention}`,
        content: `Evolved sigil from "${originalSigil.parameters.intention}" to "${intention}"`,
        type: 'sigil_evolution',
        chakra: evolvedParameters.chakra,
        tags: ['sigil', 'evolution', evolvedParameters.chakra.toLowerCase()]
      });
      
      return newSigil;
    } catch (error) {
      console.error('Error evolving sigil:', error);
      setError('Failed to evolve sigil');
      return null;
    }
  };
  
  // Select a timeline node
  const selectTimelineNode = (node: TimelineNode) => {
    setSelectedNode(node);
    activateChakra(node.chakra);
  };
  
  // Align a sigil to a timeline node
  const alignToTimeline = async (sigilId: string, nodeId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if sigil and node exist
      const sigil = sigils.find(s => s.id === sigilId);
      const node = timelineNodes.find(n => n.id === nodeId);
      
      if (!sigil || !node) throw new Error('Sigil or node not found');
      
      // Update or insert alignment
      const { error } = await supabase
        .from('sigil_alignments')
        .upsert([
          {
            user_id: user.id,
            sigil_id: sigilId,
            timeline_node_id: nodeId,
            alignment_date: new Date().toISOString()
          }
        ]);
        
      if (error) throw error;
      
      // Update local state
      setSigilAlignments({
        ...sigilAlignments,
        [sigilId]: nodeId
      });
      
      // Award XP
      await addXP(15);
      
      // Log to continuum_sessions
      await supabase
        .from('continuum_sessions')
        .insert([
          {
            user_id: user.id,
            session_type: 'sigil_alignment',
            xp_awarded: 15,
            chakra: node.chakra,
            timestamp: new Date().toISOString()
          }
        ]);
      
      // Add a codex entry
      await addCodexEntry({
        title: `Timeline Alignment: ${node.name}`,
        content: `Aligned sigil "${sigil.parameters.intention}" to the ${node.name} timeline node`,
        type: 'sigil_alignment',
        chakra: node.chakra,
        tags: ['sigil', 'timeline', node.id]
      });
      
      return true;
    } catch (error) {
      console.error('Error aligning sigil to timeline:', error);
      setError('Failed to align sigil');
      return false;
    }
  };
  
  // Get the timeline node a sigil is aligned to
  const getSigilTimelineAlignment = (sigilId: string): TimelineNode | null => {
    const nodeId = sigilAlignments[sigilId];
    if (!nodeId) return null;
    
    return timelineNodes.find(n => n.id === nodeId) || null;
  };
  
  // Get the resonance score for a sigil
  const getResonanceScore = (sigilId: string): ResonanceScore => {
    return resonanceScores[sigilId] || {
      overall: 50,
      chakraHarmony: 50,
      frequencyAlignment: 50,
      timelineAlignment: 0,
      universalLawCompliance: 70
    };
  };
  
  // Get the evolution stage for a sigil
  const getEvolutionStage = (sigilId: string): SigilEvolutionStage => {
    return evolutionStages[sigilId] || 'seed';
  };
  
  // Check universal law compliance for a sigil
  const checkUniversalLawCompliance = (sigilId: string): UniversalLaw[] => {
    // In a real app, this would be a complex algorithm
    // For now, we'll return a subset of laws that the sigil complies with
    const sigil = sigils.find(s => s.id === sigilId);
    if (!sigil) return [];
    
    // Use the sigil's parameters to determine which laws it complies with
    const compliantLaws: UniversalLaw[] = [];
    
    // Law of Vibration - all sigils comply
    compliantLaws.push(UNIVERSAL_LAWS[0]);
    
    // Law of Correspondence - if aligned to a timeline
    if (sigilAlignments[sigilId]) {
      compliantLaws.push(UNIVERSAL_LAWS[1]);
    }
    
    // Law of Polarity - if intention has contrast
    if (sigil.parameters.intention.includes(' and ') || 
        sigil.parameters.intention.includes(' but ') ||
        sigil.parameters.intention.includes(' yet ')) {
      compliantLaws.push(UNIVERSAL_LAWS[2]);
    }
    
    // Law of Rhythm - if frequency is a Tesla number
    const frequency = sigil.parameters.frequency.toString();
    if (frequency.includes('3') || frequency.includes('6') || frequency.includes('9')) {
      compliantLaws.push(UNIVERSAL_LAWS[3]);
    }
    
    // Law of Cause & Effect - if intention is action-oriented
    if (sigil.parameters.intention.toLowerCase().includes('create') || 
        sigil.parameters.intention.toLowerCase().includes('manifest') ||
        sigil.parameters.intention.toLowerCase().includes('generate')) {
      compliantLaws.push(UNIVERSAL_LAWS[4]);
    }
    
    // Add a few random laws to make it interesting
    const remainingLaws = UNIVERSAL_LAWS.filter(law => !compliantLaws.includes(law));
    const randomLaws = remainingLaws.sort(() => 0.5 - Math.random()).slice(0, 2);
    compliantLaws.push(...randomLaws);
    
    return compliantLaws;
  };
  
  // Get overall quantum resonance for all sigils
  const getQuantumResonance = (): number => {
    if (sigils.length === 0) return 0;
    
    // Calculate average resonance of all sigils
    const totalResonance = Object.values(resonanceScores).reduce(
      (sum, score) => sum + score.overall, 
      0
    );
    
    const baseResonance = totalResonance / Math.max(1, Object.keys(resonanceScores).length);
    
    // Bonus for aligned sigils
    const alignedSigilCount = Object.keys(sigilAlignments).length;
    const alignmentBonus = alignedSigilCount * 5;
    
    // Bonus for chakra diversity (having sigils across different chakras)
    const uniqueChakras = new Set(sigils.map(s => s.parameters.chakra));
    const chakraDiversityBonus = uniqueChakras.size * 3;
    
    // Calculate final resonance (cap at 100)
    return Math.min(100, baseResonance + alignmentBonus + chakraDiversityBonus);
  };
  
  // Add a codex entry
  const addCodexEntry = async (entry: Omit<CodexEntry, 'id' | 'user_id' | 'created_at'>): Promise<void> => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('codex_entries')
        .insert([
          {
            ...entry,
            user_id: user.id
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      setCodexEntries([data as CodexEntry, ...codexEntries]);
    } catch (error) {
      console.error('Error adding codex entry:', error);
      setError('Failed to add codex entry');
    }
  };
  
  // Select a sigil board
  const selectSigilBoard = (boardId: string) => {
    const board = sigilBoards.find(b => b.id === boardId);
    if (board) {
      setActiveSigilBoard(board);
    }
  };
  
  // Create a sigil board
  const createSigilBoard = async (name: string, description?: string) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('sigil_boards')
        .insert([
          {
            user_id: user.id,
            name,
            description,
            stickers: []
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      setSigilBoards([data, ...sigilBoards]);
      setActiveSigilBoard(data);
      
      return data;
    } catch (error) {
      console.error('Error creating sigil board:', error);
      setError('Failed to create sigil board');
      return null;
    }
  };
  
  // Update a sigil board
  const updateSigilBoard = async (boardId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('sigil_boards')
        .update(updates)
        .eq('id', boardId);
        
      if (error) throw error;
      
      // Update local state
      const updatedBoards = sigilBoards.map(board => 
        board.id === boardId ? { ...board, ...updates } : board
      );
      setSigilBoards(updatedBoards);
      
      if (activeSigilBoard?.id === boardId) {
        setActiveSigilBoard({ ...activeSigilBoard, ...updates });
      }
    } catch (error) {
      console.error('Error updating sigil board:', error);
      setError('Failed to update sigil board');
    }
  };
  
  // Context value
  const value: CodexContextType = {
    // Sigil Management
    sigils,
    selectedSigil,
    selectSigil,
    recordSigil,
    evolveSigil,
    
    // Timeline Management
    timelineNodes,
    selectedNode,
    selectTimelineNode,
    alignToTimeline,
    getSigilTimelineAlignment,
    
    // Resonance & Compliance
    getResonanceScore,
    getEvolutionStage,
    checkUniversalLawCompliance,
    getQuantumResonance,
    
    // Codex Entries
    codexEntries,
    addCodexEntry,
    
    // Board Management
    sigilBoards,
    activeSigilBoard,
    selectSigilBoard,
    createSigilBoard,
    updateSigilBoard,
    
    // State
    isLoading,
    error
  };
  
  return (
    <CodexContext.Provider value={value}>
      {children}
    </CodexContext.Provider>
  );
};

// Custom hook to use the codex context
export const useCodex = () => {
  const context = useContext(CodexContext);
  if (context === undefined) {
    throw new Error('useCodex must be used within a CodexProvider');
  }
  return context;
};