import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { useCodex } from '../context/CodexContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Compass, Zap, Eye, Calendar, Plus, Info, Download, RefreshCw, Maximize, Box, ArrowUpRight, Sparkles } from 'lucide-react';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';
import AnimatedGlyph from '../components/ui/AnimatedGlyph';
import FloatingFormulas from '../components/ui/FloatingFormulas';
import SymbolCanvas from '../components/ui/SymbolCanvas';
import TimelineNavigator from '../components/codex/TimelineNavigator';
import CodexSigilCard from '../components/codex/CodexSigilCard';
import ResonanceGauge from '../components/codex/ResonanceGauge';
import UniversalLawsPanel from '../components/codex/UniversalLawsPanel';
import SigilEvolutionPanel from '../components/codex/SigilEvolutionPanel';

const EchoCompassPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP, level } = useXP();
  const { 
    sigils, 
    selectedSigil, 
    selectSigil,
    timelineNodes,
    selectedNode,
    selectTimelineNode,
    getQuantumResonance
  } = useCodex();
  
  const [showSigilDetails, setShowSigilDetails] = useState(false);
  const [compassSize, setCompassSize] = useState({ width: 800, height: 600 });
  const [intention, setIntention] = useState('Navigate Sacred Timelines');
  const [showEvolution, setShowEvolution] = useState(false);
  const [showGridMap, setShowGridMap] = useState(false);
  const [showLawsPanel, setShowLawsPanel] = useState(false);
  
  const resonanceLevel = getQuantumResonance();
  
  useEffect(() => {
    const handleResize = () => {
      setCompassSize({
        width: Math.min(window.innerWidth - 100, 900),
        height: Math.min(window.innerHeight - 200, 700)
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownloadSigil = () => {
    if (!selectedSigil) return;
    
    // Create SVG blob
    const svgString = selectedSigil.parameters.svg;
    const blob = new Blob([svgString], {type: "image/svg+xml"});
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement("a");
    a.href = url;
    a.download = `sigil-${selectedSigil.id.substring(0, 8)}.svg`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <SacredHeading 
          as="h1" 
          className="text-3xl mb-2"
          chakraColor={chakraState.color}
          withGlow
          withAnimation
        >
          Echo Compass & Sigil Nexus
        </SacredHeading>
        <p className="text-gray-400 text-lg">
          Navigate your sacred timeline and witness how your sigils resonate in the quantum field
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Controls and Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Intention */}
          <motion.div
            className="bg-dark-200 p-4 rounded-2xl border border-dark-300 shadow-chakra-glow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-3">
              <Compass size={20} className="mr-2" style={{ color: chakraState.color }} />
              <h3 className="text-lg font-medium text-white">Navigation Intent</h3>
            </div>
            <input
              type="text"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
              style={{ focusRingColor: chakraState.color }}
              placeholder="Set your navigation intention..."
            />
          </motion.div>
          
          {/* Resonance Gauge */}
          <ResonanceGauge 
            sigilId={selectedSigil?.id}
            showOverall={true}
            showDetails={true}
            className="mb-6"
          />
          
          {/* Sigil Details */}
          <motion.div
            className="bg-dark-200 p-4 rounded-2xl border border-dark-300 shadow-chakra-glow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Eye size={20} className="mr-2" style={{ color: chakraState.color }} />
                <h3 className="text-lg font-medium text-white">Sigil Nexus</h3>
              </div>
              <div className="flex">
                <span className="text-sm text-gray-400">{sigils.length} sigils</span>
              </div>
            </div>
            
           {selectedSigil ? (
             <div>
               <CodexSigilCard 
                 sigil={selectedSigil} 
                 showDetails={showSigilDetails}
                 className="mb-3"
               />
               
               <div className="space-y-2">
                 <button
                   onClick={() => setShowSigilDetails(!showSigilDetails)}
                   className="w-full py-1.5 px-3 text-sm flex items-center justify-center rounded-md bg-dark-300 text-gray-300 hover:bg-dark-400"
                 >
                   <Info size={14} className="mr-1" />
                   {showSigilDetails ? "Hide Details" : "View Details"}
                 </button>
                 
                 <div className="flex space-x-2">
                   <button
                     onClick={handleDownloadSigil}
                     className="flex-1 py-1.5 px-3 text-sm flex items-center justify-center rounded-md bg-dark-300 text-gray-300 hover:bg-dark-400"
                     title="Download Sigil"
                   >
                     <Download size={14} className="mr-1" />
                     Download
                   </button>
                   
                   <button
                     onClick={() => setShowEvolution(!showEvolution)}
                     className="flex-1 py-1.5 px-3 text-sm flex items-center justify-center rounded-md bg-dark-300 text-gray-300 hover:bg-dark-400"
                   >
                     <Zap size={14} className="mr-1" />
                     Evolution
                   </button>
                 </div>
                 
                 <button
                   onClick={() => setShowLawsPanel(!showLawsPanel)}
                   className="w-full py-1.5 px-3 text-sm flex items-center justify-center rounded-md bg-dark-300 text-gray-300 hover:bg-dark-400"
                 >
                   <Scale size={14} className="mr-1" />
                   {showLawsPanel ? "Hide Universal Laws" : "View Universal Laws"}
                 </button>
               </div>
             </div>
           ) : (
             <div className="text-center py-4 text-gray-400 text-sm">
               <p>Select a sigil to view details</p>
             </div>
           )}
          </motion.div>
          
          {/* Create New Sigil */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <TattooButton
              chakraColor={chakraState.color}
              onClick={() => window.location.href = '/sigils'}
              className="w-full flex items-center justify-center"
            >
              <Plus size={16} className="mr-1" />
              Create New Sigil
            </TattooButton>
          </motion.div>
        </div>
        
        {/* Main Canvas: Echo Compass */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <motion.div
              className="bg-dark-200 rounded-2xl border border-dark-300 shadow-chakra-glow overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-4 border-b border-dark-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Sacred Timeline Navigation</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Active Chakra:</span>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: chakraState.color }}
                      />
                      <span className="text-sm ml-1" style={{ color: chakraState.color }}>
                        {chakraState.type}
                      </span>
                    </div>
                    
                    <button 
                      className="p-1.5 rounded-full bg-dark-300 text-gray-300 hover:text-white"
                      onClick={() => setShowGridMap(!showGridMap)}
                      title={showGridMap ? "Show Timeline Map" : "Show Grid Map"}
                    >
                      {showGridMap ? <Compass size={18} /> : <Box size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                {/* Mystical mathematical background */}
                <div className="absolute inset-0 pointer-events-none">
                  <FloatingFormulas density="low" />
                </div>
                
                {showGridMap ? (
                  <div className="w-full h-[600px] flex items-center justify-center">
                    <SymbolCanvas 
                      chakraColor={chakraState.color}
                      animated={true}
                      width={compassSize.width}
                      height={compassSize.height}
                      intensity={0.7}
                      geometryType="flower-of-life"
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="px-4 py-2 rounded-lg"
                        style={{ 
                          backgroundColor: `${chakraState.color}20`,
                          color: chakraState.color,
                          boxShadow: `0 0 20px ${chakraState.color}40`
                        }}
                      >
                        <div className="text-center mb-2">Intention: "{intention}"</div>
                        <div className="flex items-center justify-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-medium">Level {level}</div>
                            <div className="text-sm opacity-70">User</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-medium">{chakraState.frequency} Hz</div>
                            <div className="text-sm opacity-70">Frequency</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-medium">{sigils.length}</div>
                            <div className="text-sm opacity-70">Sigils</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <TimelineNavigator 
                    width={compassSize.width}
                    height={compassSize.height}
                    onSigilSelect={selectSigil}
                    onNodeSelect={selectTimelineNode}
                  />
                )}
              </div>
            </motion.div>
          
            {/* Conditional Panels */}
            {showEvolution && selectedSigil && (
              <SigilEvolutionPanel sigilId={selectedSigil.id} />
            )}
            
            {showLawsPanel && selectedSigil && (
              <UniversalLawsPanel sigilId={selectedSigil.id} />
            )}
          
            {/* Quantum Field Status */}
            <motion.div
              className="bg-dark-200 p-4 rounded-2xl border border-dark-300 shadow-chakra-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex flex-wrap gap-4">
                <div 
                  className="flex-1 p-3 rounded-lg"
                  style={{ 
                    backgroundColor: `${chakraState.color}15`,
                    border: `1px solid ${chakraState.color}30`
                  }}
                >
                  <div className="text-sm text-gray-400 mb-1">Quantum Frequency</div>
                  <div className="font-medium" style={{ color: chakraState.color }}>{chakraState.frequency} Hz</div>
                </div>
                
                <div 
                  className="flex-1 p-3 rounded-lg bg-dark-300"
                >
                  <div className="text-sm text-gray-400 mb-1">Sigil Count</div>
                  <div className="font-medium text-white">
                    {sigils.length}
                  </div>
                </div>
                
                <div 
                  className="flex-1 p-3 rounded-lg bg-dark-300"
                >
                  <div className="text-sm text-gray-400 mb-1">Field Resonance</div>
                  <div className="font-medium text-white">{resonanceLevel}%</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Floating animated glyphs for mystical effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AnimatedGlyph 
          type="vesica" 
          size={60} 
          color={`${chakraState.color}10`} 
          animation="breathe"
          className="absolute top-20 left-20"
        />
        <AnimatedGlyph 
          type="spiral" 
          size={80} 
          color={`${chakraState.color}08`} 
          animation="rotate"
          className="absolute bottom-32 right-32"
        />
      </div>
    </div>
  );
};

export default EchoCompassPage;