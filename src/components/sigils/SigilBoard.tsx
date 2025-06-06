import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image, Transformer, Text } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import { Sigil, SigilSticker } from '../../types';
import { useChakra } from '../../context/ChakraContext';

interface SigilBoardProps {
  sigils: Sigil[];
  stickers: SigilSticker[];
  onStickersChange: (stickers: SigilSticker[]) => void;
  width?: number;
  height?: number;
}

interface SigilImageProps {
  sigil: Sigil;
  sticker: SigilSticker;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: SigilSticker) => void;
}

const SigilImage: React.FC<SigilImageProps> = ({ 
  sigil, 
  sticker, 
  isSelected, 
  onSelect,
  onChange 
}) => {
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { chakraState } = useChakra();
  
  // Use the useImage hook from react-konva to load the SVG
  const [image] = useImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sigil.parameters.svg)}`);
  
  useEffect(() => {
    if (isSelected && shapeRef.current && trRef.current) {
      // Attach transformer
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      ...sticker,
      x: e.target.x(),
      y: e.target.y()
    });
  };
  
  const handleTransformEnd = () => {
    if (!shapeRef.current) return;
    
    // Get the new scale and rotation from the shape
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    
    // Update sticker with new properties
    onChange({
      ...sticker,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      scale: scaleX // Assuming uniform scaling
    });
    
    // Reset scale to 1 and apply it to the width/height
    node.scaleX(1);
    node.scaleY(1);
  };
  
  if (!image) {
    return null;
  }
  
  return (
    <>
      <Image
        ref={shapeRef}
        image={image}
        x={sticker.x}
        y={sticker.y}
        width={80}
        height={80}
        offsetX={40}
        offsetY={40}
        scaleX={sticker.scale}
        scaleY={sticker.scale}
        rotation={sticker.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        shadowColor={isSelected ? chakraState.color : undefined}
        shadowBlur={isSelected ? 10 : 0}
        shadowOpacity={0.6}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotateEnabled={true}
          borderStroke={chakraState.color}
          anchorStroke={chakraState.color}
          anchorFill={chakraState.color}
          anchorSize={8}
        />
      )}
    </>
  );
};

const SigilBoard: React.FC<SigilBoardProps> = ({
  sigils,
  stickers,
  onStickersChange,
  width = 800,
  height = 600
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { chakraState } = useChakra();
  const stageRef = useRef<Konva.Stage>(null);
  
  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Deselect when clicking on empty area
    const clickedOnStage = e.target === e.target.getStage();
    const clickedOnLayer = e.target.getType() === 'Layer';
    
    if (clickedOnStage || clickedOnLayer) {
      setSelectedId(null);
    }
  };
  
  const handleStickerChange = (updatedSticker: SigilSticker) => {
    const updatedStickers = stickers.map(sticker => 
      sticker.sigil_id === updatedSticker.sigil_id ? updatedSticker : sticker
    );
    onStickersChange(updatedStickers);
  };
  
  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}
      style={{ 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        backgroundImage: 'radial-gradient(circle at 10px 10px, #f0f0f0 2px, transparent 0)',
        backgroundSize: '20px 20px'
      }}
      ref={stageRef}
    >
      <Layer>
        {stickers.map((sticker) => {
          const sigil = sigils.find(s => s.id === sticker.sigil_id);
          if (!sigil) return null;
          
          return (
            <SigilImage
              key={sticker.sigil_id}
              sigil={sigil}
              sticker={sticker}
              isSelected={selectedId === sticker.sigil_id}
              onSelect={() => setSelectedId(sticker.sigil_id)}
              onChange={handleStickerChange}
            />
          );
        })}
        
        {stickers.length === 0 && (
          <Text
            text="Add sigils from the palette to create your board"
            x={width / 2 - 150}
            y={height / 2 - 10}
            width={300}
            align="center"
            fontSize={14}
            fill="#999"
          />
        )}
      </Layer>
    </Stage>
  );
};

export default SigilBoard;