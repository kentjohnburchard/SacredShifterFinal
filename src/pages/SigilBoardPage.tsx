import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Sigil, SigilSticker, ChakraType } from '../types';
import { useChakra } from '../context/ChakraContext';
import SigilBoard from '../components/sigils/SigilBoard';
import SigilPreview from '../components/sigils/SigilPreview';
import { Download, Plus, Trash2, Save, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import TattooButton from '../components/ui/TattooButton';

interface SigilBoardData {
  id: string;
  name: string;
  description?: string;
  stickers: SigilSticker[];
  created_at: string;
  updated_at: string;
}

const SigilBoardPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  const [sigils, setSigils] = useState<Sigil[]>([]);
  const [boards, setBoards] = useState<SigilBoardData[]>([]);
  const [activeBoard, setActiveBoard] = useState<SigilBoardData | null>(null);
  const [boardStickers, setBoardStickers] = useState<SigilSticker[]>([]);
  const [selectedSigil, setSelectedSigil] = useState<Sigil | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchSigils();
      fetchBoards();
    }
  }, [user]);
  
  useEffect(() => {
    if (activeBoard) {
      setBoardStickers(activeBoard.stickers || []);
    }
  }, [activeBoard]);
  
  const fetchSigils = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('fractal_glyphs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSigils(data || []);
      if (data && data.length > 0) {
        setSelectedSigil(data[0]);
      }
    } catch (error) {
      console.error('Error fetching sigils:', error);
      setErrorMessage('Failed to load sigils. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('sigil_boards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setBoards(data || []);
      if (data && data.length > 0) {
        setActiveBoard(data[0]);
      }
    } catch (error) {
      console.error('Error fetching sigil boards:', error);
      setErrorMessage('Failed to load boards. Please try again.');
    }
  };
  
  const handleCreateBoard = async () => {
    if (!user || !newBoardName.trim()) return;
    
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      const newBoard = {
        user_id: user.id,
        name: newBoardName.trim(),
        description: newBoardDescription.trim() || null,
        stickers: []
      };
      
      const { data, error } = await supabase
        .from('sigil_boards')
        .insert([newBoard])
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the new board to the list and set it as active
      setBoards([data, ...boards]);
      setActiveBoard(data);
      setBoardStickers([]);
      
      // Show success message
      setSuccessMessage('Board created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reset form
      setNewBoardName('');
      setNewBoardDescription('');
      setIsCreatingBoard(false);
    } catch (error) {
      console.error('Error creating board:', error);
      setErrorMessage('Failed to create board. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }
    
    try {
      setErrorMessage(null);
      
      const { error } = await supabase
        .from('sigil_boards')
        .delete()
        .eq('id', boardId);
        
      if (error) throw error;
      
      // Remove from boards list
      const updatedBoards = boards.filter(board => board.id !== boardId);
      setBoards(updatedBoards);
      
      // If the active board was deleted, set a new active board
      if (activeBoard?.id === boardId) {
        if (updatedBoards.length > 0) {
          setActiveBoard(updatedBoards[0]);
        } else {
          setActiveBoard(null);
          setBoardStickers([]);
        }
      }
      
      // Show success message
      setSuccessMessage('Board deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting board:', error);
      setErrorMessage('Failed to delete board. Please try again.');
    }
  };
  
  const handleSaveBoard = async () => {
    if (!activeBoard) return;
    
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      const { error } = await supabase
        .from('sigil_boards')
        .update({ 
          stickers: boardStickers,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeBoard.id);
        
      if (error) throw error;
      
      // Update boards list
      const updatedBoards = boards.map(board => 
        board.id === activeBoard.id 
          ? { ...board, stickers: boardStickers, updated_at: new Date().toISOString() }
          : board
      );
      
      setBoards(updatedBoards);
      setActiveBoard({ ...activeBoard, stickers: boardStickers, updated_at: new Date().toISOString() });
      
      // Show success message
      setSuccessMessage('Board saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving board:', error);
      setErrorMessage('Failed to save board. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddSigilToBoard = () => {
    if (!selectedSigil || !activeBoard) return;
    
    // Check if sigil is already on the board
    const existing = boardStickers.find(sticker => sticker.sigil_id === selectedSigil.id);
    if (existing) {
      setErrorMessage('This sigil is already on the board.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    // Create a new sticker
    const newSticker: SigilSticker = {
      sigil_id: selectedSigil.id,
      x: Math.random() * 400 + 200, // Random position
      y: Math.random() * 300 + 150,
      rotation: Math.random() * 30 - 15, // Random slight rotation
      scale: 1,
      chakra: selectedSigil.parameters.chakra as ChakraType
    };
    
    const updatedStickers = [...boardStickers, newSticker];
    setBoardStickers(updatedStickers);
    
    // Show success message
    setSuccessMessage('Sigil added to board!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  const downloadBoard = () => {
    if (!activeBoard) return;
    
    // This would be implemented with canvas export functionality
    // For now, just show a message
    setSuccessMessage('Board download feature coming soon!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Sigil Board Creator</h1>
      
      {errorMessage && (
        <motion.div 
          className="mb-4 p-3 bg-red-900 text-red-100 rounded-md flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <AlertCircle size={16} className="mr-2" />
          {errorMessage}
        </motion.div>
      )}
      
      {successMessage && (
        <motion.div 
          className="mb-4 p-3 rounded-md text-white flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{ backgroundColor: chakraState.color }}
        >
          <Info size={16} className="mr-2" />
          {successMessage}
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Board selection and sigil palette */}
        <div className="lg:col-span-1 space-y-6">
          {/* Board Selection */}
          <div className="bg-dark-200 p-6 rounded-2xl border border-dark-300 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Your Boards</h2>
              <button
                onClick={() => setIsCreatingBoard(true)}
                className="text-gray-300 hover:text-white"
                title="Create new board"
              >
                <Plus size={20} />
              </button>
            </div>
            
            {isCreatingBoard ? (
              <div className="mb-4 p-4 border border-dark-400 rounded-lg bg-dark-300">
                <h3 className="text-sm font-medium mb-2 text-white">Create New Board</h3>
                <input
                  type="text"
                  placeholder="Board Name"
                  className="w-full mb-2 px-3 py-2 bg-dark-400 border border-dark-500 rounded-md text-white focus:outline-none focus:ring-2"
                  style={{ focusRingColor: chakraState.color }}
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                />
                <textarea
                  placeholder="Description (optional)"
                  className="w-full mb-3 px-3 py-2 bg-dark-400 border border-dark-500 rounded-md text-white focus:outline-none focus:ring-2"
                  style={{ focusRingColor: chakraState.color }}
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                ></textarea>
                <div className="flex space-x-2">
                  <TattooButton
                    onClick={handleCreateBoard}
                    disabled={!newBoardName.trim() || isSaving}
                    chakraColor={chakraState.color}
                    size="sm"
                  >
                    {isSaving ? 'Creating...' : 'Create'}
                  </TattooButton>
                  <button
                    onClick={() => setIsCreatingBoard(false)}
                    className="px-3 py-1 bg-dark-400 text-gray-300 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
            
            {boards.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                No boards created yet. Create your first board!
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {boards.map(board => (
                  <div 
                    key={board.id}
                    className={`p-2 rounded-md flex items-center justify-between ${
                      activeBoard?.id === board.id 
                        ? 'bg-dark-100 border border-dark-400' 
                        : 'hover:bg-dark-300'
                    }`}
                    style={{
                      borderColor: activeBoard?.id === board.id ? chakraState.color : undefined
                    }}
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setActiveBoard(board)}
                    >
                      <div className="font-medium text-sm text-white">{board.name}</div>
                      <div className="text-xs text-gray-400">
                        {board.stickers?.length || 0} sigils
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                      title="Delete board"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Sigil Selection */}
          {activeBoard && (
            <div className="bg-dark-200 p-6 rounded-2xl border border-dark-300 shadow-md">
              <h2 className="text-lg font-medium text-white mb-4">Sigil Palette</h2>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div 
                      className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 mx-auto"
                      style={{ borderColor: chakraState.color }}
                    ></div>
                    <div className="mt-2 text-sm text-gray-400">Loading sigils...</div>
                  </div>
                ) : sigils.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    No sigils available. Create sigils first!
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {sigils.map(sigil => (
                        <div 
                          key={sigil.id}
                          className={`rounded-md cursor-pointer transition-transform hover:scale-105 ${
                            selectedSigil?.id === sigil.id ? 'ring-2' : ''
                          }`}
                          style={{ 
                            ringColor: selectedSigil?.id === sigil.id ? chakraState.color : undefined 
                          }}
                          onClick={() => setSelectedSigil(sigil)}
                        >
                          <SigilPreview sigil={sigil} size="sm" />
                        </div>
                      ))}
                    </div>
                    
                    <TattooButton
                      onClick={handleAddSigilToBoard}
                      disabled={!selectedSigil || !activeBoard}
                      chakraColor={chakraState.color}
                      className="w-full"
                    >
                      Add to Board
                    </TattooButton>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Right column: Board canvas */}
        <div className="lg:col-span-3">
          {activeBoard ? (
            <div className="bg-dark-200 p-6 rounded-2xl border border-dark-300 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-medium text-white">{activeBoard.name}</h2>
                  {activeBoard.description && (
                    <p className="text-sm text-gray-400">{activeBoard.description}</p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <TattooButton
                    onClick={downloadBoard}
                    size="sm"
                    variant="outline"
                    chakraColor={chakraState.color}
                  >
                    <Download size={16} className="mr-1" />
                    Export
                  </TattooButton>
                  
                  <TattooButton
                    onClick={handleSaveBoard}
                    disabled={isSaving}
                    size="sm"
                    chakraColor={chakraState.color}
                  >
                    {isSaving ? (
                      <>
                        <motion.span 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block mr-1"
                        >
                          ⟳
                        </motion.span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-1" />
                        Save Board
                      </>
                    )}
                  </TattooButton>
                </div>
              </div>
              
              <div className="mb-4 border border-dark-400 rounded-lg overflow-hidden">
                <SigilBoard
                  sigils={sigils}
                  stickers={boardStickers}
                  onStickersChange={setBoardStickers}
                  width={800}
                  height={600}
                />
              </div>
              
              <div className="text-sm text-gray-400">
                Tip: Click on a sigil to select it. Drag to move, and use the handles to resize or rotate.
              </div>
            </div>
          ) : (
            <div className="bg-dark-200 p-10 rounded-2xl border border-dark-300 shadow-md text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${chakraState.color}20` }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={chakraState.color}
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-white">No Active Board</h2>
              <p className="text-gray-400 mb-4">
                Create a new board to start arranging your sigils into meaningful patterns.
              </p>
              <TattooButton
                onClick={() => setIsCreatingBoard(true)}
                chakraColor={chakraState.color}
              >
                <Plus size={16} className="mr-1" />
                Create Board
              </TattooButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SigilBoardPage;