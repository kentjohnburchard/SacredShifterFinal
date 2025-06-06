import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Sigil } from '../types';
import SigilPreview from '../components/sigils/SigilPreview';
import { ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';

const SigilEvolutionMap: React.FC = () => {
  const { user } = useAuth();
  const [sigils, setSigils] = useState<Sigil[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
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
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setSigils(data || []);
    } catch (error) {
      console.error('Error fetching sigils:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < sigils.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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
    if (sigils.length === 0) return;
    
    const currentSigil = sigils[currentIndex];
    const svg = currentSigil.parameters.svg;
    const filename = `soul-sigil-${new Date(currentSigil.created_at).toISOString().split('T')[0]}.svg`;
    
    downloadSVG(svg, filename);
  };
  
  const currentSigil = sigils[currentIndex];
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Sigil Evolution Map</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : sigils.length === 0 ? (
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
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Sigils Found</h2>
          <p className="text-gray-500 mb-4">
            You haven't created any soul sigils yet. Generate your first sigil to begin tracking your evolution.
          </p>
          <a
            href="/sigils"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Sigil Generator
          </a>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Timeline progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                First Sigil: {new Date(sigils[0].created_at).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">
                {currentIndex + 1} of {sigils.length} sigils
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Latest Sigil: {new Date(sigils[sigils.length - 1].created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${(currentIndex / (sigils.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Current sigil display */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">
              <SigilPreview sigil={currentSigil} size="lg" />
            </div>
            
            <h2 className="text-xl font-semibold text-center">
              {currentSigil.parameters.intention}
            </h2>
            
            <div className="mt-2 text-sm text-gray-500 text-center">
              Created on {new Date(currentSigil.created_at).toLocaleDateString()}
            </div>
          </div>
          
          {/* Details and navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Chakra</div>
                  <div className="font-medium">{currentSigil.parameters.chakra}</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Frequency</div>
                  <div className="font-medium">{currentSigil.parameters.frequency} Hz</div>
                </div>
                
                {currentSigil.parameters.archetypeKey && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-500">Archetype</div>
                    <div className="font-medium">{currentSigil.parameters.archetypeKey}</div>
                  </div>
                )}
                
                {currentSigil.parameters.numerology_profile?.lifePath && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-500">Life Path</div>
                    <div className="font-medium">{currentSigil.parameters.numerology_profile.lifePath}</div>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download SVG
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`p-2 rounded-full mr-4 ${
                  currentIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                }`}
              >
                <ChevronLeft size={24} />
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentIndex === sigils.length - 1}
                className={`p-2 rounded-full ${
                  currentIndex === sigils.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                }`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SigilEvolutionMap;