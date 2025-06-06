import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import { ChakraType } from '../types';
import ChakraBadge from '../components/chakra/ChakraBadge';

const BlueprintPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { activateChakra } = useChakra();
  const { addXP } = useXP();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [chakraValues, setChakraValues] = useState<Record<ChakraType, number>>({
    Root: 5,
    Sacral: 5,
    SolarPlexus: 5,
    Heart: 5,
    Throat: 5,
    ThirdEye: 5,
    Crown: 5
  });
  const [coreIntention, setCoreIntention] = useState('');
  const [elementalResonance, setElementalResonance] = useState('');
  const [emotionalProfile, setEmotionalProfile] = useState('');
  const [shadowFrequencies, setShadowFrequencies] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    'Core Intention',
    'Chakra Signature',
    'Elemental Resonance',
    'Emotional Profile',
    'Shadow Frequencies',
    'Birth Data',
    'Review',
  ];
  
  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };
  
  const handleChakraChange = (chakra: ChakraType, value: number) => {
    setChakraValues(prev => ({
      ...prev,
      [chakra]: value
    }));
    
    // Set active chakra to the one being adjusted
    activateChakra(chakra);
  };
  
  const getDominantChakra = (): ChakraType => {
    let maxValue = -1;
    let dominantChakra: ChakraType = 'Heart'; // Default
    
    Object.entries(chakraValues).forEach(([chakra, value]) => {
      if (value > maxValue) {
        maxValue = value;
        dominantChakra = chakra as ChakraType;
      }
    });
    
    return dominantChakra;
  };
  
  const calculateLifePath = (birthdate: string): number => {
    // Simple life path calculation - sum all digits and reduce to single digit
    const dateDigits = birthdate.split('-').join('').split('');
    let sum = dateDigits.reduce((acc, digit) => acc + parseInt(digit), 0);
    
    // Keep reducing until single digit (except master numbers 11, 22, 33)
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    
    return sum;
  };
  
  const handleSubmitBlueprint = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const dominantChakra = getDominantChakra();
      const lifePath = calculateLifePath(birthdate);
      
      // Create the blueprint
      const { data: blueprint, error: blueprintError } = await supabase
        .from('sacred_blueprints')
        .insert([
          {
            user_id: user.id,
            core_frequency: chakraFrequencies[dominantChakra],
            elemental_resonance: elementalResonance,
            chakra_signature: chakraValues,
            emotional_profile: emotionalProfile,
            shadow_frequencies: shadowFrequencies,
            blueprint_text: `Life Path ${lifePath} - ${dominantChakra} Chakra Dominant`,
          }
        ])
        .select()
        .single();
        
      if (blueprintError) throw blueprintError;
      
      // Generate a default sigil
      const sigilSvg = generateDemoSigilSvg(dominantChakra, coreIntention);
      
      const { data: sigil, error: sigilError } = await supabase
        .from('fractal_glyphs')
        .insert([
          {
            user_id: user.id,
            parameters: {
              frequency: chakraFrequencies[dominantChakra],
              chakra: dominantChakra,
              intention: coreIntention,
              prime_multiplier: Math.floor(Math.random() * 10) + 1,
              numerology_profile: {
                lifePath,
                expression: Math.floor(Math.random() * 9) + 1,
                soulUrge: Math.floor(Math.random() * 9) + 1,
                baseForm: 'circle',
                overlay: 'triangle',
                ornamentation: 'fractal'
              },
              svg: sigilSvg
            }
          }
        ])
        .select()
        .single();
        
      if (sigilError) throw sigilError;
      
      // Log to continuum_sessions
      await supabase
        .from('continuum_sessions')
        .insert([
          {
            user_id: user.id,
            session_type: 'blueprint_creation',
            xp_awarded: 50,
            chakra: dominantChakra,
            frequency: chakraFrequencies[dominantChakra],
            timestamp: new Date().toISOString()
          }
        ]);
      
      // Mark onboarding as completed
      await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          chakra_highlight: dominantChakra
        })
        .eq('id', user.id);
      
      // Award XP
      await addXP(50);
      
      // Refresh profile
      await refreshProfile();
      
      // Unlock "The Fool" journey
      await supabase
        .from('tarot_module_progress')
        .insert([
          {
            user_id: user.id,
            tarot_key: 'the-fool',
            status: 'unlocked'
          }
        ]);
      
      // Navigate to Digital Baptism
      navigate('/digital-baptism');
      
    } catch (error) {
      console.error('Error submitting blueprint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Core Intention
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Set Your Core Intention</h2>
            <p className="mb-4 text-gray-600">
              Your core intention anchors your spiritual journey and influences your soul's expression. 
              What spiritual quality do you wish to embody or develop?
            </p>
            
            <div className="mb-4">
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 'Inner Peace', 'Creative Flow', 'Divine Connection'"
                value={coreIntention}
                onChange={(e) => setCoreIntention(e.target.value)}
                maxLength={50}
              ></textarea>
              <div className="text-xs text-right text-gray-500 mt-1">
                {coreIntention.length}/50
              </div>
            </div>
          </div>
        );
        
      case 1: // Chakra Signature
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Chakra Signature Survey</h2>
            <p className="mb-6 text-gray-600">
              Rate the strength of each chakra on a scale from 1-10. This helps create your unique chakra signature.
            </p>
            
            <div className="space-y-6">
              {(Object.keys(chakraValues) as ChakraType[]).map(chakra => (
                <div key={chakra} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <ChakraBadge chakra={chakra} />
                    <span className="text-gray-500 text-sm">
                      {chakraValues[chakra]}
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={chakraValues[chakra]}
                    onChange={(e) => handleChakraChange(chakra, parseInt(e.target.value))}
                    className="w-full"
                    style={{ 
                      accentColor: chakraColors[chakra] 
                    }}
                  />
                  
                  <div className="text-xs flex justify-between">
                    <span>Blocked</span>
                    <span>Balanced</span>
                    <span>Amplified</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-md">
              <div className="font-medium text-gray-800">Your Dominant Chakra:</div>
              <ChakraBadge chakra={getDominantChakra()} size="lg" />
            </div>
          </div>
        );
        
      case 2: // Elemental Resonance
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Elemental Resonance</h2>
            <p className="mb-4 text-gray-600">
              Which elemental energy do you feel most connected to? This influences the expression of your soul sigil.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {['Earth', 'Air', 'Fire', 'Water', 'Ether'].map(element => (
                <button
                  key={element}
                  className={`p-4 rounded-lg border ${
                    elementalResonance === element
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setElementalResonance(element)}
                >
                  {element}
                </button>
              ))}
            </div>
          </div>
        );
        
      case 3: // Emotional Profile
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Emotional Profile</h2>
            <p className="mb-4 text-gray-600">
              Describe your emotional landscape. What emotions are most prevalent in your life recently?
            </p>
            
            <div className="mb-4">
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 'Lately I've been feeling...' or 'I tend to experience...'"
                value={emotionalProfile}
                onChange={(e) => setEmotionalProfile(e.target.value)}
              ></textarea>
            </div>
          </div>
        );
        
      case 4: // Shadow Frequencies
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Shadow Frequencies</h2>
            <p className="mb-4 text-gray-600">
              What aspects of yourself do you find challenging or tend to hide? These shadow frequencies help create a balanced sigil.
            </p>
            
            <div className="mb-4">
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 'I struggle with...' or 'I tend to avoid...'"
                value={shadowFrequencies}
                onChange={(e) => setShadowFrequencies(e.target.value)}
              ></textarea>
            </div>
          </div>
        );
        
      case 5: // Birth Data
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Birth Information</h2>
            <p className="mb-4 text-gray-600">
              Your birth data helps calculate your numerological profile, which influences your soul sigil.
            </p>
            
            <div className="mb-4">
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date
              </label>
              <input
                type="date"
                id="birthdate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </div>
            
            {birthdate && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-md">
                <div className="font-medium text-gray-800">Your Life Path Number:</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {calculateLifePath(birthdate)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your Life Path Number reveals your life's purpose and the path you'll walk.
                </p>
              </div>
            )}
          </div>
        );
        
      case 6: // Review
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review Your Soul Blueprint</h2>
            <p className="mb-6 text-gray-600">
              Review the information for your Soul Blueprint. This will be used to generate your unique Soul Sigil.
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Core Intention</h3>
                <p className="text-gray-600">{coreIntention || 'Not specified'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Dominant Chakra</h3>
                <ChakraBadge chakra={getDominantChakra()} />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Elemental Resonance</h3>
                <p className="text-gray-600">{elementalResonance || 'Not specified'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Life Path Number</h3>
                <p className="text-gray-600">{birthdate ? calculateLifePath(birthdate) : 'Not calculated'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Birth Date</h3>
                <p className="text-gray-600">
                  {birthdate ? new Date(birthdate).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const isStepComplete = () => {
    switch (currentStep) {
      case 0: // Core Intention
        return coreIntention.trim().length > 0;
      case 1: // Chakra Signature
        return Object.values(chakraValues).some(value => value > 0);
      case 2: // Elemental Resonance
        return elementalResonance.trim().length > 0;
      case 3: // Emotional Profile
        return emotionalProfile.trim().length > 0;
      case 4: // Shadow Frequencies
        return shadowFrequencies.trim().length > 0;
      case 5: // Birth Data
        return birthdate.trim().length > 0;
      case 6: // Review
        return true;
      default:
        return false;
    }
  };
  
  const generateDemoSigilSvg = (chakra: ChakraType, intention: string): string => {
    // This is a placeholder function that generates simple SVG sigils
    // In a real app, this would be much more sophisticated
    
    // Generate a seed from the intention text
    const seed = intention.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate random paths based on seed and chakra
    const numPaths = 5 + (seed % 5);
    let paths = '';
    
    for (let i = 0; i < numPaths; i++) {
      const radius = 40 + (seed + i) % 20;
      const startAngle = (seed + i * 30) % 360;
      const endAngle = (startAngle + 120 + (seed % 120)) % 360;
      
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = 50 + radius * Math.cos(startRad);
      const y1 = 50 + radius * Math.sin(startRad);
      const x2 = 50 + radius * Math.cos(endRad);
      const y2 = 50 + radius * Math.sin(endRad);
      
      paths += `<path d="M 50,50 L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z" 
                fill="none" stroke="${chakraColors[chakra]}" stroke-width="${1 + (i % 3)}" />`;
    }
    
    // Add a circle in the center
    paths += `<circle cx="50" cy="50" r="${10 + (seed % 10)}" 
               fill="${chakraColors[chakra]}30" stroke="${chakraColors[chakra]}" stroke-width="1" />`;
    
    // Create the final SVG
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${paths}</svg>`;
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Soul Blueprint Creation</h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index < currentStep 
                    ? 'bg-indigo-500 text-white' 
                    : index === currentStep
                    ? 'bg-indigo-100 text-indigo-500 border border-indigo-500' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="hidden md:block ml-2 text-xs text-gray-500">
                  {step}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden sm:block w-12 h-0.5 bg-gray-200"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Step content */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 ${
            currentStep === 0
              ? 'bg-gray-100 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          Back
        </button>
        
        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNextStep}
            disabled={!isStepComplete()}
            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isStepComplete()
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-indigo-300 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitBlueprint}
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isSubmitting
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Creating...
              </>
            ) : (
              'Create Blueprint & Sigil'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Color mapping for chakras
const chakraColors: Record<ChakraType, string> = {
  Root: '#FF0000',
  Sacral: '#FF8C00',
  SolarPlexus: '#FFFF00',
  Heart: '#00FF00',
  Throat: '#00BFFF',
  ThirdEye: '#4B0082',
  Crown: '#9400D3'
};

// Frequency mapping for chakras
const chakraFrequencies: Record<ChakraType, number> = {
  Root: 396,
  Sacral: 417,
  SolarPlexus: 528,
  Heart: 639,
  Throat: 741,
  ThirdEye: 852,
  Crown: 963
};

export default BlueprintPage;