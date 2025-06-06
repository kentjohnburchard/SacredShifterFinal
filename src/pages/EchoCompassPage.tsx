import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Text, Group, Image as KonvaImage, Line } from 'react-konva';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import { ChakraType, Sigil } from '../types';
import { motion } from 'framer-motion';
import { Compass, Zap, Eye, Calendar, Plus } from 'lucide-react';
import useImage from 'use-image';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';

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
}

const EchoCompassPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP } = useXP();
  
  const stageRef = useRef<any>(null);
  const [sigils, setSigils] = useState<Sigil[]>([]);
  const [sigilPositions, setSigilPositions] = useState<SigilPosition[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedSigil, setDraggedSigil] = useState<Sigil | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [compassSize, setCompassSize] = useState({ width: 800, height: 600 });
  const [intention, setIntention] = useState('Navigate Sacred Timelines');
  
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
        .limit(10);
        
      if (error) throw error;
      
      setSigils(data || []);
      
      // Initialize sigil positions in the nexus field
      if (data && data.length > 0) {
        const positions = data.map((sigil, index) => ({
          sigil,
          x: 100 + (index * 80) % (compassSize.width - 200),
          y: 100 + Math.floor(index / 8) * 100,
          scale: 0.8 + Math.random() * 0.4,
          opacity: 0.7 + Math.random() * 0.3,
          resonance: Math.random()
        }));
        setSigilPositions(positions);
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
    }
  };
  
  const handleSigilDrop = (sigil: Sigil, x: number, y: number) => {
    // Check if dropped on a timeline node
    const droppedNode = timelineNodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance < 70;
    });
    
    if (droppedNode) {
      setSelectedNode(droppedNode.id);
      activateChakra(droppedNode.chakra);
      
      // Award XP for timeline navigation
      addXP(15);
      
      // Update sigil position to align with the node
      setSigilPositions(prev =>
        prev.map(pos =>
          pos.sigil.id === sigil.id
            ? { ...pos, x: droppedNode.x, y: droppedNode.y, resonance: 1 }
            : pos
        )
      );
    } else {
      // Update sigil position in the nexus field
      setSigilPositions(prev =>
        prev.map(pos =>
          pos.sigil.id === sigil.id
            ? { ...pos, x, y }
            : pos
        )
      );
    }
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
    });
    
    return elements;
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
          Navigate your sacred timeline and witness your sigils in the quantum field
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
          
          {/* Sigil Count */}
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
              <span className="text-sm text-gray-400">{sigils.length} sigils</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Your sigils exist in the quantum field. Drag them to timeline nodes to activate their energy.
            </p>
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2" style={{ borderColor: chakraState.color }}></div>
              </div>
            )}
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
                      isSelected={draggedSigil?.id === position.sigil.id}
                    />
                  ))}
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
                    {timelineNodes.find(n => n.id === selectedNode)?.description}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
          
          {/* Action Bar */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Drag sigils to timeline nodes to activate their temporal resonance
            </div>
            <TattooButton
              chakraColor={chakraState.color}
              onClick={() => window.location.href = '/sigils'}
              size="sm"
              className="flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Create New Sigil
            </TattooButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for rendering individual sigils
interface SigilNodeProps {
  position: SigilPosition;
  onDrop: (sigil: Sigil, x: number, y: number) => void;
  isSelected: boolean;
}

const SigilNode: React.FC<SigilNodeProps> = ({ position, onDrop, isSelected }) => {
  const [image] = useImage(`data:image/svg+xml;base64,${btoa(position.sigil.parameters.svg)}`);
  
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
    >
      {image && (
        <KonvaImage
          image={image}
          width={40}
          height={40}
          offsetX={20}
          offsetY={20}
        />
      )}
      <Circle
        radius={25}
        stroke={position.sigil.parameters.chakra ? `var(--chakra-${position.sigil.parameters.chakra.toLowerCase()})` : '#666'}
        strokeWidth={1}
        opacity={0.5}
      />
    </Group>
  );
};

export default EchoCompassPage;