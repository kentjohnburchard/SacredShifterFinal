import React, { useState, useEffect } from 'react';
import { Aperture } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import SigilGenerator from '../components/sigils/SigilGenerator';
import SigilPreview from '../components/sigils/SigilPreview';
import { Sigil } from '../types';

const SigilGeneratorPage: React.FC = () => {
  const { user } = useAuth();
  const [recentSigils, setRecentSigils] = useState<Sigil[]>([]);
  const [selectedSigil, setSelectedSigil] = useState<Sigil | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchRecentSigils();
  }, [user]);
  
  const fetchRecentSigils = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('fractal_glyphs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setRecentSigils(data || []);
      if (data && data.length > 0) {
        setSelectedSigil(data[0]);
      }
    } catch (error) {
      console.error('Error fetching recent sigils:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSigilGenerated = async (sigilId: string) => {
    try {
      const { data, error } = await supabase
        .from('fractal_glyphs')
        .select('*')
        .eq('id', sigilId)
        .single();
        
      if (error) throw error;
      
      // Add to recent sigils and select it
      setRecentSigils([data, ...recentSigils]);
      setSelectedSigil(data);
    } catch (error) {
      console.error('Error fetching generated sigil:', error);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Soul Sigil Generator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Sigil Generator */}
        <div>
          <SigilGenerator onSigilGenerated={handleSigilGenerated} />
          
          {/* Recent Sigils */}
          {!isLoading && recentSigils.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Recent Sigils</h3>
              <div className="grid grid-cols-5 gap-2">
                {recentSigils.map(sigil => (
                  <div 
                    key={sigil.id} 
                    className={`rounded-md overflow-hidden cursor-pointer ${
                      selectedSigil?.id === sigil.id ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={() => setSelectedSigil(sigil)}
                  >
                    <SigilPreview sigil={sigil} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right column: Selected Sigil Preview */}
        <div>
          {selectedSigil ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                {selectedSigil.parameters.intention}
              </h2>
              
              <div className="flex justify-center mb-6">
                <SigilPreview sigil={selectedSigil} size="lg" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Chakra:</span>
                  <span className="ml-2 font-medium">{selectedSigil.parameters.chakra}</span>
                </div>
                <div>
                  <span className="text-gray-500">Frequency:</span>
                  <span className="ml-2 font-medium">{selectedSigil.parameters.frequency} Hz</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedSigil.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Life Path:</span>
                  <span className="ml-2 font-medium">
                    {selectedSigil.parameters.numerology_profile.lifePath}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Download SVG
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add to Board
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[400px]">
              {isLoading ? (
                <div className="animate-pulse text-center">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-gray-700">Loading sigils...</p>
                </div>
              ) : (
                <>
                  <Aperture size={64} className="text-gray-300 mb-4" />
                  <p className="text-lg text-gray-500">
                    No sigils yet. Generate your first soul sigil!
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SigilGeneratorPage;