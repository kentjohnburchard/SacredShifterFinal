import React, { useEffect, useState, useContext } from 'react';
import { Stage, Layer, Circle, Line, Text } from 'react-konva';
import { motion } from 'framer-motion';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';

interface GridEchoMapProps {
  intention: string;
  width?: number;
  height?: number;
}

const chakraMap = {
  Root: 1,
  Sacral: 2,
  SolarPlexus: 3,
  Heart: 4,
  Throat: 5,
  ThirdEye: 6,
  Crown: 7,
};

const GridEchoMap: React.FC<GridEchoMapProps> = ({ intention, width = 800, height = 600 }) => {
  const { chakraState } = useChakra();
  const { level, xp } = useXP();
  const [userNodePosition, setUserNodePosition] = useState({ x: width / 2, y: height / 2 });

  useEffect(() => {
    const chakraValue = chakraMap[chakraState.type] || 4;
    const intentionLength = intention.length;

    const newX = (width / 2) + (chakraValue - 4) * 30 + (intentionLength % 5 - 2) * 10;
    const newY = (height / 2) + (level - 5) * 15 + (intentionLength % 7 - 3) * 8;

    setUserNodePosition({ x: newX, y: newY });

    const broadcastUserPosition = async () => {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user) return;

      console.log(`Broadcasting user position`, {
        x: newX,
        y: newY,
        chakra: chakraState.type,
        frequency: chakraState.frequency,
        xpLevel: level,
        timestamp: new Date().toISOString(),
      });

      // Supabase insert would go here if 'grid_echo_states' table exists
    };

    broadcastUserPosition();
  }, [chakraState.type, intention, level]);

  return (
    <div className="relative border border-dark-300 shadow-chakra-glow rounded-2xl overflow-hidden" style={{ width, height }}>
      <Stage width={width} height={height}>
        <Layer>
          {/* Background grid (flower of life style) */}
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

          {/* User node */}
          <Circle
            x={userNodePosition.x}
            y={userNodePosition.y}
            radius={20}
            fill={chakraState.color}
            shadowColor={chakraState.color}
            shadowBlur={20}
            shadowOpacity={0.7}
          />

          {/* Chakra info */}
          <Text
            x={userNodePosition.x + 25}
            y={userNodePosition.y - 10}
            text={`${chakraState.type} Chakra`}
            fontSize={14}
            fill={chakraState.color}
          />
          <Text
            x={userNodePosition.x + 25}
            y={userNodePosition.y + 10}
            text={`Level ${level} | ${xp} XP`}
            fontSize={12}
            fill="#ccc"
          />
        </Layer>
      </Stage>
      <div className="absolute bottom-4 left-4 text-xs text-gray-400">Intention: "{intention}"</div>
    </div>
  );
};

export default GridEchoMap;
