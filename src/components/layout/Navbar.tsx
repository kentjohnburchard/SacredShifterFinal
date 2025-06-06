import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import XPTracker from '../xp/XPTracker';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { chakraState } = useChakra();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <nav className="bg-dark-200 border-b border-dark-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-heading font-bold flex items-center">
                <motion.div 
                  className="w-8 h-8 rounded-full mr-2 flex items-center justify-center overflow-hidden relative"
                  animate={{ 
                    boxShadow: [
                      `0 0 3px ${chakraState.color}`,
                      `0 0 6px ${chakraState.color}`,
                      `0 0 9px ${chakraState.color}`
                    ]
                  }}
                  transition={{ 
                    duration: 9,
                    repeat: Infinity,
                    repeatType: "reverse",
                    times: [0, 0.33, 0.66, 1]
                  }}
                  style={{ backgroundColor: `${chakraState.color}30` }}
                >
                  {/* Tesla 369 Vortex Symbol */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 9, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                  >
                    <Compass className="w-5 h-5 text-white" />
                  </motion.div>
                </motion.div>
                <span className="text-white">Sacred <span className="opacity-70">Shifter</span></span>
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/dashboard" className="border-transparent text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/sigils" className="border-transparent text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Soul Sigils
              </Link>
              <Link to="/tasks" className="border-transparent text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Sacred Tasks
              </Link>
              <Link to="/fractal-mirror" className="border-transparent text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Fractal Mirror
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <>
                <XPTracker />
                
                <div className="relative ml-3">
                  <div>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 tesla-field"
                      style={{ focusRingColor: chakraState.color }}
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-dark-300 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.avatar_url}
                            alt={user.display_name || 'User'}
                          />
                        ) : (
                          <User size={16} className="text-white" />
                        )}
                      </div>
                    </button>
                  </div>
                  
                  {isMenuOpen && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-2xl shadow-lg py-1 bg-dark-200 ring-1 ring-dark-300 ring-opacity-5 focus:outline-none z-10"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                      tabIndex={-1}
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-300 hover:text-white"
                        role="menuitem"
                        tabIndex={-1}
                        id="user-menu-item-0"
                      >
                        <User size={16} className="inline mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-300 hover:text-white"
                        role="menuitem"
                        tabIndex={-1}
                        id="user-menu-item-2"
                      >
                        <LogOut size={16} className="inline mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-dark-300 text-sm font-medium rounded-2xl text-white bg-dark-300 hover:bg-dark-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-2xl text-dark-900 bg-white hover:bg-gray-100"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-300 focus:outline-none focus:ring-2 focus:ring-inset"
              style={{ focusRingColor: chakraState.color }}
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="sm:hidden bg-dark-200" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              style={{ 
                borderColor: chakraState.color,
                backgroundColor: `${chakraState.color}20`
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/sigils"
              className="border-transparent text-gray-300 hover:bg-dark-300 hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Soul Sigils
            </Link>
            <Link
              to="/tasks"
              className="border-transparent text-gray-300 hover:bg-dark-300 hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Sacred Tasks
            </Link>
            <Link
              to="/fractal-mirror"
              className="border-transparent text-gray-300 hover:bg-dark-300 hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Fractal Mirror
            </Link>
            <Link
              to="/profile"
              className="border-transparent text-gray-300 hover:bg-dark-300 hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;