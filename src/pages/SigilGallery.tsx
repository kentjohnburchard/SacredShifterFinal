import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Sigil } from '../types';
import SigilPreview from '../components/sigils/SigilPreview';
import { Download, Calendar, Filter } from 'lucide-react';

const SigilGallery: React.FC = () => {
  const { user } = useAuth();
  const [sigils, setSigils] = useState<Sigil[]>([]);
  const [selectedSigil, setSelectedSigil] = useState<Sigil | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  useEffect(() => {
    fetchSigils();
  }, [user]);
  
  const fetchSigils = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('fractal_glyphs')
        .select('*')
        .eq('user_id', user.id)
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
  
  const downloadSVG = (svg: string, filename = 'soul-sigil.svg') => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleDownload = () => {
    if (!selectedSigil) return;
    
    const svg = selectedSigil.parameters.svg;
    const filename = `soul-sigil-${new Date(selectedSigil.created_at).toISOString().split('T')[0]}.svg`;
    
    downloadSVG(svg, filename);
  };
  
  const getFilteredSigils = () => {
    if (filter === 'all') return sigils;
    
    return sigils.filter(sigil => {
      if (filter === 'blueprint' && !sigil.parameters.archetypeKey) {
        return true;
      }
      return sigil.parameters.archetypeKey === filter;
    });
  };
  
  const filteredSigils = getFilteredSigils();
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Soul Sigil Gallery</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Sigil details and filters */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Filter className="mr-2 h-5 w-5 text-indigo-500" />
              Filter Sigils
            </h2>
            
            <div className="space-y-2">
              <button
                onClick={() => setFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  filter === 'all' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                All Sigils
              </button>
              <button
                onClick={() => setFilter('blueprint')}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  filter === 'blueprint' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                Blueprint Sigils
              </button>
              <button
                onClick={() => setFilter('The Fool')}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  filter === 'The Fool' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                The Fool Sigils
              </button>
              <button
                onClick={() => setFilter('The Empress')}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  filter === 'The Empress' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                The Empress Sigils
              </button>
            </div>
          </div>
          
          {/* Selected Sigil Details */}
          {selectedSigil && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Sigil Details</h2>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Intention:</span>
                  <p className="font-medium">{selectedSigil.parameters.intention}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Chakra:</span>
                  <p className="font-medium">{selectedSigil.parameters.chakra} Chakra</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Frequency:</span>
                  <p className="font-medium">{selectedSigil.parameters.frequency} Hz</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Created:</span>
                  <p className="font-medium">
                    {new Date(selectedSigil.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                {selectedSigil.parameters.archetypeKey && (
                  <div>
                    <span className="text-sm text-gray-500">Archetype:</span>
                    <p className="font-medium">{selectedSigil.parameters.archetypeKey}</p>
                  </div>
                )}
                
                {selectedSigil.parameters.numerology_profile?.lifePath && (
                  <div>
                    <span className="text-sm text-gray-500">Life Path:</span>
                    <p className="font-medium">
                      {selectedSigil.parameters.numerology_profile.lifePath}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download SVG
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Right column: Sigil Gallery Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Your Sigil Collection</h2>
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {filteredSigils.length} sigils
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              filteredSigils.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredSigils.map(sigil => (
                    <div 
                      key={sigil.id} 
                      className={`rounded-md overflow-hidden cursor-pointer transition-transform duration-200 transform hover:scale-105 ${
                        selectedSigil?.id === sigil.id ? 'ring-2 ring-indigo-500' : ''
                      }`}
                      onClick={() => setSelectedSigil(sigil)}
                    >
                      <SigilPreview sigil={sigil} size="md" isInteractive />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
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
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">No sigils found with the current filter.</p>
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    View all sigils
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigilGallery;