import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Circle, Line, Text, Group, Image as KonvaImage } from 'react-konva';
import { motion } from 'framer-motion';
import { useCodex } from '../../context/CodexContext';
import { useChakra } from '../../context/ChakraContext';
import { Sigil, TimelineNode } from '../../types';
import useImage from 'use-image';

interface TimelineNavigatorProps {
  width?: number;
  height?: number;
  onSigilSelect?: (sigil: Sigil) => void;
  onNodeSelect?: (node: TimelineNode) => void;
}

const TimelineNavigator: React.FC<TimelineNavigatorProps> = ({
  width = 800,
  height = 600,
  onSigilSelect,
  onNodeSelect
}) => {
  const { 
    sigils, 
    timelineNodes, 
    selectedSigil,
    selectedNode,
    selectSigil,
    selectTimelineNode,
    alignToTimeline,
    getSigilTimelineAlignment,
    getResonanceScore,
    getEvolutionStage
  } = useCodex();
  const { chakraState } = useChakra();
  
  const [draggedSigil, setDraggedSigil] = useState<Sigil | null>(null);
  const [sigilPositions, setSigilPositions] = useState<Record<string, { x: number, y: number }>>({});
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  
  const stageRef = useRef<any>(null);
  
  // Initialize sigil positions in a spiral pattern
  useEffect(() => {
    const positions: Record<string, { x: number, y: number }> = {};
    
    sigils.forEach((sigil, index) => {
      // Check if sigil is already aligned to a timeline node
      const alignedNode = getSigilTimelineAlignment(sigil.id);
      
      if (alignedNode) {
        // Position at the aligned node
        positions[sigil.id] = { x: alignedNode.x, y: alignedNode.y };
      } else {
        // Position in a golden ratio spiral
        const phi = 1.618033988749895;
        const angle = index * phi * Math.PI;
        const radius = 50 + (index * 15);
        
        positions[sigil.id] = {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius
        };
      }
    });
    
    setSigilPositions(positions);
  }, [sigils, timelineNodes]);
  
  const handleDragStart = (sigil: Sigil) => {
    setDraggedSigil(sigil);
    selectSigil(sigil);
    if (onSigilSelect) onSigilSelect(sigil);
  };
  
  const handleDragEnd = async (sigil: Sigil, x: number, y: number) => {
    // Update position
    setSigilPositions({
      ...sigilPositions,
      [sigil.id]: { x, y }
    });
    
    // Check if dropped on a timeline node
    const droppedNode = timelineNodes.find(node => {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return dist < 70;
    });
    
    if (droppedNode) {
      // Align to timeline
      const success = await alignToTimeline(sigil.id, droppedNode.id);
      
      if (success) {
        // Update position to center of node
        setSigilPositions({
          ...sigilPositions,
          [sigil.id]: { x: droppedNode.x, y: droppedNode.y }
        });
        
        // Select the node
        selectTimelineNode(droppedNode);
        if (onNodeSelect) onNodeSelect(droppedNode);
        
        // Show confirmation
        setConfirmationMessage(`Sigil aligned to ${droppedNode.name}`);
        setTimeout(() => setConfirmationMessage(null), 3000);
      }
    }
    
    setDraggedSigil(null);
  };
  
  const handleNodeClick = (node: TimelineNode) => {
    selectTimelineNode(node);
    if (onNodeSelect) onNodeSelect(node);
  };
  
  return (
    <div className="relative rounded-2xl border border-dark-300 shadow-chakra-glow overflow-hidden" style={{ width, height }}>
      <Stage width={width} height={height} ref={stageRef}>
        <Layer>
          {/* Background sacred geometry */}
          {[...Array(5)].map((_, i) => (
            <Circle
              key={`bg-circle-${i}`}
              x={width / 2}
              y={height / 2}
              radius={100 + i * 50}
              stroke="#333"
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <Line
              key={`bg-line-${i}`}
              points={[
                width / 2, height / 2,
                width / 2 + Math.cos(i * Math.PI / 3) * 400,
                height / 2 + Math.sin(i * Math.PI / 3) * 400,
              ]}
              stroke="#333"
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}
          
          {/* Timeline Nodes */}
          {timelineNodes.map((node) => (
            <TimelineNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onClick={() => handleNodeClick(node)}
            />
          ))}
          
          {/* Sigils */}
          {sigils.map((sigil) => {
            const position = sigilPositions[sigil.id] || { x: width / 2, y: height / 2 };
            
            return (
              <SigilComponent
                key={sigil.id}
                sigil={sigil}
                x={position.x}
                y={position.y}
                isSelected={selectedSigil?.id === sigil.id}
                evolutionStage={getEvolutionStage(sigil.id)}
                resonanceScore={getResonanceScore(sigil.id)}
                onDragStart={() => handleDragStart(sigil)}
                onDragEnd={(x, y) => handleDragEnd(sigil, x, y)}
                onClick={() => {
                  selectSigil(sigil);
                  if (onSigilSelect) onSigilSelect(sigil);
                }}
              />
            );
          })}
          
          {/* User position indicator */}
          <Circle
            x={width / 2}
            y={height / 2}
            radius={15}
            fill={`${chakraState.color}80`}
            shadowColor={chakraState.color}
            shadowBlur={20}
            shadowOpacity={0.8}
          />
        </Layer>
      </Stage>
      
      {/* Confirmation message */}
      {confirmationMessage && (
        <motion.div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-dark-100 px-4 py-2 rounded-full text-white text-sm border border-dark-300 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {confirmationMessage}
        </motion.div>
      )}
    </div>
  );
};

interface TimelineNodeComponentProps {
  node: TimelineNode;
  isSelected: boolean;
  onClick: () => void;
}

const TimelineNodeComponent: React.FC<TimelineNodeComponentProps> = ({
  node,
  isSelected,
  onClick
}) => {
  return (
    <Group x={node.x} y={node.y} onClick={onClick}>
      <Circle
        radius={60}
        fill={`${node.color}33`}
        stroke={node.color}
        strokeWidth={isSelected ? 4 : 2}
        shadowBlur={20}
        shadowColor={node.color}
      />
      <Text
        text={node.name}
        fontSize={16}
        fill={node.color}
        offsetX={node.name.length * 4}
        y={-10}
      />
      <Text
        text={node.description}
        fontSize={12}
        fill="#ccc"
        offsetX={node.description.length * 3}
        y={10}
      />
    </Group>
  );
};

interface SigilComponentProps {
  sigil: Sigil;
  x: number;
  y: number;
  isSelected: boolean;
  evolutionStage: SigilEvolutionStage;
  resonanceScore: { overall: number };
  onDragStart: () => void;
  onDragEnd: (x: number, y: number) => void;
  onClick: () => void;
}

const SigilComponent: React.FC<SigilComponentProps> = ({
  sigil,
  x,
  y,
  isSelected,
  evolutionStage,
  resonanceScore,
  onDragStart,
  onDragEnd,
  onClick
}) => {
  const [image] = useImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sigil.parameters.svg)}`);
  
  // Get color based on chakra
  const getChakraColor = (): string => {
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
    
    return chakraColors[chakraType] || '#ffffff';
  };
  
  // Get size based on evolution stage
  const getSize = (): number => {
    switch(evolutionStage) {
      case 'seed': return 30;
      case 'sprout': return 35;
      case 'bloom': return 40;
      case 'mature': return 45;
      case 'transcendent': return 50;
      default: return 40;
    }
  };
  
  // Get glow intensity based on resonance
  const getGlowIntensity = (): number => {
    return 5 + (resonanceScore.overall / 10);
  };
  
  // Determine if the sigil has a Tesla number frequency (3, 6, 9)
  const hasTeslaFrequency = sigil.parameters.frequency.toString().includes('3') || 
                           sigil.parameters.frequency.toString().includes('6') || 
                           sigil.parameters.frequency.toString().includes('9');
  
  const size = getSize();
  const color = getChakraColor();
  
  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragStart={onDragStart}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onClick={onClick}
    >
      {/* Background glow */}
      <Circle
        radius={size * 1.2}
        fill={`${color}30`}
        shadowBlur={getGlowIntensity()}
        shadowColor={color}
        shadowOpacity={0.7}
      />
      
      {/* Sigil image */}
      {image && (
        <KonvaImage
          image={image}
          width={size * 2}
          height={size * 2}
          offsetX={size}
          offsetY={size}
        />
      )}
      
      {/* Energy field - pulsates more for Tesla numbers */}
      <Circle
        radius={size * 1.5}
        stroke={color}
        strokeWidth={isSelected ? 2 : 1}
        opacity={hasTeslaFrequency ? 0.7 : 0.4}
      />
      
      {/* Selection indicator */}
      {isSelected && (
        <Circle
          radius={size * 1.8}
          stroke={color}
          strokeWidth={1}
          dash={[5, 5]}
          opacity={0.8}
        />
      )}
    </Group>
  );
};

export default TimelineNavigator;