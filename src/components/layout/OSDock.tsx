import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useDragControls, useMotionValue, useTransform } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';
import { 
  Home, 
  Compass, 
  Aperture, 
  BookOpen, 
  Calendar, 
  Users, 
  Feather, 
  Star, 
  Moon, 
  Wand2, 
  Book, 
  Layout, 
  Music,
  Minimize,
  Maximize,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DockItemProps {
  icon: React.ReactNode;
  to: string;
  label: string;
  isActive: boolean;
  chakraColor: string;
}

const DockItem: React.FC<DockItemProps> = ({ icon, to, label, isActive, chakraColor }) => {
  return (
    <Link to={to} className="group relative">
      <motion.div
        className={`os-dock-item ${isActive ? 'active' : ''}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          '--chakra-color': isActive ? chakraColor : 'transparent'
        } as React.CSSProperties}
      >
        {icon}
        
        {/* Glow effect for active item */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{ 
              boxShadow: [
                `0 0 3px ${chakraColor}40`,
                `0 0 6px ${chakraColor}40`,
                `0 0 9px ${chakraColor}40`
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{ opacity: 0.6 }}
          />
        )}
      </motion.div>
      
      {/* Tooltip */}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-ink-shadow rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {label}
      </div>
    </Link>
  );
};

// Define chakra anchor points
interface AnchorPoint {
  id: string;
  name: string;
  chakra: string;
  x: number;
  y: number;
  color: string;
}

const OSDock: React.FC = () => {
  const location = useLocation();
  const { chakraState } = useChakra();
  const dragControls = useDragControls();
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight / 2 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [nearestAnchor, setNearestAnchor] = useState<AnchorPoint | null>(null);
  const [showAnchorPoints, setShowAnchorPoints] = useState(false);
  const [trailElements, setTrailElements] = useState<JSX.Element[]>([]);
  
  // Create anchor points based on window size and chakras
  const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
  
  useEffect(() => {
    // Create anchor points based on window dimensions
    const createAnchorPoints = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const points: AnchorPoint[] = [
        // Corners
        { id: 'top-left', name: 'Root Corner', chakra: 'Root', x: 20, y: 20, color: 'var(--chakra-root)' },
        { id: 'top-right', name: 'Crown Corner', chakra: 'Crown', x: windowWidth - 80, y: 20, color: 'var(--chakra-crown)' },
        { id: 'bottom-left', name: 'Sacral Corner', chakra: 'Sacral', x: 20, y: windowHeight - 20, color: 'var(--chakra-sacral)' },
        { id: 'bottom-right', name: 'Third Eye Corner', chakra: 'ThirdEye', x: windowWidth - 80, y: windowHeight - 20, color: 'var(--chakra-thirdeye)' },
        
        // Centers
        { id: 'left-center', name: 'Throat Center', chakra: 'Throat', x: 20, y: windowHeight / 2, color: 'var(--chakra-throat)' },
        { id: 'right-center', name: 'Solar Plexus Center', chakra: 'SolarPlexus', x: windowWidth - 80, y: windowHeight / 2, color: 'var(--chakra-solarplexus)' },
        { id: 'top-center', name: 'Heart Center', chakra: 'Heart', x: windowWidth / 2 - 30, y: 20, color: 'var(--chakra-heart)' },
        { id: 'bottom-center', name: 'Heart Center', chakra: 'Heart', x: windowWidth / 2 - 30, y: windowHeight - 20, color: 'var(--chakra-heart)' },
      ];
      
      setAnchorPoints(points);
    };
    
    createAnchorPoints();
    
    // Update anchor points when window is resized
    window.addEventListener('resize', createAnchorPoints);
    return () => window.removeEventListener('resize', createAnchorPoints);
  }, []);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const isAnyActive = (paths: string[]) => {
    return paths.some(path => location.pathname.startsWith(path));
  };
  
  // Find nearest anchor point
  const findNearestAnchor = (x: number, y: number): AnchorPoint | null => {
    const SNAP_THRESHOLD = 50; // Distance in pixels to snap
    
    let nearest: AnchorPoint | null = null;
    let minDistance = SNAP_THRESHOLD;
    
    anchorPoints.forEach(anchor => {
      const distance = Math.sqrt(
        Math.pow(anchor.x - x, 2) + 
        Math.pow(anchor.y - y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = anchor;
      }
    });
    
    return nearest;
  };
  
  // Add trail effect during drag
  const addTrailElement = (x: number, y: number) => {
    const newElement = (
      <motion.div
        key={Date.now()}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: x,
          top: y,
          width: 8,
          height: 8,
          backgroundColor: chakraState.color,
          opacity: 0.7,
        }}
        initial={{ scale: 1, opacity: 0.7 }}
        animate={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.9 }}
        onAnimationComplete={() => {
          setTrailElements(prev => prev.filter(el => el.key !== Date.now().toString()));
        }}
      />
    );
    
    setTrailElements(prev => [...prev, newElement]);
  };
  
  // Tesla's 3-6-9 pattern for staggered animations
  const dockVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.9,  // 9 tenths
        staggerChildren: 0.3, // 3 tenths
        ease: [0.3, 0, 0.6, 1] // Tesla curve - emphasis on 3 and 6
      }
    },
    collapsed: {
      width: 'auto',
      height: 'auto',
      transition: { duration: 0.3 }
    },
    expanded: {
      width: 'auto',
      height: 'auto',
      transition: { duration: 0.3 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.6,  // 6 tenths
        ease: [0.3, 0, 0.6, 1] // Tesla curve
      }
    }
  };
  
  return (
    <>
      {/* Drag trail elements */}
      {trailElements.map(element => element)}
      
      {/* Anchor points visualization */}
      {showAnchorPoints && anchorPoints.map(anchor => (
        <motion.div
          key={anchor.id}
          className="fixed rounded-full pointer-events-none z-40"
          style={{
            left: anchor.x,
            top: anchor.y,
            width: 16,
            height: 16,
            backgroundColor: anchor.color,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
      
      {/* Nearest anchor point highlight */}
      {nearestAnchor && isSnapping && (
        <motion.div
          className="fixed rounded-full pointer-events-none z-40"
          style={{
            left: nearestAnchor.x,
            top: nearestAnchor.y,
            width: 40,
            height: 40,
            border: `2px solid ${nearestAnchor.color}`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          exit={{ scale: 1.2, opacity: 0 }}
        />
      )}
      
      <motion.div 
        className={`os-dock fixed z-50 ${isCollapsed ? 'collapsed' : ''}`}
        style={{ 
          left: position.x,
          top: position.y,
          transform: 'translateY(-50%)'
        }}
        drag
        dragControls={dragControls}
        dragMomentum={false}
        onDragStart={() => {
          setIsSnapping(true);
          setShowAnchorPoints(true);
        }}
        onDrag={(event, info) => {
          // Add trail effect
          if (Math.random() > 0.7) { // Only add trail elements occasionally
            addTrailElement(info.point.x, info.point.y);
          }
          
          // Find nearest anchor point
          const nearest = findNearestAnchor(info.point.x, info.point.y);
          setNearestAnchor(nearest);
        }}
        onDragEnd={(event, info) => {
          // Check if near an anchor point
          const nearest = findNearestAnchor(info.point.x, info.point.y);
          
          if (nearest) {
            // Snap to anchor point
            setPosition({
              x: nearest.x,
              y: nearest.y
            });
          } else {
            // Update position after drag ends
            setPosition({
              x: position.x + info.offset.x,
              y: position.y + info.offset.y
            });
          }
          
          setIsSnapping(false);
          setShowAnchorPoints(false);
          setNearestAnchor(null);
        }}
        whileDrag={{ 
          scale: 1.02, 
          boxShadow: `0 0 20px ${chakraState.color}40`,
          transition: { duration: 0.2 }
        }}
        variants={dockVariants}
        initial="hidden"
        animate={isCollapsed ? "collapsed" : "visible"}
      >
        {/* Dock header with controls */}
        <div className="flex items-center justify-between w-full px-1 mb-1">
          {/* Drag handle */}
          <motion.div 
            className="w-6 h-3 flex items-center justify-center cursor-move"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-4 h-1 bg-ink-accent rounded-full opacity-60 hover:opacity-100" />
          </motion.div>
          
          {/* Dock controls */}
          <div className="flex space-x-1">
            <motion.button
              className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
              onClick={() => setShowAnchorPoints(!showAnchorPoints)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={showAnchorPoints ? "Hide anchor points" : "Show anchor points"}
            >
              <Compass size={10} />
            </motion.button>
            
            <motion.button
              className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
              onClick={() => setIsCollapsed(!isCollapsed)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={isCollapsed ? "Expand dock" : "Collapse dock"}
            >
              {isCollapsed ? <Maximize size={10} /> : <Minimize size={10} />}
            </motion.button>
          </div>
        </div>
        
        {/* Dock orientation controls */}
        <div className="flex justify-center mb-1">
          <motion.div 
            className="flex bg-ink-shadow rounded-full p-0.5"
            animate={{
              boxShadow: [
                `0 0 3px ${chakraState.color}20`,
                `0 0 6px ${chakraState.color}30`,
                `0 0 3px ${chakraState.color}20`
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <motion.button
              className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Move left"
              onClick={() => {
                setPosition({
                  x: Math.max(20, position.x - 50),
                  y: position.y
                });
              }}
            >
              <ChevronLeft size={10} />
            </motion.button>
            
            <motion.button
              className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Move right"
              onClick={() => {
                setPosition({
                  x: Math.min(window.innerWidth - 80, position.x + 50),
                  y: position.y
                });
              }}
            >
              <ChevronRight size={10} />
            </motion.button>
          </motion.div>
        </div>
        
        {!isCollapsed && (
          <>
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<Home size={20} />} 
                to="/dashboard" 
                label="Dashboard" 
                isActive={isActive('/dashboard')} 
                chakraColor={chakraState.color}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<Compass size={20} />} 
                to="/echo-compass" 
                label="Echo Compass" 
                isActive={isAnyActive(['/echo-compass', '/grid-map', '/timeline-selector'])} 
                chakraColor={chakraState.color}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<Aperture size={20} />} 
                to="/sigils" 
                label="Soul Sigils" 
                isActive={isAnyActive(['/sigils', '/sigil-gallery', '/sigil-board', '/sigil-evolution'])} 
                chakraColor={chakraState.color}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<Calendar size={20} />} 
                to="/tasks" 
                label="Sacred Tasks" 
                isActive={isActive('/tasks')} 
                chakraColor={chakraState.color}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<Feather size={20} />} 
                to="/fractal-mirror" 
                label="Fractal Mirror" 
                isActive={isActive('/fractal-mirror')} 
                chakraColor={chakraState.color}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<Users size={20} />} 
                to="/sacred-circle" 
                label="Sacred Circle" 
                isActive={location.pathname.startsWith('/sacred-circle')} 
                chakraColor={chakraState.color}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<BookOpen size={20} />} 
                to="/sacred-library" 
                label="Sacred Library" 
                isActive={location.pathname.startsWith('/sacred-library')} 
                chakraColor={chakraState.color}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<Music size={20} />} 
                to="/sacred-library/playlists" 
                label="Sacred Playlists" 
                isActive={location.pathname.startsWith('/sacred-library/playlists')} 
                chakraColor={chakraState.color}
              />
            </motion.div>
            
            {/* Divider */}
            <div className="my-2 w-full h-px bg-ink-accent"></div>
            
            {/* Tarot Journey Icons */}
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<Star size={20} />} 
                to="/the-fool" 
                label="The Fool" 
                isActive={isActive('/the-fool')} 
                chakraColor={chakraState.color}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<Moon size={20} />} 
                to="/the-high-priestess" 
                label="High Priestess" 
                isActive={isActive('/the-high-priestess')} 
                chakraColor={chakraState.color}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<Book size={20} />} 
                to="/journeys/hierophant" 
                label="The Hierophant" 
                isActive={isActive('/journeys/hierophant')} 
                chakraColor={chakraState.color}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <DockItem 
                icon={<Wand2 size={20} />} 
                to="/the-magician" 
                label="The Magician" 
                isActive={isActive('/the-magician')} 
                chakraColor={chakraState.color}
              />
            </motion.div>
          </>
        )}
        
        {/* Collapsed state shows only active icon */}
        {isCollapsed && (
          <motion.div 
            className="p-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  `0 0 3px ${chakraState.color}40`,
                  `0 0 6px ${chakraState.color}60`,
                  `0 0 9px ${chakraState.color}40`
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={{ backgroundColor: `${chakraState.color}30` }}
            >
              <Compass size={16} style={{ color: chakraState.color }} />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default OSDock;