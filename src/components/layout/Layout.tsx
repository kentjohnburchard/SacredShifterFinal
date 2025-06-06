import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useChakra } from '../../context/ChakraContext';
import { motion } from 'framer-motion';

const Layout: React.FC = () => {
  const { chakraState } = useChakra();
  
  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-gray-100">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <motion.main 
          className="flex-1 overflow-auto p-4 transition-colors duration-500 metatron-cube-bg"
          style={{
            background: `linear-gradient(to bottom, rgba(18,18,18,0.92), rgba(18,18,18,0.96)), 
                      radial-gradient(circle at 50% 50%, ${chakraState.color}20, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 sacred-geometry-bg opacity-30 pointer-events-none"></div>
          <div className="absolute inset-0 fibonacci-bg opacity-20 pointer-events-none"></div>
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;