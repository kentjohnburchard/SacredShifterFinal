import React from 'react';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { groupMetricsData } from '../../data/sacredCircleData';
import { BarChart2, Activity, Clock, Users } from 'lucide-react';
import ChakraBadge from '../chakra/ChakraBadge';

interface CircleMetricsProps {
  className?: string;
}

const CircleMetrics: React.FC<CircleMetricsProps> = ({
  className = ''
}) => {
  const { chakraState } = useChakra();
  
  // Get dominant chakra
  const getDominantChakra = (): string => {
    let maxValue = -1;
    let dominantChakra = 'Heart';
    
    Object.entries(groupMetricsData.chakraDistribution).forEach(([chakra, value]) => {
      if (value > maxValue) {
        maxValue = value;
        dominantChakra = chakra;
      }
    });
    
    return dominantChakra;
  };
  
  // Get timeline balance description
  const getTimelineBalanceDescription = (): string => {
    const { past, present, future } = groupMetricsData.timelineBalance;
    const total = past + present + future;
    
    if (present > past && present > future) {
      return 'Present-focused';
    } else if (past > present && past > future) {
      return 'Past-integrated';
    } else if (future > past && future > present) {
      return 'Future-oriented';
    } else {
      return 'Balanced';
    }
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center mb-4">
        <BarChart2 size={18} className="mr-2" style={{ color: chakraState.color }} />
        <h3 className="text-lg font-medium text-white">Circle Soul Metrics</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          className="p-3 rounded-lg"
          style={{ 
            backgroundColor: `${chakraState.color}15`,
            border: `1px solid ${chakraState.color}30`
          }}
        >
          <div className="text-sm text-gray-400 mb-1">Total Circle XP</div>
          <div className="text-xl font-medium" style={{ color: chakraState.color }}>
            {groupMetricsData.totalCircleXP.toLocaleString()}
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-dark-300">
          <div className="text-sm text-gray-400 mb-1">Highest Resonance</div>
          <div className="text-xl font-medium text-white">
            {groupMetricsData.highestResonance}%
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-dark-300">
          <div className="text-sm text-gray-400 mb-1">Daily Pulse Rate</div>
          <div className="flex items-center">
            <Activity size={16} className="mr-1 text-gray-400" />
            <span className="text-xl font-medium text-white">{groupMetricsData.dailyPulseRate}</span>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-dark-300">
          <div className="text-sm text-gray-400 mb-1">Timeline Balance</div>
          <div className="text-xl font-medium text-white">
            {getTimelineBalanceDescription()}
          </div>
        </div>
      </div>
      
      {/* Chakra Distribution */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-400">Chakra Distribution</div>
          <div className="flex items-center text-sm">
            <span className="text-gray-400 mr-1">Dominant:</span>
            <ChakraBadge chakra={getDominantChakra() as ChakraType} size="sm" />
          </div>
        </div>
        
        <div className="h-4 bg-dark-300 rounded-full overflow-hidden flex">
          {Object.entries(groupMetricsData.chakraDistribution).map(([chakra, value]) => {
            const percentage = (value / 100) * 100;
            return (
              <motion.div
                key={chakra}
                className="h-full"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: `var(--chakra-${chakra.toLowerCase()})`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1 }}
              />
            );
          })}
        </div>
        
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>Root</span>
          <span>Sacral</span>
          <span>Solar</span>
          <span>Heart</span>
          <span>Throat</span>
          <span>Third Eye</span>
          <span>Crown</span>
        </div>
      </div>
      
      {/* Timeline Balance */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-400">Timeline Balance</div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="h-20 bg-dark-300 rounded-lg overflow-hidden relative">
              <motion.div
                className="absolute bottom-0 left-0 right-0"
                style={{ 
                  backgroundColor: 'var(--chakra-root)',
                  height: `${groupMetricsData.timelineBalance.past}%`
                }}
                initial={{ height: 0 }}
                animate={{ height: `${groupMetricsData.timelineBalance.past}%` }}
                transition={{ duration: 1 }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
                {groupMetricsData.timelineBalance.past}%
              </div>
            </div>
            <div className="text-center text-xs text-gray-400 mt-1">Past</div>
          </div>
          
          <div>
            <div className="h-20 bg-dark-300 rounded-lg overflow-hidden relative">
              <motion.div
                className="absolute bottom-0 left-0 right-0"
                style={{ 
                  backgroundColor: 'var(--chakra-heart)',
                  height: `${groupMetricsData.timelineBalance.present}%`
                }}
                initial={{ height: 0 }}
                animate={{ height: `${groupMetricsData.timelineBalance.present}%` }}
                transition={{ duration: 1 }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
                {groupMetricsData.timelineBalance.present}%
              </div>
            </div>
            <div className="text-center text-xs text-gray-400 mt-1">Present</div>
          </div>
          
          <div>
            <div className="h-20 bg-dark-300 rounded-lg overflow-hidden relative">
              <motion.div
                className="absolute bottom-0 left-0 right-0"
                style={{ 
                  backgroundColor: 'var(--chakra-crown)',
                  height: `${groupMetricsData.timelineBalance.future}%`
                }}
                initial={{ height: 0 }}
                animate={{ height: `${groupMetricsData.timelineBalance.future}%` }}
                transition={{ duration: 1 }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
                {groupMetricsData.timelineBalance.future}%
              </div>
            </div>
            <div className="text-center text-xs text-gray-400 mt-1">Future</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleMetrics;