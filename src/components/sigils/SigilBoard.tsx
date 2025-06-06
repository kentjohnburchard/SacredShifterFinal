import React, { useState, useRef } from 'react';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import { Sigil, SigilSticker } from '../../types';

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

const SigilImage = React.forwardRef<Konva.Image, SigilImageProps>(({ 
  sigil, 
  sticker, 
  isSelected, 
  onSelect,
  onChange 
}, ref) => {
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [image] = useImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sigil.parameters.svg)}`);
  
  React.useEffect(() => {
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
      {image && <Image
        ref={(node) => {
          // Forward ref to parent component if needed
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          shapeRef.current = node;
        }}
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
      />}
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
        />
      )}
    </>
  );
});

const SigilBoard: React.FC<SigilBoardProps> = ({
  sigils,
  stickers,
  onStickersChange,
  width = 800,
  height = 600
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Deselect when clicking on empty area
    const clickedOnStage = e.target === e.target.getStage();
    const clickedOnLayer = e.target.getType() === 'Layer';
    const clickedOnEmpty = clickedOnStage || clickedOnLayer;
    
    if (clickedOnEmpty) {
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
      width={width || 800}
      height={height || 600}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}
      style={{ backgroundColor: '#f0f0f0', borderRadius: '8px' }}
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
      </Layer>
      {stickers.length === 0 && (
        <Layer>
          <Konva.Text
            x={width / 2 - 100}
            y={height / 2 - 10}
            text="Add sigils from the palette"
            fontSize={16}
            fill="#999"
            align="center"
            width={200}
          />
        </Layer>
      )}
    </Stage>
  );
};

export default SigilBoard;