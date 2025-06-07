import React from 'react';
import { motion } from 'framer-motion';
import { useCodex } from '../../context/CodexContext';
import { useChakra } from '../../context/ChakraContext';
import { Sigil, SigilEvolutionStage } from '../../types';
import { Download, Clock, Zap, Compass } from 'lucide-react';

interface CodexSigilCardProps {
  sigil: Sigil;
  onClick?: () => void;
  showDetails?: boolean;
  className?: string;
}

const CodexSigilCard: React.FC<CodexSigilCardProps> = ({
  sigil,
  onClick,
  showDetails = false,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const { 
    getResonanceScore, 
    getEvolutionStage, 
    getSigilTimelineAlignment,
    checkUniversalLawCompliance
  } = useCodex();
  
  const resonanceScore = getResonanceScore(sigil.id);
  const evolutionStage = getEvolutionStage(sigil.id);
  const timelineNode = getSigilTimelineAlignment(sigil.id);
  const compliantLaws = checkUniversalLawCompliance(sigil.id);
  
  // Get color based on chakra
  const getChakraColor = () => {
    const chakraType = sigil.parameters.chakra;
    const chakraColors: Record<string, string> = {
      Root: 'var(--chakra-root)',
      Sacral: 'var(--chakra-sacral)',
      SolarPlexus: 'var(--chakra-solarplexus)',
      Heart: 'var(--chakra-heart)',
      Throat: 'var(--chakra-throat)',
      ThirdEye: 'var(--chakra-thirdeye)',
      Crown: 'var(--chakra-crown)'
    };
    
    return chakraColors[chakraType] || chakraState.color;
  };
  
  // Get animation properties based on evolution stage
  const getEvolutionAnimationProps = () => {
    switch(evolutionStage) {
      case 'seed':
        return {
          rotate: [0, 5, 0, -5, 0],
          scale: [1, 1.02, 1, 1.02, 1],
          transition: { duration: 10, repeat: Infinity }
        };
      case 'sprout':
        return {
          rotate: [0, 10, 0, -10, 0],
          scale: [1, 1.05, 1, 1.05, 1],
          transition: { duration: 8, repeat: Infinity }
        };
      case 'bloom':
        return {
          rotate: 360,
          transition: { duration: 30, repeat: Infinity, ease: "linear" }
        };
      case 'mature':
        return {
          rotate: 360,
          scale: [1, 1.1, 1],
          transition: { 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity }
          }
        };
      case 'transcendent':
        return {
          rotate: 360,
          scale: [1, 1.15, 1],
          filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"],
          transition: { 
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity },
            filter: { duration: 3, repeat: Infinity }
          }
        };
      default:
        return {};
    }
  };
  
  // Get glow intensity based on resonance score
  const getGlowIntensity = () => {
    const intensity = resonanceScore.overall / 100;
    return `0 0 ${10 + intensity * 20}px ${getChakraColor()}${Math.floor(intensity * 80).toString(16)}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <motion.div
      className={`bg-dark-200 rounded-2xl border border-dark-300 overflow-hidden ${className} ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      onClick={onClick}
      style={{
        boxShadow: getGlowIntensity()
      }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-medium text-white line-clamp-1" title={sigil.parameters.intention}>
            {sigil.parameters.intention}
          </h3>
          
          <div 
            className="px-2 py-0.5 text-xs rounded-full"
            style={{ 
              backgroundColor: `${getChakraColor()}20`,
              color: getChakraColor()
            }}
          >
            {evolutionStage.charAt(0).toUpperCase() + evolutionStage.slice(1)}
          </div>
        </div>
        
        <div className="flex justify-center mb-4">
          <motion.div
            className="w-32 h-32 flex items-center justify-center"
            animate={getEvolutionAnimationProps()}
            dangerouslySetInnerHTML={{ __html: sigil.parameters.svg }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="flex items-center">
            <div 
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: getChakraColor() }}
            />
            <span className="text-gray-300">{sigil.parameters.chakra} Chakra</span>
          </div>
          
          <div className="flex items-center">
            <Zap size={12} className="mr-1 text-gray-400" />
            <span className="text-gray-300">{sigil.parameters.frequency} Hz</span>
          </div>
          
          <div className="flex items-center">
            <Clock size={12} className="mr-1 text-gray-400" />
            <span className="text-gray-300">{formatDate(sigil.created_at)}</span>
          </div>
          
          {timelineNode && (
            <div className="flex items-center">
              <Compass size={12} className="mr-1 text-gray-400" />
              <span className="text-gray-300">{timelineNode.name}</span>
            </div>
          )}
        </div>
        
        {/* Resonance meter */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Resonance</span>
            <span className="text-white">{resonanceScore.overall}%</span>
          </div>
          <div className="w-full h-1.5 bg-dark-300 rounded-full overflow-hidden">
            <motion.div 
              className="h-full"
              style={{ backgroundColor: getChakraColor() }}
              initial={{ width: 0 }}
              animate={{ width: `${resonanceScore.overall}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
        
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-dark-300">
            <h4 className="text-sm font-medium text-white mb-2">Universal Law Compliance</h4>
            <div className="space-y-1.5">
              {compliantLaws.slice(0, 3).map(law => (
                <div key={law.id} className="text-xs">
                  <div className="font-medium text-gray-300">{law.name}</div>
                  <div className="text-gray-400">{law.description}</div>
                </div>
              ))}
              {compliantLaws.length > 3 && (
                <div className="text-xs text-gray-400">
                  +{compliantLaws.length - 3} more laws
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CodexSigilCard;