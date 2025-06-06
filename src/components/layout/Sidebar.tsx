import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Aperture, Calendar, Feather, Star, Users, BarChart2, Layout, Compass, Book, Wand2, Moon, BookOpen, Navigation } from 'lucide-react';
import { useChakra } from '../../context/ChakraContext';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { chakraState } = useChakra();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Tesla's 3-6-9 pattern for staggered animations
  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: i * 0.3, // 3 tenths
        duration: 0.6,  // 6 tenths
        ease: [0.3, 0, 0.6, 1] // Tesla curve - emphasis on 3 and 6
      }
    })
  };
  
  return (
    <div className="hidden md:flex flex-col w-64 bg-dark-200 border-r border-dark-300 overflow-y-auto">
      <div className="px-4 py-6">
        <div className="flex flex-col space-y-1">
          <div className="space-y-2 mb-6">
            <motion.div 
              className="p-4 rounded-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${chakraState.color}20, ${chakraState.color}05)`,
              }}
              animate={{ 
                boxShadow: [
                  `0 0 3px ${chakraState.color}40`,
                  `0 0 6px ${chakraState.color}40`,
                  `0 0 9px ${chakraState.color}40`,
                ]
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                repeatType: "reverse",
                times: [0, 0.33, 0.66, 1]
              }}
            >
              <div className="text-sm text-gray-400 mb-1">Active Chakra</div>
              <div 
                className="text-lg font-heading font-semibold"
                style={{ color: chakraState.color }}
              >
                {chakraState.type} Chakra
              </div>
              <motion.div 
                className="text-sm text-gray-300 flex items-center"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <span className="mr-1">{chakraState.frequency} Hz</span>
                <motion.span 
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: chakraState.color }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
            
            {/* Sacred Geometry Pattern Overlay */}
            <div className="relative mt-3 p-2 rounded-2xl bg-dark-300 opacity-60">
              <div className="text-xs text-center text-gray-400">Universal Patterns</div>
              <div className="trinity-circles-bg h-10 rounded opacity-50"></div>
            </div>
          </div>

          <motion.div 
            className="space-y-1"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <NavItem icon={<Home size={20} />} to="/dashboard" label="Dashboard" isActive={isActive('/dashboard')} index={0} />
            <NavItem icon={<Navigation size={20} />} to="/echo-compass" label="Echo Compass" isActive={isActive('/echo-compass')} index={1} />
            <NavItem icon={<Aperture size={20} />} to="/sigils" label="Soul Sigils" isActive={isActive('/sigils')} index={2} />
            <NavItem icon={<Layout size={20} />} to="/sigil-gallery" label="Sigil Gallery" isActive={isActive('/sigil-gallery')} index={3} />
            <NavItem icon={<Compass size={20} />} to="/sigil-evolution" label="Sigil Evolution" isActive={isActive('/sigil-evolution')} index={4} />
            <NavItem icon={<Layout size={20} />} to="/sigil-board" label="Sigil Board" isActive={isActive('/sigil-board')} index={5} />
            <NavItem icon={<Calendar size={20} />} to="/tasks" label="Sacred Tasks" isActive={isActive('/tasks')} index={6} />
            <NavItem icon={<Feather size={20} />} to="/fractal-mirror" label="Fractal Mirror" isActive={isActive('/fractal-mirror')} index={7} />
            <NavItem icon={<Star size={20} />} to="/digital-baptism" label="Digital Baptism" isActive={isActive('/digital-baptism')} index={8} />
            <NavItem icon={<Book size={20} />} to="/the-fool" label="The Fool" isActive={isActive('/the-fool')} index={9} />
            <NavItem icon={<Moon size={20} />} to="/the-high-priestess" label="High Priestess" isActive={isActive('/the-high-priestess')} index={10} />
            <NavItem icon={<BookOpen size={20} />} to="/journeys/hierophant" label="The Hierophant" isActive={isActive('/journeys/hierophant')} index={11} />
            <NavItem icon={<Wand2 size={20} />} to="/the-magician" label="The Magician" isActive={isActive('/the-magician')} index={12} />
            <NavItem icon={<Book size={20} />} to="/the-empress" label="The Empress" isActive={isActive('/the-empress')} index={13} />
            <NavItem icon={<Users size={20} />} to="/sacred-circle" label="Sacred Circle" isActive={location.pathname.startsWith('/sacred-circle')} index={14} />
            <NavItem icon={<BarChart2 size={20} />} to="/blueprint" label="Soul Blueprint" isActive={isActive('/blueprint')} index={15} />
            <NavItem icon={<Compass size={20} />} to="/grid-map" label="Grid Echo Map" isActive={isActive('/grid-map')} index={16} />
            <NavItem icon={<Wand2 size={20} />} to="/timeline-selector" label="Timeline Selector" isActive={isActive('/timeline-selector')} index={17} />

          </motion.div>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  to: string;
  label: string;
  isActive: boolean;
  index: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon, to, label, isActive, index }) => {
  const { chakraState } = useChakra();
  
  return (
    <motion.div
      custom={index}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({ 
          opacity: 1, 
          x: 0, 
          transition: { 
            delay: i * 0.3, 
            duration: 0.6 
          }
        })
      }}
      initial="hidden"
      animate="visible"
    >
      <Link
        to={to}
        className={`flex items-center px-2 py-2 rounded-2xl transition-colors ${
          isActive
            ? `bg-opacity-10 font-medium`
            : 'text-gray-400 hover:text-gray-200 hover:bg-dark-300'
        }`}
        style={{ 
          backgroundColor: isActive ? `${chakraState.color}15` : undefined,
          color: isActive ? chakraState.color : undefined,
          borderLeft: isActive ? `3px solid ${chakraState.color}` : '3px solid transparent'
        }}
      >
        <motion.div 
          className="mr-3 flex items-center justify-center"
          animate={isActive ? {
            scale: [1, 1.3, 1],
            rotate: [0, 0, 0], // Maintain alignment
          } : {}}
          transition={isActive ? {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            times: [0, 0.33, 0.66, 1] // Tesla's 369 pattern
          } : {}}
        >
          {icon}
        </motion.div>
        <span>{label}</span>
        
        {isActive && (
          <motion.div 
            className="ml-auto w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: chakraState.color }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        )}
      </Link>
    </motion.div>
  );
};

export default Sidebar;