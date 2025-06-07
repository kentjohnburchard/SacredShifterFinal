import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, Compass, Settings, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import XPTracker from '../xp/XPTracker';
import { motion } from 'framer-motion';
import { useChakra } from '../../context/ChakraContext';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { chakraState } = useChakra();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/echo-compass') return 'Echo Compass';
    if (path === '/sigils') return 'Soul Sigils';
    if (path === '/tasks') return 'Sacred Tasks';
    if (path === '/fractal-mirror') return 'Fractal Mirror';
    if (path.startsWith('/sacred-circle')) return 'Sacred Circle';
    if (path.startsWith('/sacred-library')) return 'Sacred Library';
    if (path === '/the-fool') return 'The Fool';
    if (path === '/the-high-priestess') return 'High Priestess';
    if (path === '/journeys/hierophant') return 'The Hierophant';
    if (path === '/the-magician') return 'The Magician';
    if (path === '/the-empress') return 'The Empress';
    
    return 'Sacred Shifter';
  };
  
  return (
    <nav className="bg-ink-deep border-b border-ink-accent shadow-lg z-40">
      <div className="px-4 flex justify-between h-16">
        {/* Left section - Logo and title */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <motion.div 
              className="w-9 h-9 rounded-full mr-3 flex items-center justify-center overflow-hidden relative"
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
              style={{ backgroundColor: `${chakraState.color}20` }}
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
            
            <div>
              <div className="text-xl font-mystical font-bold text-white">
                Sacred <span className="opacity-70">Shifter</span>
              </div>
              <div className="text-xs text-gray-400 font-sacred">Metaphysical OS</div>
            </div>
          </Link>
          
          <div className="ml-6 h-6 w-px bg-ink-accent"></div>
          
          <div className="ml-6 font-sacred text-lg">
            {getPageTitle()}
          </div>
        </div>
        
        {/* Right section - Search, notifications, and profile */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Search button */}
              <button 
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-ink-accent"
                onClick={() => {
                  // Open command bar (handled by keyboard shortcut)
                  const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    ctrlKey: true
                  });
                  window.dispatchEvent(event);
                }}
              >
                <Search size={20} />
              </button>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-ink-accent"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
                </button>
                
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 glass-dark rounded-xl shadow-lg py-2 z-10">
                    <div className="px-4 py-2 border-b border-ink-accent">
                      <h3 className="font-sacred text-white">Notifications</h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-ink-accent border-l-2 border-transparent hover:border-l-2" style={{ borderLeftColor: chakraState.color }}>
                        <div className="font-medium text-white">New ritual scheduled</div>
                        <div className="text-sm text-gray-400">Heart Resonance Circle • 2h ago</div>
                      </div>
                      
                      <div className="px-4 py-3 hover:bg-ink-accent">
                        <div className="font-medium text-white">Sigil activation complete</div>
                        <div className="text-sm text-gray-400">Quantum Field • 5h ago</div>
                      </div>
                      
                      <div className="px-4 py-3 hover:bg-ink-accent">
                        <div className="font-medium text-white">New library content</div>
                        <div className="text-sm text-gray-400">Sacred Library • 1d ago</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* XP Tracker */}
              <XPTracker />
              
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 tesla-field"
                  style={{ '--chakra-color': chakraState.color } as React.CSSProperties}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-9 w-9 rounded-full bg-ink-accent flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        className="h-9 w-9 rounded-full"
                        src={user.avatar_url}
                        alt={user.display_name || 'User'}
                      />
                    ) : (
                      <User size={18} className="text-white" />
                    )}
                  </div>
                </button>
                
                {isMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 glass-dark focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    tabIndex={-1}
                  >
                    <div className="px-4 py-2 border-b border-ink-accent">
                      <div className="font-medium text-white">{user.display_name || user.full_name || 'User'}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-ink-accent"
                      role="menuitem"
                      tabIndex={-1}
                    >
                      <User size={16} className="inline mr-2" />
                      Profile
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-ink-accent"
                      role="menuitem"
                      tabIndex={-1}
                    >
                      <Settings size={16} className="inline mr-2" />
                      Settings
                    </Link>
                    
                    <div className="border-t border-ink-accent my-1"></div>
                    
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-ink-accent"
                      role="menuitem"
                      tabIndex={-1}
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 border border-ink-accent text-sm font-medium rounded-xl text-white bg-ink-shadow hover:bg-ink-accent"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-ink-black bg-white hover:bg-gray-100"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;