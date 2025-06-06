import React, { useState, useRef } from 'react';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import Konva from 'konva';
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

const SigilImage: React.FC<SigilImageProps> = ({ 
  sigil, 
  sticker, 
  isSelected, 
  onSelect,
  onChange 
}) => {
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  React.useEffect(() => {
    if (isSelected && shapeRef.current && trRef.current) {
      // Attach transformer
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  
  React.useEffect(() => {
    // Convert SVG to Image
    const svgString = sigil.parameters.svg;
    const svg = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svg);
    
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
    };
    img.src = url;
    
    // Cleanup
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [sigil]);
  
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
  
  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Deselect when clicking on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
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
      width={width}
      height={height}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}
      style={{ backgroundColor: '#f9f9f9', borderRadius: '8px' }}
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
    </Stage>
  );
};

export default SigilBoard;