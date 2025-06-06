import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Flower } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import { ChakraType } from '../types';

const EmpressPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP } = useXP();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [creationIdea, setCreationIdea] = useState('');
  const [seasonalState, setSeasonalState] = useState('');
  const [bodyReflection, setBodyReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    'The Empress Introduction',
    'Creative Manifestation',
    'Seasonal Awareness',
    'Body Connection',
    'Complete Journey',
  ];
  
  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    if (currentStep === 0) {
      // Activate the Heart chakra when starting The Empress journey
      activateChakra('Heart', 'empress_journey');
    }
  };
  
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };
  
  const completeJourney = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Generate a sigil for the Empress journey
      const sigilSvg = generateDemoSigilSvg('Heart', creationIdea);
      
      // Save the generated sigil
      const { data: sigil, error: sigilError } = await supabase
        .from('fractal_glyphs')
        .insert([
          {
            user_id: user.id,
            parameters: {
              frequency: chakraFrequencies['Heart'],
              chakra: 'Heart',
              intention: creationIdea,
              archetypeKey: 'The Empress',
              prime_multiplier: Math.floor(Math.random() * 10) + 1,
              numerology_profile: {
                lifePath: 3, // The Empress is associated with number 3
                expression: Math.floor(Math.random() * 9) + 1,
                soulUrge: Math.floor(Math.random() * 9) + 1,
                baseForm: 'circle',
                overlay: 'triangle',
                ornamentation: 'floral'
              },
              svg: sigilSvg
            }
          }
        ])
        .select()
        .single();
        
      if (sigilError) throw sigilError;
      
      // Log the Empress session
      const { error: empressError } = await supabase
        .from('empress_sessions')
        .insert([
          {
            user_id: user.id,
            creation_idea: creationIdea,
            seasonal_state: seasonalState,
            body_reflection: bodyReflection,
            generated_sigil: sigil.id,
            frequency: chakraFrequencies['Heart'],
            archetype_drawn: 'The Empress'
          }
        ]);
        
      if (empressError) throw empressError;
      
      // Log to continuum_sessions
      await supabase
        .from('continuum_sessions')
        .insert([
          {
            user_id: user.id,
            session_type: 'empress-session',
            xp_awarded: 100,
            chakra: 'Heart',
            frequency: chakraFrequencies['Heart'],
            tarot_archetype: 'The Empress',
            timestamp: new Date().toISOString()
          }
        ]);
      
      // Update tarot module progress
      await supabase
        .from('tarot_module_progress')
        .update({ status: 'completed', completion_date: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('tarot_key', 'the-empress');
      
      // Award XP
      await addXP(100);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error completing The Empress journey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Introduction
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">The Empress Archetype</h2>
            <div className="mb-6 text-gray-600">
              <p className="mb-3">
                The Empress represents the divine feminine, abundance, creativity, and nurturing energy.
                She is the mother archetype, connected to Venus and the number 3, symbolizing creation and growth.
              </p>
              <p>
                This journey will guide you through an energetic connection with The Empress archetype,
                helping you embrace your creative power and connection to the natural world.
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <div className="text-green-800 font-medium mb-2">Key Themes:</div>
              <ul className="space-y-1 text-green-700">
                <li>• Abundance and nurturing</li>
                <li>• Creative manifestation</li>
                <li>• Fertility and growth</li>
                <li>• Connection to nature and the body</li>
                <li>• The Hebrew letter Daleth (ד) - Door of life</li>
              </ul>
            </div>
          </div>
        );
        
      case 1: // Creative Manifestation
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Creative Manifestation</h2>
            <p className="mb-6 text-gray-600">
              The Empress teaches us to trust in our creative abilities and the abundance of the universe.
              What creative idea or project would you like to manifest in your life?
            </p>
            
            <div className="mb-4">
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe a creative project, idea, or aspect of abundance you wish to nurture and manifest..."
                value={creationIdea}
                onChange={(e) => setCreationIdea(e.target.value)}
                maxLength={200}
              ></textarea>
              <div className="text-xs text-right text-gray-500 mt-1">
                {creationIdea.length}/200
              </div>
            </div>
          </div>
        );
        
      case 2: // Seasonal Awareness
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Seasonal Awareness</h2>
            <p className="mb-6 text-gray-600">
              The Empress is deeply connected to the cycles of nature and the seasons.
              Which season do you feel most resonates with your current life phase?
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {['Spring', 'Summer', 'Autumn', 'Winter'].map(season => (
                <button
                  key={season}
                  className={`p-4 rounded-lg border ${
                    seasonalState === season
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSeasonalState(season)}
                >
                  {season}
                </button>
              ))}
            </div>
            
            {seasonalState && (
              <div className="mt-4 p-3 bg-green-50 rounded-md text-green-800">
                {seasonalState === 'Spring' && "Spring represents new beginnings, growth, and planting seeds for the future."}
                {seasonalState === 'Summer' && "Summer embodies abundance, fullness, and the height of creative energy."}
                {seasonalState === 'Autumn' && "Autumn symbolizes harvest, gratitude, and beginning to turn inward."}
                {seasonalState === 'Winter' && "Winter reflects rest, gestation, and the quiet nurturing of inner resources."}
              </div>
            )}
          </div>
        );
        
      case 3: // Body Connection
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Body Connection</h2>
            <p className="mb-6 text-gray-600">
              The Empress invites us to honor our physical bodies as sacred vessels of creation.
              Take a moment to reflect on your relationship with your body and how it supports your creative energy.
            </p>
            
            <div className="mb-4">
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Reflect on how your body feels, what it needs, and how you can honor it as a sacred vessel..."
                value={bodyReflection}
                onChange={(e) => setBodyReflection(e.target.value)}
              ></textarea>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-800 text-sm">
                <p className="font-medium mb-2">Empress Body Wisdom:</p>
                <p>Your body is the garden where your creativity blooms. By honoring your physical needs - rest, nourishment, pleasure, movement - you create fertile ground for your creative seeds to grow.</p>
              </div>
            </div>
          </div>
        );
        
      case 4: // Complete Journey
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Complete Your Empress Journey</h2>
            <p className="mb-6 text-gray-600">
              You have connected with The Empress's energy of abundance and creation.
              A Seed of Creation sigil will be generated based on your inputs.
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Your Creative Manifestation</h3>
                <p className="text-gray-600">{creationIdea}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Your Seasonal Resonance</h3>
                <p className="text-gray-600">{seasonalState}</p>
              </div>
              
              {bodyReflection && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-800">Your Body Reflection</h3>
                  <p className="text-gray-600">{bodyReflection}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-md">
              <p className="text-green-800">
                Completing this journey will award you <span className="font-bold">100 XP</span> and create a Seed of Creation sigil attuned to your creative energy.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const isStepComplete = () => {
    switch (currentStep) {
      case 0: // Introduction
        return true;
      case 1: // Creative Manifestation
        return creationIdea.trim().length > 0;
      case 2: // Seasonal Awareness
        return seasonalState !== '';
      case 3: // Body Connection
        return true; // Body reflection is optional
      case 4: // Complete
        return true;
      default:
        return false;
    }
  };
  
  // Function to generate a demo sigil SVG
  const generateDemoSigilSvg = (chakra: ChakraType, intention: string): string => {
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
    
    // Add a flower-like pattern in the center for The Empress
    const petalCount = 6;
    const petalSize = 15 + (seed % 10);
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * 360 / petalCount) * (Math.PI / 180);
      const x = 50 + Math.cos(angle) * petalSize;
      const y = 50 + Math.sin(angle) * petalSize;
      
      paths += `<path d="M 50,50 Q ${50 + Math.cos(angle + 0.3) * petalSize * 1.5},${50 + Math.sin(angle + 0.3) * petalSize * 1.5} ${x},${y} T 50,50" 
                fill="${chakraColors[chakra]}30" stroke="${chakraColors[chakra]}" stroke-width="1" />`;
    }
    
    // Add a circle in the center
    paths += `<circle cx="50" cy="50" r="${5 + (seed % 5)}" 
               fill="${chakraColors[chakra]}50" stroke="${chakraColors[chakra]}" stroke-width="1.5" />`;
    
    // Create the final SVG
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${paths}</svg>`;
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">The Empress Journey</h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index < currentStep 
                    ? 'bg-green-500 text-white' 
                    : index === currentStep
                    ? 'bg-green-100 text-green-500 border border-green-500' 
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
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-green-300 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          >
            Continue
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={completeJourney}
            disabled={!isStepComplete() || isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isStepComplete() && !isSubmitting
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-green-300 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Completing...
              </>
            ) : (
              'Complete Journey'
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

export default EmpressPage;