import React, { useState } from 'react';
import { ChakraType } from '../../types';
import { supabase } from '../../lib/supabase';
import { useChakra } from '../../context/ChakraContext';
import { useXP } from '../../context/XPProvider';
import { motion } from 'framer-motion';
import TattooButton from '../ui/TattooButton';
import SymbolCanvas from '../ui/SymbolCanvas';

interface SigilGeneratorProps {
  onSigilGenerated?: (sigilId: string) => void;
}

const SigilGenerator: React.FC<SigilGeneratorProps> = ({ onSigilGenerated }) => {
  const { chakraState, activateChakra } = useChakra();
  const { addXP } = useXP();
  const [intention, setIntention] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSvg, setPreviewSvg] = useState<string | null>(null);
  
  const chakraOptions: ChakraType[] = [
    'Root', 'Sacral', 'SolarPlexus', 'Heart', 'Throat', 'ThirdEye', 'Crown'
  ];
  
  const handlePreview = () => {
    if (!intention.trim()) {
      setError('Please set an intention for your sigil');
      return;
    }
    
    // Generate preview SVG
    const previewSvg = generateDemoSigilSvg(chakraState.type, intention);
    setPreviewSvg(previewSvg);
  };
  
  const handleGenerate = async () => {
    if (!intention.trim()) {
      setError('Please set an intention for your sigil');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Generate a sigil SVG
      const sigilSvg = generateDemoSigilSvg(chakraState.type, intention);
      
      // Save to Supabase
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('User not authenticated');
      
      const userId = session.session.user.id;
      
      // Tesla 369 math for numerology
      const intentionValue = intention.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const teslaSum = reduceToTeslaNumber(intentionValue);
      
      const { data, error } = await supabase
        .from('fractal_glyphs')
        .insert({
          user_id: userId,
          parameters: {
            frequency: chakraState.frequency,
            chakra: chakraState.type,
            intention: intention,
            prime_multiplier: calculatePrimeMultiplier(intentionValue),
            numerology_profile: {
              lifePath: teslaSum,
              expression: calculateExpression(intention),
              soulUrge: reduceToTeslaNumber(intentionValue % 9 || 9), // Ensure 9 instead of 0
              baseForm: getGeometricBase(chakraState.type),
              overlay: getGeometricOverlay(teslaSum),
              ornamentation: 'fractal'
            },
            svg: sigilSvg
          }
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Award XP for creating a sigil
      await addXP(25);
      
      // Log sigil creation as a continuum session
      await supabase
        .from('continuum_sessions')
        .insert({
          user_id: userId,
          session_type: 'sigil_creation',
          xp_awarded: 25,
          chakra: chakraState.type,
          frequency: chakraState.frequency,
          timestamp: new Date().toISOString()
        });
      
      // Callback with the new sigil ID
      if (data && onSigilGenerated) {
        onSigilGenerated(data.id);
      }
      
      // Reset the form
      setIntention('');
      setPreviewSvg(null);
      
    } catch (err) {
      console.error('Error generating sigil:', err);
      setError('Failed to generate sigil. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Reduce a number to a single digit (except 11, 22, 33 - master numbers)
  const reduceToTeslaNumber = (num: number): number => {
    if (num === 11 || num === 22 || num === 33) return num;
    
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    
    return num;
  };
  
  // Calculate expression number based on letters
  const calculateExpression = (text: string): number => {
    // Simple numerology conversion - A=1, B=2, etc.
    const value = text
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .split('')
      .reduce((acc, char) => acc + (char.charCodeAt(0) - 64), 0);
    
    return reduceToTeslaNumber(value);
  };
  
  // Get prime number multiplier based on intention value
  const calculatePrimeMultiplier = (value: number): number => {
    const primes = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
    return primes[value % primes.length];
  };
  
  // Get geometric base shape based on chakra
  const getGeometricBase = (chakra: ChakraType): string => {
    const bases = {
      Root: 'square',
      Sacral: 'vesica',
      SolarPlexus: 'triangle',
      Heart: 'hexagram',
      Throat: 'pentagon',
      ThirdEye: 'merkaba',
      Crown: 'circle'
    };
    
    return bases[chakra];
  };
  
  // Get geometric overlay based on numerology
  const getGeometricOverlay = (num: number): string => {
    const overlays = {
      1: 'point',
      2: 'line',
      3: 'triangle',
      4: 'square',
      5: 'pentagon',
      6: 'hexagon',
      7: 'heptagon',
      8: 'octagon',
      9: 'enneagon',
      11: 'vesica',
      22: 'phi-ratio',
      33: 'merkaba'
    };
    
    return overlays[num as keyof typeof overlays] || 'circle';
  };
  
  const generateDemoSigilSvg = (chakra: ChakraType, intention: string): string => {
    // Generate a seed from the intention text
    const seed = intention.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Get the sacred number sum (using Tesla's 3-6-9 principle)
    const sacredSum = reduceToTeslaNumber(seed);
    
    // Define chakra colors
    const chakraColors: Record<ChakraType, string> = {
      Root: 'var(--chakra-root)',
      Sacral: 'var(--chakra-sacral)',
      SolarPlexus: 'var(--chakra-solarplexus)',
      Heart: 'var(--chakra-heart)',
      Throat: 'var(--chakra-throat)',
      ThirdEye: 'var(--chakra-thirdeye)',
      Crown: 'var(--chakra-crown)'
    };
    
    const color = chakraColors[chakra];
    
    // Golden ratio (phi) for harmonious proportions
    const phi = 1.618033988749895;
    
    // Use Tesla's 3-6-9 principle for pattern generation
    const numPaths = 3 + (seed % 3) * 3; // Either 3, 6, or 9 paths
    let paths = '';
    
    // Generate main paths
    for (let i = 0; i < numPaths; i++) {
      const angle = (i * 2 * Math.PI / numPaths) + (seed % 6) * (Math.PI / 6);
      
      // Use phi for radius calculation
      const radius = 30 + (seed % 9) * phi;
      
      const x1 = 50 + Math.cos(angle) * radius;
      const y1 = 50 + Math.sin(angle) * radius;
      
      const angle2 = angle + (Math.PI * (seed % 3 + 1) / 3); // Rotate by 1/3, 2/3, or 3/3 of pi
      const x2 = 50 + Math.cos(angle2) * radius;
      const y2 = 50 + Math.sin(angle2) * radius;
      
      paths += `<path d="M 50,50 L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z" 
                fill="none" stroke="${color}" stroke-width="${1 + (i % 3)}" stroke-opacity="0.8" />`;
    }
    
    // Add sacred symbols based on the numerology
    if (sacredSum === 3 || sacredSum === 6 || sacredSum === 9) {
      // Add a triangle (3), hexagon (6), or enneagon (9)
      const sides = sacredSum;
      const innerRadius = 20;
      
      let sacredPath = '<path d="M';
      
      for (let i = 0; i < sides; i++) {
        const angle = i * 2 * Math.PI / sides;
        const x = 50 + Math.cos(angle) * innerRadius;
        const y = 50 + Math.sin(angle) * innerRadius;
        
        if (i === 0) {
          sacredPath += `${x},${y} `;
        } else {
          sacredPath += `L ${x},${y} `;
        }
      }
      
      sacredPath += 'Z" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-opacity="0.9" />';
      paths += sacredPath;
    }
    
    // Add a circle in the center with phi-based radius
    const centerRadius = 5 + (sacredSum % 9) / 3 * phi;
    paths += `<circle cx="50" cy="50" r="${centerRadius}" 
               fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="1" />`;
    
    // Add subtle points at 3-6-9 positions
    for (let i = 0; i < 3; i++) {
      const angle = i * 2 * Math.PI / 3;
      const x = 50 + Math.cos(angle) * 45;
      const y = 50 + Math.sin(angle) * 45;
      
      paths += `<circle cx="${x}" cy="${y}" r="${3}" 
                 fill="${color}" fill-opacity="${0.2 + i * 0.2}" stroke="none" />`;
    }
    
    // Create the final SVG
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${paths}</svg>`;
  };
  
  return (
    <div className="bg-dark-200 p-6 rounded-2xl shadow-chakra-glow border border-dark-300">
      <h2 className="text-2xl font-heading font-semibold mb-4 text-white">Generate Soul Sigil</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Chakra Alignment
        </label>
        <div className="grid grid-cols-7 gap-2">
          {chakraOptions.map((chakra) => (
            <motion.button
              key={chakra}
              type="button"
              onClick={() => activateChakra(chakra)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-md text-xs text-center transition-colors ${
                chakraState.type === chakra
                  ? 'ring-2 ring-offset-2 font-semibold'
                  : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
              }`}
              style={{
                backgroundColor: chakraState.type === chakra 
                  ? `${chakraColors[chakra]}20` 
                  : undefined,
                color: chakraState.type === chakra 
                  ? chakraColors[chakra] 
                  : undefined,
                ringColor: chakraState.type === chakra 
                  ? chakraColors[chakra] 
                  : undefined
              }}
            >
              {chakra}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="intention" className="block text-sm font-medium text-gray-300 mb-2">
          Set Your Intention
        </label>
        <textarea
          id="intention"
          className="w-full px-3 py-2 bg-dark-300 border border-dark-400 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
          placeholder="Enter your intention or affirmation (max 50 characters)"
          maxLength={50}
          rows={3}
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
        ></textarea>
        <div className="text-xs text-right text-gray-400 mt-1">
          {intention.length}/50
        </div>
      </div>
      
      {previewSvg && (
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="w-40 h-40 sacred-geometry-bg bg-dark-300 rounded-2xl flex items-center justify-center">
              <motion.div
                className="w-32 h-32"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="flex space-x-3">
        <TattooButton
          variant="outline" 
          onClick={handlePreview}
          disabled={isGenerating || !intention.trim()}
          chakraColor={chakraState.color}
          className="flex-1"
        >
          Preview
        </TattooButton>
        
        <TattooButton
          onClick={handleGenerate}
          disabled={isGenerating || !intention.trim()}
          chakraColor={chakraState.color}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <motion.span 
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="inline-block mr-2"
              >
                ⟳
              </motion.span>
              Generating...
            </>
          ) : (
            'Generate Sigil'
          )}
        </TattooButton>
      </div>
      
      <div className="mt-6">
        <div className="text-xs text-gray-400 text-center">
          <p>Tesla's 369 Key is incorporated into your sigil</p>
        </div>
        <div className="flex justify-center mt-3 space-x-8">
          <motion.div 
            className="text-center"
            animate={{ 
              y: [0, -3, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-2xl font-heading" style={{ color: chakraState.color }}>3</div>
            <div className="text-xs text-gray-400">Manifestation</div>
          </motion.div>
          <motion.div 
            className="text-center"
            animate={{ 
              y: [0, -3, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <div className="text-2xl font-heading" style={{ color: chakraState.color }}>6</div>
            <div className="text-xs text-gray-400">Harmony</div>
          </motion.div>
          <motion.div 
            className="text-center"
            animate={{ 
              y: [0, -3, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 9, repeat: Infinity }}
          >
            <div className="text-2xl font-heading" style={{ color: chakraState.color }}>9</div>
            <div className="text-xs text-gray-400">Completion</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Color mapping for chakras
const chakraColors: Record<ChakraType, string> = {
  Root: 'var(--chakra-root)',
  Sacral: 'var(--chakra-sacral)',
  SolarPlexus: 'var(--chakra-solarplexus)',
  Heart: 'var(--chakra-heart)',
  Throat: 'var(--chakra-throat)',
  ThirdEye: 'var(--chakra-thirdeye)',
  Crown: 'var(--chakra-crown)'
};

export default SigilGenerator;