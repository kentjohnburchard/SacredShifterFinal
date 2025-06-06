import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Sigil, SigilSticker } from '../types';
import SigilBoard from '../components/sigils/SigilBoard';
import SigilPreview from '../components/sigils/SigilPreview';
import { Download, Plus, Edit, Trash2, Save } from 'lucide-react';

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
  
  useEffect(() => {
    if (user) {
      fetchSigils();
      fetchBoards();
    }
  }, [user]);
  
  useEffect(() => {
    if (activeBoard) {
      setBoardStickers(activeBoard.stickers);
    }
  }, [activeBoard]);
  
  const fetchSigils = async () => {
    try {
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
    }
  };
  
  const handleCreateBoard = async () => {
    if (!user || !newBoardName.trim()) return;
    
    try {
      setIsSaving(true);
      
      const newBoard = {
        user_id: user.id,
        name: newBoardName,
        description: newBoardDescription,
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
      
      // Reset form
      setNewBoardName('');
      setNewBoardDescription('');
      setIsCreatingBoard(false);
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };
  
  const handleSaveBoard = async () => {
    if (!activeBoard) return;
    
    try {
      setIsSaving(true);
      
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
      
      alert('Board saved successfully!');
    } catch (error) {
      console.error('Error saving board:', error);
      alert('Failed to save board. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddSigilToBoard = () => {
    if (!selectedSigil || !activeBoard) return;
    
    // Check if sigil is already on the board
    const existing = boardStickers.find(sticker => sticker.sigil_id === selectedSigil.id);
    if (existing) {
      alert('This sigil is already on the board.');
      return;
    }
    
    // Create a new sticker
    const newSticker: SigilSticker = {
      sigil_id: selectedSigil.id,
      x: Math.random() * 400 + 100, // Random position
      y: Math.random() * 300 + 100,
      rotation: Math.random() * 30 - 15, // Random slight rotation
      scale: 1,
      chakra: selectedSigil.parameters.chakra as ChakraType
    };
    
    setBoardStickers([...boardStickers, newSticker]);
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Sigil Board Creator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Board selection and sigil palette */}
        <div className="lg:col-span-1 space-y-6">
          {/* Board Selection */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Boards</h2>
              <button
                onClick={() => setIsCreatingBoard(true)}
                className="text-indigo-600 hover:text-indigo-800"
                title="Create new board"
              >
                <Plus size={20} />
              </button>
            </div>
            
            {isCreatingBoard ? (
              <div className="mb-4 p-4 border border-indigo-100 rounded-md">
                <h3 className="text-sm font-medium mb-2">Create New Board</h3>
                <input
                  type="text"
                  placeholder="Board Name"
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                />
                <textarea
                  placeholder="Description (optional)"
                  className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                ></textarea>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateBoard}
                    disabled={!newBoardName.trim() || isSaving}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm disabled:bg-indigo-300"
                  >
                    {isSaving ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => setIsCreatingBoard(false)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
            
            {boards.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No boards created yet. Create your first board!
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {boards.map(board => (
                  <div 
                    key={board.id}
                    className={`p-2 rounded-md flex items-center justify-between ${
                      activeBoard?.id === board.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setActiveBoard(board)}
                    >
                      <div className="font-medium text-sm">{board.name}</div>
                      <div className="text-xs text-gray-500">
                        {board.stickers.length} sigils
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
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
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Sigil Palette</h2>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                    <div className="mt-2 text-sm text-gray-500">Loading sigils...</div>
                  </div>
                ) : sigils.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No sigils available. Create sigils first!
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {sigils.map(sigil => (
                        <div 
                          key={sigil.id} 
                          className={`rounded-md cursor-pointer transition-transform hover:scale-105 ${
                            selectedSigil?.id === sigil.id ? 'ring-2 ring-indigo-500' : ''
                          }`}
                          onClick={() => setSelectedSigil(sigil)}
                        >
                          <SigilPreview sigil={sigil} size="sm" />
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleAddSigilToBoard}
                      disabled={!selectedSigil || !activeBoard}
                      className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md disabled:bg-indigo-300"
                    >
                      Add to Board
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Right column: Board canvas */}
        <div className="lg:col-span-3">
          {activeBoard ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{activeBoard.name}</h2>
                  {activeBoard.description && (
                    <p className="text-sm text-gray-500">{activeBoard.description}</p>
                  )}
                </div>
                
                <button
                  onClick={handleSaveBoard}
                  disabled={isSaving}
                  className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm disabled:bg-indigo-300"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-1">⟳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-1" />
                      Save Board
                    </>
                  )}
                </button>
              </div>
              
              <div className="mb-4 border border-gray-200 rounded-md overflow-hidden">
                <SigilBoard
                  sigils={sigils}
                  stickers={boardStickers}
                  onStickersChange={setBoardStickers}
                  width={800}
                  height={600}
                />
              </div>
              
              <div className="text-sm text-gray-500">
                Tip: Click on a sigil to select it. Drag to move, and use the handles to resize or rotate.
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No Active Board</h2>
              <p className="text-gray-500 mb-4">
                Create a new board to start arranging your sigils into meaningful patterns.
              </p>
              <button
                onClick={() => setIsCreatingBoard(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus size={16} className="mr-1" />
                Create Board
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SigilBoardPage;