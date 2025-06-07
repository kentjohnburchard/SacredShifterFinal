import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCodex } from '../../context/CodexContext';
import { useChakra } from '../../context/ChakraContext';
import { Sigil, SigilEvolutionStage } from '../../types';
import { Sprout, Flower, Star, Seedling, Zap } from 'lucide-react';
import TattooButton from '../ui/TattooButton';

interface SigilEvolutionPanelProps {
  sigilId: string;
  className?: string;
}

const SigilEvolutionPanel: React.FC<SigilEvolutionPanelProps> = ({
  sigilId,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const { 
    sigils, 
    getEvolutionStage, 
    evolveSigil,
    getResonanceScore
  } = useCodex();
  
  const [isEvolving, setIsEvolving] = useState(false);
  const [newIntention, setNewIntention] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const sigil = sigils.find(s => s.id === sigilId);
  const evolutionStage = getEvolutionStage(sigilId);
  const resonanceScore = getResonanceScore(sigilId);
  
  // Initialize new intention with the current one
  useEffect(() => {
    if (sigil) {
      setNewIntention(sigil.parameters.intention);
    }
  }, [sigil]);
  
  if (!sigil) return null;
  
  const handleEvolve = async () => {
    if (!newIntention.trim() || newIntention === sigil.parameters.intention) return;
    
    try {
      setIsSubmitting(true);
      await evolveSigil(sigilId, newIntention);
      setIsEvolving(false);
    } catch (error) {
      console.error('Error evolving sigil:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get icon for evolution stage
  const getStageIcon = (stage: SigilEvolutionStage) => {
    switch(stage) {
      case 'seed': return <Seedling size={18} />;
      case 'sprout': return <Sprout size={18} />;
      case 'bloom': return <Flower size={18} />;
      case 'mature': return <Star size={18} />;
      case 'transcendent': return <Zap size={18} />;
    }
  };
  
  // Get color for evolution stage
  const getStageColor = (stage: SigilEvolutionStage) => {
    switch(stage) {
      case 'seed': return '#64B5F6'; // Light blue
      case 'sprout': return '#81C784'; // Light green
      case 'bloom': return '#FFD54F'; // Amber
      case 'mature': return '#FF8A65'; // Light orange
      case 'transcendent': return chakraState.color;
    }
  };
  
  // Get description for evolution stage
  const getStageDescription = (stage: SigilEvolutionStage) => {
    switch(stage) {
      case 'seed': 
        return 'Your sigil is in its initial form, holding potential for growth.';
      case 'sprout': 
        return 'Your sigil has begun to manifest its energy in the quantum field.';
      case 'bloom': 
        return 'Your sigil is actively radiating its intention into reality.';
      case 'mature': 
        return 'Your sigil has established a strong presence in the quantum field.';
      case 'transcendent': 
        return 'Your sigil has transcended ordinary limitations and operates at peak resonance.';
    }
  };
  
  // Check if sigil can evolve
  const canEvolve = () => {
    // Require minimum resonance based on current stage
    switch(evolutionStage) {
      case 'seed': return resonanceScore.overall >= 40;
      case 'sprout': return resonanceScore.overall >= 60;
      case 'bloom': return resonanceScore.overall >= 75;
      case 'mature': return resonanceScore.overall >= 85;
      case 'transcendent': return false; // Cannot evolve further
    }
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center mb-4">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
          style={{ 
            backgroundColor: `${getStageColor(evolutionStage)}30`,
            color: getStageColor(evolutionStage)
          }}
        >
          {getStageIcon(evolutionStage)}
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">
            {evolutionStage.charAt(0).toUpperCase() + evolutionStage.slice(1)} Stage
          </h3>
          <p className="text-sm text-gray-400">
            Evolution Level {getEvolutionStageLevel(evolutionStage)}/5
          </p>
        </div>
      </div>
      
      <p className="text-sm text-gray-300 mb-4">
        {getStageDescription(evolutionStage)}
      </p>
      
      {/* Evolution progress */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <div className="text-xs text-gray-400">Evolution Progress</div>
          <div className="text-xs text-gray-400">
            {getEvolutionProgress(evolutionStage, resonanceScore.overall)}%
          </div>
        </div>
        
        <div className="w-full h-2 bg-dark-300 rounded-full overflow-hidden">
          <motion.div 
            className="h-full"
            style={{ backgroundColor: getStageColor(evolutionStage) }}
            initial={{ width: 0 }}
            animate={{ width: `${getEvolutionProgress(evolutionStage, resonanceScore.overall)}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
      
      {/* Evolution stages visualization */}
      <div className="flex justify-between mb-6">
        {(['seed', 'sprout', 'bloom', 'mature', 'transcendent'] as SigilEvolutionStage[]).map((stage, index) => {
          const isCurrent = stage === evolutionStage;
          const isPast = getEvolutionStageLevel(stage) < getEvolutionStageLevel(evolutionStage);
          const isFuture = !isCurrent && !isPast;
          
          return (
            <div key={stage} className="flex flex-col items-center">
              <motion.div 
                className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                animate={{ 
                  scale: isCurrent ? [1, 1.1, 1] : 1,
                  boxShadow: isCurrent ? [
                    `0 0 0px ${getStageColor(stage)}`,
                    `0 0 10px ${getStageColor(stage)}`,
                    `0 0 0px ${getStageColor(stage)}`
                  ] : undefined
                }}
                transition={{ 
                  duration: 3,
                  repeat: isCurrent ? Infinity : 0,
                  repeatType: "reverse"
                }}
                style={{ 
                  backgroundColor: isPast || isCurrent ? `${getStageColor(stage)}30` : 'transparent',
                  color: isPast || isCurrent ? getStageColor(stage) : '#666',
                  border: isFuture ? '1px dashed #666' : 'none'
                }}
              >
                {getStageIcon(stage)}
              </motion.div>
              
              {index < 4 && (
                <div 
                  className="w-full h-0.5 mt-4"
                  style={{ 
                    backgroundColor: isPast ? getStageColor(stage) : '#444',
                    opacity: isPast ? 0.7 : 0.3
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {isEvolving ? (
        <div className="space-y-3">
          <div className="text-sm text-gray-300 mb-1">
            Update your sigil's intention to evolve it:
          </div>
          
          <textarea
            value={newIntention}
            onChange={(e) => setNewIntention(e.target.value)}
            className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
            style={{ focusRingColor: chakraState.color }}
            rows={3}
          />
          
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEvolving(false)}
              className="px-3 py-1.5 bg-dark-300 text-gray-300 rounded-md text-sm"
            >
              Cancel
            </button>
            
            <TattooButton
              onClick={handleEvolve}
              disabled={isSubmitting || !newIntention.trim() || newIntention === sigil.parameters.intention}
              chakraColor={chakraState.color}
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <motion.span 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block mr-1"
                  >
                    ⟳
                  </motion.span>
                  Evolving...
                </>
              ) : 'Evolve Sigil'}
            </TattooButton>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {canEvolve() 
              ? 'This sigil is ready to evolve to the next stage'
              : `Needs ${getRequiredResonance(evolutionStage)}% resonance to evolve`}
          </div>
          
          <TattooButton
            onClick={() => setIsEvolving(true)}
            disabled={!canEvolve() || evolutionStage === 'transcendent'}
            chakraColor={chakraState.color}
            size="sm"
          >
            Evolve
          </TattooButton>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getEvolutionStageLevel = (stage: SigilEvolutionStage): number => {
  switch(stage) {
    case 'seed': return 1;
    case 'sprout': return 2;
    case 'bloom': return 3;
    case 'mature': return 4;
    case 'transcendent': return 5;
  }
};

const getRequiredResonance = (stage: SigilEvolutionStage): number => {
  switch(stage) {
    case 'seed': return 40;
    case 'sprout': return 60;
    case 'bloom': return 75;
    case 'mature': return 85;
    case 'transcendent': return 100;
  }
};

const getEvolutionProgress = (stage: SigilEvolutionStage, resonance: number): number => {
  const currentLevel = getEvolutionStageLevel(stage);
  if (currentLevel === 5) return 100; // Transcendent is always 100%
  
  const currentThreshold = getRequiredResonance(stage);
  const nextStage = getNextStage(stage);
  const nextThreshold = getRequiredResonance(nextStage);
  
  // Calculate progress to next stage
  if (resonance >= nextThreshold) return 100;
  
  const progress = ((resonance - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.max(0, Math.min(100, progress));
};

const getNextStage = (stage: SigilEvolutionStage): SigilEvolutionStage => {
  switch(stage) {
    case 'seed': return 'sprout';
    case 'sprout': return 'bloom';
    case 'bloom': return 'mature';
    case 'mature': return 'transcendent';
    case 'transcendent': return 'transcendent';
  }
};

export default SigilEvolutionPanel;