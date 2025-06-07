import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Music
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

const OSDock: React.FC = () => {
  const location = useLocation();
  const { chakraState } = useChakra();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const isAnyActive = (paths: string[]) => {
    return paths.some(path => location.pathname.startsWith(path));
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
    <motion.div 
      className="os-dock fixed left-4 top-1/2 transform -translate-y-1/2 z-50"
      variants={dockVariants}
      initial="hidden"
      animate="visible"
    >
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
    </motion.div>
  );
};

export default OSDock;