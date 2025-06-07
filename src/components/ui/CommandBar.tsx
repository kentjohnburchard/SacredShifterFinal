import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useChakra } from '../../context/ChakraContext';
import { Terminal, X, Search, ArrowRight } from 'lucide-react';

interface CommandOption {
  id: string;
  name: string;
  description: string;
  action: () => void;
  keywords: string[];
}

const CommandBar: React.FC = () => {
  const { chakraState, activateChakra } = useChakra();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<CommandOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Command options
  const commandOptions: CommandOption[] = [
    {
      id: 'dashboard',
      name: 'Open Dashboard',
      description: 'Navigate to your personal dashboard',
      action: () => navigate('/dashboard'),
      keywords: ['home', 'dash', 'main']
    },
    {
      id: 'sigils',
      name: 'Create Sigil',
      description: 'Generate a new soul sigil',
      action: () => navigate('/sigils'),
      keywords: ['generate', 'soul', 'glyph']
    },
    {
      id: 'echo-compass',
      name: 'Open Echo Compass',
      description: 'Navigate the quantum field',
      action: () => navigate('/echo-compass'),
      keywords: ['navigate', 'quantum', 'field']
    },
    {
      id: 'sacred-circle',
      name: 'Join Sacred Circle',
      description: 'Connect with your community',
      action: () => navigate('/sacred-circle'),
      keywords: ['community', 'connect', 'group']
    },
    {
      id: 'fractal-mirror',
      name: 'Open Fractal Mirror',
      description: 'Reflect on your inner state',
      action: () => navigate('/fractal-mirror'),
      keywords: ['reflect', 'mirror', 'inner']
    },
    {
      id: 'sacred-library',
      name: 'Browse Library',
      description: 'Access sacred knowledge',
      action: () => navigate('/sacred-library'),
      keywords: ['knowledge', 'books', 'media']
    },
    {
      id: 'root-chakra',
      name: 'Activate Root Chakra',
      description: 'Frequency: 396 Hz',
      action: () => activateChakra('Root'),
      keywords: ['chakra', 'root', '396']
    },
    {
      id: 'sacral-chakra',
      name: 'Activate Sacral Chakra',
      description: 'Frequency: 417 Hz',
      action: () => activateChakra('Sacral'),
      keywords: ['chakra', 'sacral', '417']
    },
    {
      id: 'solar-plexus-chakra',
      name: 'Activate Solar Plexus Chakra',
      description: 'Frequency: 528 Hz',
      action: () => activateChakra('SolarPlexus'),
      keywords: ['chakra', 'solar', 'plexus', '528']
    },
    {
      id: 'heart-chakra',
      name: 'Activate Heart Chakra',
      description: 'Frequency: 639 Hz',
      action: () => activateChakra('Heart'),
      keywords: ['chakra', 'heart', '639']
    },
    {
      id: 'throat-chakra',
      name: 'Activate Throat Chakra',
      description: 'Frequency: 741 Hz',
      action: () => activateChakra('Throat'),
      keywords: ['chakra', 'throat', '741']
    },
    {
      id: 'third-eye-chakra',
      name: 'Activate Third Eye Chakra',
      description: 'Frequency: 852 Hz',
      action: () => activateChakra('ThirdEye'),
      keywords: ['chakra', 'third', 'eye', '852']
    },
    {
      id: 'crown-chakra',
      name: 'Activate Crown Chakra',
      description: 'Frequency: 963 Hz',
      action: () => activateChakra('Crown'),
      keywords: ['chakra', 'crown', '963']
    }
  ];
  
  // Filter options based on input
  useEffect(() => {
    if (!input.trim()) {
      setFilteredOptions(commandOptions);
      return;
    }
    
    const filtered = commandOptions.filter(option => {
      const searchTerms = input.toLowerCase().split(' ');
      return searchTerms.every(term => 
        option.name.toLowerCase().includes(term) || 
        option.description.toLowerCase().includes(term) ||
        option.keywords.some(keyword => keyword.toLowerCase().includes(term))
      );
    });
    
    setFilteredOptions(filtered);
    setSelectedIndex(0);
  }, [input]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle command bar with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        
        if (!isOpen) {
          setInput('');
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }
      }
      
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    // Navigate options with arrow keys
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[selectedIndex]) {
        executeCommand(filteredOptions[selectedIndex]);
      }
    }
  };
  
  const executeCommand = (option: CommandOption) => {
    option.action();
    setIsOpen(false);
    setInput('');
  };
  
  return (
    <>
      {/* Command bar toggle button */}
      <button
        className="fixed bottom-4 right-4 p-3 rounded-full bg-ink-shadow border border-ink-accent z-50 hover:bg-ink-accent transition-colors"
        onClick={() => setIsOpen(true)}
        aria-label="Open command bar"
      >
        <Terminal 
          size={20} 
          style={{ color: chakraState.color }} 
        />
      </button>
      
      {/* Command bar modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Command bar */}
            <motion.div
              className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="glass-dark rounded-xl overflow-hidden shadow-lg border border-ink-accent">
                {/* Input area */}
                <div className="command-bar">
                  <Search size={18} className="text-gray-400" />
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className="command-input"
                    placeholder="Type a command or search..."
                    autoComplete="off"
                  />
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-1.5 py-0.5 rounded bg-ink-accent">↑↓</span>
                    <span>to navigate</span>
                    <span className="px-1.5 py-0.5 rounded bg-ink-accent">↵</span>
                    <span>to select</span>
                    <span className="px-1.5 py-0.5 rounded bg-ink-accent">esc</span>
                    <span>to close</span>
                  </div>
                </div>
                
                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    <div className="p-1">
                      {filteredOptions.map((option, index) => (
                        <div
                          key={option.id}
                          className={`p-3 rounded-lg flex items-center cursor-pointer ${
                            index === selectedIndex ? 'bg-ink-accent' : 'hover:bg-ink-shadow'
                          }`}
                          onClick={() => executeCommand(option)}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-white">{option.name}</div>
                            <div className="text-xs text-gray-400">{option.description}</div>
                          </div>
                          
                          <ArrowRight 
                            size={16} 
                            className={index === selectedIndex ? 'text-white' : 'text-gray-500'} 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      No commands found
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommandBar;