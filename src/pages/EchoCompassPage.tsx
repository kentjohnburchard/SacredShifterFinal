import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Text, Group, Image as KonvaImage, Line } from 'react-konva';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import { ChakraType, Sigil } from '../types';
import { motion } from 'framer-motion';
import { Compass, Zap, Eye, Calendar, Plus, Info, Download, RefreshCw } from 'lucide-react';
import useImage from 'use-image';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';
import AnimatedGlyph from '../components/ui/AnimatedGlyph';
import FloatingFormulas from '../components/ui/FloatingFormulas';

interface TimelineNode {
  id: string;
  name: string;
  chakra: ChakraType;
  description: string;
  x: number;
  y: number;
  color: string;
}

interface SigilPosition {
  sigil: Sigil;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  resonance: number;
  timelineNodeId?: string;
}

interface SigilDetails {
  id: string;
  intention: string;
  chakra: ChakraType;
  frequency: number;
  createdAt: string;
  archetypeKey?: string;
}

const EchoCompassPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP, level } = useXP();
  
  const stageRef = useRef<any>(null);
  const [sigils, setSigils] = useState<Sigil[]>([]);
  const [sigilPositions, setSigilPositions] = useState<SigilPosition[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedSigil, setSelectedSigil] = useState<Sigil | null>(null);
  const [draggedSigil, setDraggedSigil] = useState<Sigil | null>(null);
  const [showSigilDetails, setShowSigilDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [compassSize, setCompassSize] = useState({ width: 800, height: 600 });
  const [intention, setIntention] = useState('Navigate Sacred Timelines');
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionHistory, setEvolutionHistory] = useState<Sigil[]>([]);
  
  // Timeline nodes with sacred geometry positioning
  const timelineNodes: TimelineNode[] = [
    {
      id: 'past-echo',
      name: 'Past Echo',
      chakra: 'Root',
      description: 'Integrate wisdom from your journey',
      x: 150,
      y: 300,
      color: 'var(--chakra-root)'
    },
    {
      id: 'present-flow',
      name: 'Present Flow',
      chakra: 'Heart',
      description: 'Embody your current truth',
      x: 400,
      y: 150,
      color: 'var(--chakra-heart)'
    },
    {
      id: 'future-vision',
      name: 'Future Vision',
      chakra: 'Crown',
      description: 'Manifest your highest potential',
      x: 650,
      y: 300,
      color: 'var(--chakra-crown)'
    }
  ];
  
  useEffect(() => {
    if (user) {
      fetchUserSigils();
    }
  }, [user]);
  
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
  
  const fetchUserSigils = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('fractal_glyphs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      setSigils(data || []);
      
      // Initialize sigil positions in the nexus field
      if (data && data.length > 0) {
        const positions = data.map((sigil, index) => {
          // Create a golden ratio-based spiral placement
          const phi = 1.618033988749895;
          const angle = index * phi * Math.PI;
          const radius = 50 + (index * 10);
          
          return {
            sigil,
            x: 400 + Math.cos(angle) * radius,
            y: 300 + Math.sin(angle) * radius,
            scale: 0.8 + Math.random() * 0.4,
            opacity: 0.7 + Math.random() * 0.3,
            resonance: Math.random()
          };
        });
        setSigilPositions(positions);
        
        if (selectedSigil === null) {
          setSelectedSigil(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching sigils:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNodeSelection = (nodeId: string) => {
    const node = timelineNodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(nodeId);
      activateChakra(node.chakra);
      
      // Find sigils associated with this node and highlight them
      const relatedSigils = sigilPositions
        .filter(pos => pos.timelineNodeId === nodeId)
        .map(pos => pos.sigil);
      
      if (relatedSigils.length > 0) {
        setSelectedSigil(relatedSigils[0]);
      }
      
      // Add a visual pulse to all sigils in this timeline node
      setSigilPositions(prev => 
        prev.map(pos => ({
          ...pos,
          scale: pos.timelineNodeId === nodeId ? 1.2 : pos.scale,
          opacity: pos.timelineNodeId === nodeId ? 1 : pos.opacity
        }))
      );
      
      // Gradually return to normal size
      setTimeout(() => {
        setSigilPositions(prev => 
          prev.map(pos => ({
            ...pos,
            scale: pos.timelineNodeId === nodeId ? 1.1 : pos.scale,
            opacity: pos.timelineNodeId === nodeId ? 0.9 : pos.opacity
          }))
        );
      }, 300);
    }
  };
  
  const handleSigilDrop = async (sigil: Sigil, x: number, y: number) => {
    // Check if dropped on a timeline node
    const droppedNode = timelineNodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance < 70;
    });
    
    if (droppedNode) {
      setSelectedNode(droppedNode.id);
      activateChakra(droppedNode.chakra);
      
      // Award XP for timeline navigation
      await addXP(15);
      
      // Log to continuum_sessions
      try {
        await supabase.from('continuum_sessions').insert([{
          user_id: user!.id,
          session_type: 'sigil_alignment',
          xp_awarded: 15,
          chakra: droppedNode.chakra,
          frequency: getChakraFrequency(droppedNode.chakra),
          timestamp: new Date().toISOString()
        }]);
      } catch (error) {
        console.error('Error logging session:', error);
      }
      
      // Update sigil position to align with the node
      setSigilPositions(prev =>
        prev.map(pos =>
          pos.sigil.id === sigil.id
            ? { 
                ...pos, 
                x: droppedNode.x, 
                y: droppedNode.y, 
                resonance: 1,
                timelineNodeId: droppedNode.id 
              }
            : pos
        )
      );
      
      setSelectedSigil(sigil);
    } else {
      // Update sigil position in the nexus field
      setSigilPositions(prev =>
        prev.map(pos =>
          pos.sigil.id === sigil.id
            ? { ...pos, x, y, timelineNodeId: undefined }
            : pos
        )
      );
    }
  };
  
  const handleSigilClick = (sigil: Sigil) => {
    setSelectedSigil(sigil);
    
    // Pulse the sigil to show it's selected
    setSigilPositions(prev => 
      prev.map(pos => ({
        ...pos,
        scale: pos.sigil.id === sigil.id ? 1.3 : pos.scale,
        opacity: pos.sigil.id === sigil.id ? 1 : pos.opacity
      }))
    );
    
    // Gradually return to normal size
    setTimeout(() => {
      setSigilPositions(prev => 
        prev.map(pos => ({
          ...pos,
          scale: pos.sigil.id === sigil.id ? 1.1 : pos.scale,
          opacity: pos.sigil.id === sigil.id ? 0.9 : pos.opacity
        }))
      );
    }, 300);
  };
  
  const fetchEvolutionHistory = async () => {
    if (!selectedSigil) return;
    
    try {
      // In a real implementation, you would fetch the evolution history
      // Here we'll simulate it with a subset of sigils
      const evolutionData = sigils
        .filter(s => 
          s.parameters.chakra === selectedSigil.parameters.chakra || 
          s.parameters.intention.includes(selectedSigil.parameters.intention.substring(0, 5))
        )
        .slice(0, 5);
      
      setEvolutionHistory(evolutionData);
      setShowEvolution(true);
    } catch (error) {
      console.error('Error fetching sigil evolution:', error);
    }
  };
  
  const downloadSigil = () => {
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
  
  const refreshSigilPositions = () => {
    // Redistribute sigils in a more harmonious pattern
    const newPositions = sigilPositions.map((pos, index) => {
      // Create a golden ratio-based spiral placement
      const phi = 1.618033988749895;
      const angle = index * phi * Math.PI;
      const radius = 50 + (index * 15);
      
      return {
        ...pos,
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
      };
    });
    
    setSigilPositions(newPositions);
  };
  
  const renderBackground = () => {
    const elements = [];
    
    // Sacred geometry grid
    for (let i = 0; i < 6; i++) {
      elements.push(
        <Circle
          key={`bg-circle-${i}`}
          x={compassSize.width / 2}
          y={compassSize.height / 2}
          radius={50 + i * 60}
          stroke="#333"
          strokeWidth={0.3}
          opacity={0.2}
        />
      );
    }
    
    // Connecting lines between timeline nodes
    timelineNodes.forEach((node, index) => {
      const nextNode = timelineNodes[(index + 1) % timelineNodes.length];
      elements.push(
        <Line
          key={`connection-${index}`}
          points={[node.x, node.y, nextNode.x, nextNode.y]}
          stroke={chakraState.color}
          strokeWidth={1}
          opacity={0.3}
          dash={[5, 5]}
        />
      );
      
      // Add a line from center to each node
      elements.push(
        <Line
          key={`center-to-${index}`}
          points={[compassSize.width / 2, compassSize.height / 2, node.x, node.y]}
          stroke={chakraState.color}
          strokeWidth={0.5}
          opacity={0.15}
        />
      );
    });
    
    return elements;
  };
  
  // Helper function to get chakra frequency
  const getChakraFrequency = (chakra: ChakraType): number => {
    const frequencies: Record<ChakraType, number> = {
      Root: 396,
      Sacral: 417,
      SolarPlexus: 528,
      Heart: 639,
      Throat: 741,
      ThirdEye: 852,
      Crown: 963
    };
    
    return frequencies[chakra];
  };
  
  // Format sigil creation date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          
          {/* Timeline Nodes Info */}
          <motion.div
            className="bg-dark-200 p-4 rounded-2xl border border-dark-300 shadow-chakra-glow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center mb-3">
              <Calendar size={20} className="mr-2" style={{ color: chakraState.color }} />
              <h3 className="text-lg font-medium text-white">Timeline Nodes</h3>
            </div>
            <div className="space-y-3">
              {timelineNodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedNode === node.id
                      ? 'bg-dark-100 ring-1'
                      : 'bg-dark-300 hover:bg-dark-100'
                  }`}
                  style={{
                    ringColor: selectedNode === node.id ? node.color : undefined
                  }}
                  onClick={() => handleNodeSelection(node.id)}
                >
                  <div className="flex items-center mb-1">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: node.color }}
                    />
                    <span className="font-medium text-white text-sm">{node.name}</span>
                  </div>
                  <p className="text-xs text-gray-400">{node.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
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
                <button 
                  className="p-1.5 rounded-lg mr-2 hover:bg-dark-100 text-gray-400 hover:text-gray-200"
                  onClick={refreshSigilPositions}
                  title="Realign Sigils"
                >
                  <RefreshCw size={18} />
                </button>
                <span className="text-sm text-gray-400">{sigils.length} sigils</span>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2" style={{ borderColor: chakraState.color }}></div>
              </div>
            ) : selectedSigil ? (
              <div>
                <div className="p-3 rounded-lg bg-dark-300 mb-3">
                  <div className="font-medium text-white mb-1 line-clamp-1" title={selectedSigil.parameters.intention}>
                    {selectedSigil.parameters.intention}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <div>{selectedSigil.parameters.chakra} Chakra</div>
                    <div>{selectedSigil.parameters.frequency} Hz</div>
                  </div>
                </div>
                
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
                      onClick={downloadSigil}
                      className="flex-1 py-1.5 px-3 text-sm flex items-center justify-center rounded-md bg-dark-300 text-gray-300 hover:bg-dark-400"
                      title="Download Sigil"
                    >
                      <Download size={14} className="mr-1" />
                      Download
                    </button>
                    
                    <button
                      onClick={fetchEvolutionHistory}
                      className="flex-1 py-1.5 px-3 text-sm flex items-center justify-center rounded-md bg-dark-300 text-gray-300 hover:bg-dark-400"
                    >
                      <Zap size={14} className="mr-1" />
                      Evolution
                    </button>
                  </div>
                </div>
                
                {showSigilDetails && (
                  <div className="mt-3 p-3 rounded-lg bg-dark-300 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-gray-200">{formatDate(selectedSigil.created_at)}</span>
                    </div>
                    
                    {selectedSigil.parameters.archetypeKey && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Archetype:</span>
                        <span className="text-gray-200">{selectedSigil.parameters.archetypeKey}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Life Path:</span>
                      <span className="text-gray-200">{selectedSigil.parameters.numerology_profile?.lifePath || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timeline:</span>
                      <span className="text-gray-200">
                        {sigilPositions.find(p => p.sigil.id === selectedSigil.id)?.timelineNodeId
                          ? timelineNodes.find(n => n.id === sigilPositions.find(p => p.sigil.id === selectedSigil.id)?.timelineNodeId)?.name
                          : 'Unaligned'
                        }
                      </span>
                    </div>
                  </div>
                )}
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
          <motion.div
            className="bg-dark-200 rounded-2xl border border-dark-300 shadow-chakra-glow overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-4 border-b border-dark-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Sacred Timeline Navigation</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Active Chakra:</span>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: chakraState.color }}
                  />
                  <span className="text-sm" style={{ color: chakraState.color }}>
                    {chakraState.type}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Mystical mathematical background */}
              <div className="absolute inset-0 pointer-events-none">
                <FloatingFormulas density="low" />
              </div>
              
              <Stage 
                width={compassSize.width} 
                height={compassSize.height}
                ref={stageRef}
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <Layer>
                  {/* Background sacred geometry */}
                  {renderBackground()}
                  
                  {/* Timeline Nodes */}
                  {timelineNodes.map((node) => (
                    <Group key={node.id} x={node.x} y={node.y}>
                      <Circle
                        radius={60}
                        fill={`${node.color}20`}
                        stroke={node.color}
                        strokeWidth={selectedNode === node.id ? 3 : 2}
                        shadowBlur={20}
                        shadowColor={node.color}
                        opacity={selectedNode === node.id ? 1 : 0.8}
                        onClick={() => handleNodeSelection(node.id)}
                      />
                      <Text
                        text={node.name}
                        fontSize={14}
                        fill={node.color}
                        fontFamily="Cardo"
                        align="center"
                        offsetX={node.name.length * 3.5}
                        y={-7}
                      />
                    </Group>
                  ))}
                  
                  {/* Sigils in the Nexus */}
                  {sigilPositions.map((position) => (
                    <SigilNode
                      key={position.sigil.id}
                      position={position}
                      onDrop={handleSigilDrop}
                      onClick={() => handleSigilClick(position.sigil)}
                      isSelected={selectedSigil?.id === position.sigil.id}
                    />
                  ))}
                  
                  {/* User Node - Shows the user's position in the quantum field */}
                  <Circle
                    x={compassSize.width / 2}
                    y={compassSize.height / 2}
                    radius={15}
                    fill={`${chakraState.color}80`}
                    shadowColor={chakraState.color}
                    shadowBlur={20}
                    shadowOpacity={0.8}
                  />
                </Layer>
              </Stage>
              
              {/* Overlay Information */}
              {selectedNode && (
                <motion.div
                  className="absolute top-4 right-4 bg-dark-100 p-3 rounded-lg border border-dark-300 max-w-xs"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-sm">
                    <span className="font-medium" style={{ color: timelineNodes.find(n => n.id === selectedNode)?.color }}>
                      {timelineNodes.find(n => n.id === selectedNode)?.name}:
                    </span>{' '}
                    {timelineNodes.find(n => n.id === selectedNode)?.description}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
          
          {/* Evolution Panel (conditionally rendered) */}
          {showEvolution && selectedSigil && (
            <motion.div
              className="mt-4 bg-dark-200 p-4 rounded-2xl border border-dark-300 shadow-chakra-glow"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-white">Sigil Evolution Path</h3>
                <button 
                  onClick={() => setShowEvolution(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex overflow-x-auto space-x-4 p-2">
                {evolutionHistory.length > 0 ? (
                  evolutionHistory.map((sigil, index) => (
                    <div 
                      key={sigil.id} 
                      className="flex-shrink-0 w-24 h-32 flex flex-col items-center"
                      onClick={() => setSelectedSigil(sigil)}
                    >
                      <div 
                        className={`w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer transition-all ${
                          selectedSigil.id === sigil.id ? 'ring-2' : ''
                        }`}
                        style={{ 
                          backgroundColor: `${chakraState.color}20`,
                          ringColor: chakraState.color 
                        }}
                        dangerouslySetInnerHTML={{ __html: sigil.parameters.svg }}
                      />
                      <div className="text-xs text-center mt-1">
                        <div className="text-gray-300 truncate w-20">{formatDate(sigil.created_at)}</div>
                        <div className="text-gray-500 text-xs">Stage {index + 1}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center py-2 text-gray-400">
                    No evolution history available
                  </div>
                )}
              </div>
            </motion.div>
          )}
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

// Component for rendering individual sigils
interface SigilNodeProps {
  position: SigilPosition;
  onDrop: (sigil: Sigil, x: number, y: number) => void;
  onClick: () => void;
  isSelected: boolean;
}

const SigilNode: React.FC<SigilNodeProps> = ({ position, onDrop, onClick, isSelected }) => {
  const [image] = useImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(position.sigil.parameters.svg)}`);
  const { chakraState } = useChakra();
  
  // Determine if the sigil has a Tesla number frequency (3, 6, 9)
  const hasTeslaFrequency = position.sigil.parameters.frequency.toString().includes('3') || 
                           position.sigil.parameters.frequency.toString().includes('6') || 
                           position.sigil.parameters.frequency.toString().includes('9');
  
  // Get sigil chakra color
  const getSigilColor = (): string => {
    const chakraType = position.sigil.parameters.chakra;
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
  
  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragEnd={(e) => {
        onDrop(position.sigil, e.target.x(), e.target.y());
      }}
      opacity={position.opacity}
      scaleX={position.scale}
      scaleY={position.scale}
      onClick={onClick}
    >
      {/* Background glow */}
      <Circle
        radius={20}
        fill={`${getSigilColor()}30`}
        shadowBlur={isSelected ? 15 : 5}
        shadowColor={getSigilColor()}
        shadowOpacity={isSelected ? 0.8 : 0.3}
      />
      
      {/* Sigil image */}
      {image && (
        <KonvaImage
          image={image}
          width={40}
          height={40}
          offsetX={20}
          offsetY={20}
        />
      )}
      
      {/* Energy field - pulsates more for Tesla numbers */}
      <Circle
        radius={25 * (hasTeslaFrequency ? 1.2 : 1)}
        stroke={position.sigil.parameters.chakra ? getSigilColor() : '#666'}
        strokeWidth={isSelected ? 2 : 1}
        opacity={hasTeslaFrequency ? 0.7 : 0.4}
      />
      
      {/* Timeline connection line if assigned to a node */}
      {position.timelineNodeId && (
        <Circle
          radius={5}
          fill={getSigilColor()}
          opacity={0.5}
        />
      )}
    </Group>
  );
};

export default EchoCompassPage;