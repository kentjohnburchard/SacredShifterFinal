import React from 'react';
import { motion } from 'framer-motion';
import { useCodex } from '../../context/CodexContext';
import { useChakra } from '../../context/ChakraContext';
import { Zap, Activity, Compass, Scale, Sparkles } from 'lucide-react';

interface ResonanceGaugeProps {
  sigilId?: string;
  showOverall?: boolean;
  showDetails?: boolean;
  className?: string;
}

const ResonanceGauge: React.FC<ResonanceGaugeProps> = ({
  sigilId,
  showOverall = true,
  showDetails = false,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const { 
    getResonanceScore, 
    getQuantumResonance, 
    selectedSigil 
  } = useCodex();
  
  // Get the appropriate resonance score
  const resonance = sigilId 
    ? getResonanceScore(sigilId)
    : selectedSigil 
      ? getResonanceScore(selectedSigil.id)
      : { overall: getQuantumResonance(), chakraHarmony: 0, frequencyAlignment: 0, timelineAlignment: 0, universalLawCompliance: 0 };
  
  // Get color based on resonance level
  const getResonanceColor = (value: number): string => {
    if (value >= 80) return chakraState.color;
    if (value >= 60) return '#66BB6A'; // Green
    if (value >= 40) return '#FFC107'; // Amber
    return '#EF5350'; // Red
  };
  
  // Get label based on resonance level
  const getResonanceLabel = (value: number): string => {
    if (value >= 90) return 'Transcendent';
    if (value >= 80) return 'Harmonic';
    if (value >= 70) return 'Resonant';
    if (value >= 60) return 'Aligned';
    if (value >= 50) return 'Stable';
    if (value >= 40) return 'Fluctuating';
    if (value >= 30) return 'Discordant';
    return 'Chaotic';
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      {showOverall && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Sparkles size={18} className="mr-2" style={{ color: chakraState.color }} />
              <h3 className="text-lg font-medium text-white">Quantum Resonance</h3>
            </div>
            <div 
              className="text-lg font-medium"
              style={{ color: getResonanceColor(resonance.overall) }}
            >
              {resonance.overall}%
            </div>
          </div>
          
          <div className="w-full h-3 bg-dark-300 rounded-full overflow-hidden mb-2">
            <motion.div 
              className="h-full rounded-full"
              style={{ backgroundColor: getResonanceColor(resonance.overall) }}
              initial={{ width: 0 }}
              animate={{ width: `${resonance.overall}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          
          <div className="text-sm text-center" style={{ color: getResonanceColor(resonance.overall) }}>
            {getResonanceLabel(resonance.overall)}
          </div>
        </div>
      )}
      
      {showDetails && (
        <div className="space-y-3">
          <ResonanceDetail 
            label="Chakra Harmony" 
            value={resonance.chakraHarmony} 
            icon={<Activity size={14} />} 
          />
          
          <ResonanceDetail 
            label="Frequency Alignment" 
            value={resonance.frequencyAlignment} 
            icon={<Zap size={14} />} 
          />
          
          <ResonanceDetail 
            label="Timeline Alignment" 
            value={resonance.timelineAlignment} 
            icon={<Compass size={14} />} 
          />
          
          <ResonanceDetail 
            label="Universal Law Compliance" 
            value={resonance.universalLawCompliance} 
            icon={<Scale size={14} />} 
          />
        </div>
      )}
    </div>
  );
};

interface ResonanceDetailProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const ResonanceDetail: React.FC<ResonanceDetailProps> = ({ label, value, icon }) => {
  const { chakraState } = useChakra();
  
  // Get color based on value
  const getValueColor = (value: number): string => {
    if (value >= 80) return chakraState.color;
    if (value >= 60) return '#66BB6A'; // Green
    if (value >= 40) return '#FFC107'; // Amber
    return '#EF5350'; // Red
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center text-xs text-gray-400">
          <span className="mr-1">{icon}</span>
          {label}
        </div>
        <div 
          className="text-xs font-medium"
          style={{ color: getValueColor(value) }}
        >
          {value}%
        </div>
      </div>
      
      <div className="w-full h-1.5 bg-dark-300 rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full"
          style={{ backgroundColor: getValueColor(value) }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
};

export default ResonanceGauge;