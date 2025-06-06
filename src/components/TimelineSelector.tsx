import React, { useState, useRef } from 'react';
import { Stage, Layer, Circle, Text, Group, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { useChakra } from '../context/ChakraContext';
import { ChakraType, Sigil } from '../types';

interface TimelineNode {
  id: string;
  node_name: string;
  chakra_alignment: ChakraType;
  intent_summary: string;
  x: number;
  y: number;
}

interface TimelineSelectorProps {
  userSigil: Sigil;
}

const TimelineSelector: React.FC<TimelineSelectorProps> = ({ userSigil }) => {
  const { chakraState } = useChakra();
  const stageRef = useRef<any>(null);
  const [draggedSigilPos, setDraggedSigilPos] = useState({ x: 50, y: 50 });
  const [isDraggingSigil, setIsDraggingSigil] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const timelineNodes: TimelineNode[] = [
    {
      id: 'past-echo',
      node_name: 'Past Echo',
      chakra_alignment: 'Root',
      intent_summary: 'Integrate lessons from the past.',
      x: 150,
      y: 300,
    },
    {
      id: 'present-flow',
      node_name: 'Present Flow',
      chakra_alignment: 'Heart',
      intent_summary: 'Embrace the current moment.',
      x: 400,
      y: 150,
    },
    {
      id: 'future-vision',
      node_name: 'Future Vision',
      chakra_alignment: 'Crown',
      intent_summary: 'Manifest the desired future.',
      x: 650,
      y: 300,
    },
  ];

  const [sigilImage] = useImage(`data:image/svg+xml;base64,${btoa(userSigil.parameters?.svg || '')}`);

  const handleDragEnd = (e: any) => {
    const x = e.target.x();
    const y = e.target.y();
    setIsDraggingSigil(false);

    const droppedOn = timelineNodes.find(node => {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return dist < 70;
    });

    if (droppedOn) {
      setSelectedNodeId(droppedOn.id);
      setConfirmationMessage(`Timeline "${droppedOn.node_name}" selected.`);
      setTimeout(() => setConfirmationMessage(null), 3000);
    } else {
      e.target.position({ x: 50, y: 50 });
      setSelectedNodeId(null);
    }
  };

  const chakraColor = (chakra: ChakraType) => {
    const map: Record<ChakraType, string> = {
      Root: '#E53935',
      Sacral: '#FB8C00',
      SolarPlexus: '#FDD835',
      Heart: '#66BB6A',
      Throat: '#42A5F5',
      ThirdEye: '#7E57C2',
      Crown: '#AB47BC',
    };
    return map[chakra] || '#999';
  };

  return (
    <div className="relative rounded-2xl border border-dark-300 shadow-chakra-glow" style={{ width: 800, height: 600 }}>
      <Stage width={800} height={600} ref={stageRef}>
        <Layer>
          {/* Background fractal rings */}
          {[...Array(4)].map((_, i) => (
            <Circle
              key={`bg-circle-${i}`}
              x={400}
              y={300}
              radius={100 + i * 80}
              stroke="#333"
              strokeWidth={0.5}
              opacity={0.2}
            />
          ))}

          {/* Timeline Nodes */}
          {timelineNodes.map((node) => (
            <Group key={node.id} x={node.x} y={node.y}>
              <Circle
                radius={60}
                fill={chakraColor(node.chakra_alignment) + '33'}
                stroke={chakraColor(node.chakra_alignment)}
                strokeWidth={selectedNodeId === node.id ? 4 : 2}
                shadowBlur={20}
                shadowColor={chakraColor(node.chakra_alignment)}
              />
              <Text
                text={node.node_name}
                fontSize={16}
                fill={chakraColor(node.chakra_alignment)}
                offsetX={node.node_name.length * 4}
                y={-10}
              />
              <Text
                text={node.intent_summary}
                fontSize={12}
                fill="#ccc"
                offsetX={node.intent_summary.length * 3}
                y={10}
              />
            </Group>
          ))}

          {/* Draggable Sigil */}
          {sigilImage && (
            <KonvaImage
              image={sigilImage}
              x={draggedSigilPos.x}
              y={draggedSigilPos.y}
              width={80}
              height={80}
              offsetX={40}
              offsetY={40}
              draggable
              onDragStart={() => setIsDraggingSigil(true)}
              onDragMove={(e) => setDraggedSigilPos({ x: e.target.x(), y: e.target.y() })}
              onDragEnd={handleDragEnd}
              opacity={isDraggingSigil ? 0.7 : 1}
            />
          )}
        </Layer>
      </Stage>

      {confirmationMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded text-white text-sm border border-gray-600 shadow-lg">
          {confirmationMessage}
        </div>
      )}
    </div>
  );
};

export default TimelineSelector;
