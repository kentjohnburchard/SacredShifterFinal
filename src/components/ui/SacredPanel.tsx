import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { X, Minimize, Maximize, GripVertical } from 'lucide-react';

interface SacredPanelProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'default' | 'floating' | 'ritual' | 'codex';
  isClosable?: boolean;
  isMinimizable?: boolean;
  isMaximizable?: boolean;
  isDraggable?: boolean;
  onClose?: () => void;
  initialPosition?: { x: number; y: number };
  glyphSymbol?: string;
}

const SacredPanel: React.FC<SacredPanelProps> = ({
  children,
  title,
  className = '',
  variant = 'default',
  isClosable = false,
  isMinimizable = false,
  isMaximizable = false,
  isDraggable = false,
  onClose,
  initialPosition,
  glyphSymbol
}) => {
  const { chakraState } = useChakra();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });
  
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'floating':
        return 'floating-window';
      case 'ritual':
        return 'ink-panel-glow';
      case 'codex':
        return 'glass-mystical';
      default:
        return 'ink-panel';
    }
  };
  
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'ritual':
        return {
          '--chakra-color': chakraState.color
        } as React.CSSProperties;
      case 'codex':
        return {
          borderColor: `${chakraState.color}40`
        };
      default:
        return {};
    }
  };
  
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };
  
  const panelContent = (
    <>
      {(title || isClosable || isMinimizable || isMaximizable) && (
        <div className="window-header">
          <div className="flex items-center">
            {glyphSymbol && (
              <span className="mr-2 font-mystical text-lg" style={{ color: chakraState.color }}>
                {glyphSymbol}
              </span>
            )}
            <h3 className="window-title">{title}</h3>
          </div>
          
          <div className="window-controls">
            {isMinimizable && (
              <button 
                className="window-control window-minimize"
                onClick={handleMinimize}
                aria-label="Minimize"
              />
            )}
            {isMaximizable && (
              <button 
                className="window-control window-maximize"
                onClick={handleMaximize}
                aria-label="Maximize"
              />
            )}
            {isClosable && (
              <button 
                className="window-control window-close"
                onClick={onClose}
                aria-label="Close"
              />
            )}
          </div>
        </div>
      )}
      
      <div className={`window-content ${isMinimized ? 'hidden' : ''}`}>
        {children}
      </div>
    </>
  );
  
  if (isDraggable) {
    return (
      <motion.div
        className={`${getVariantClasses()} ${className}`}
        style={{
          ...getVariantStyles(),
          position: 'absolute',
          zIndex: 10,
          width: isMaximized ? '100%' : 'auto',
          height: isMaximized ? '100%' : 'auto',
          top: isMaximized ? 0 : position.y,
          left: isMaximized ? 0 : position.x
        }}
        drag={!isMaximized}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          setPosition({
            x: position.x + info.offset.x,
            y: position.y + info.offset.y
          });
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {panelContent}
      </motion.div>
    );
  }
  
  return (
    <div 
      className={`${getVariantClasses()} ${className}`}
      style={getVariantStyles()}
    >
      {panelContent}
    </div>
  );
};

export default SacredPanel;