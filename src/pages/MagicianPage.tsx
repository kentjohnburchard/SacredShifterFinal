import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Wand2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const MagicianPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP } = useXP();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [intention, setIntention] = useState('');
  const [selectedElement, setSelectedElement] = useState('');
  const [ritualDescription, setRitualDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    'Introduction',
    'Set Intention',
    'Elemental Power',
    'Create Ritual',
    'Complete Journey',
  ];
  
  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    if (currentStep === 0) {
      // Activate the Throat chakra when starting The Magician journey
      activateChakra('Throat', 'magician_journey');
    }
  };
  
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };
  
  const completeJourney = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Generate a sigil for the Magician journey
      const sigilSvg = generateMagicianSigilSvg('Throat', intention);
      
      // Save the generated sigil
      const { data: sigil, error: sigilError } = await supabase
        .from('fractal_glyphs')
        .insert([
          {
            user_id: user.id,
            parameters: {
              frequency: chakraFrequencies['Throat'],
              chakra: 'Throat',
              intention: intention,
              archetypeKey: 'The Magician',
              prime_multiplier: Math.floor(Math.random() * 10) + 1,
              numerology_profile: {
                lifePath: 1, // The Magician is associated with number 1
                expression: Math.floor(Math.random() * 9) + 1,
                soulUrge: Math.floor(Math.random() * 9) + 1,
                baseForm: 'circle',
                overlay: 'triangle',
                ornamentation: 'magical'
              },
              svg: sigilSvg
            }
          }
        ])
        .select()
        .single();
        
      if (sigilError) throw sigilError;
      
      // Log the Magician session
      const { error: magicianError } = await supabase
        .from('magician_sessions')
        .insert([
          {
            user_id: user.id,
            intention: intention,
            element: selectedElement,
            ritual_description: ritualDescription,
            generated_sigil: sigil.id,
            frequency: chakraFrequencies['Throat'],
            archetype_drawn: 'The Magician'
          }
        ]);
        
      if (magicianError) throw magicianError;
      
      // Log to continuum_sessions
      await supabase
        .from('continuum_sessions')
        .insert([
          {
            user_id: user.id,
            session_type: 'magician-session',
            xp_awarded: 85,
            chakra: 'Throat',
            frequency: chakraFrequencies['Throat'],
            tarot_archetype: 'The Magician',
            timestamp: new Date().toISOString()
          }
        ]);
      
      // Create or update tarot module progress
      const { data: existingProgress } = await supabase
        .from('tarot_module_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('tarot_key', 'the-magician')
        .single();
        
      if (existingProgress) {
        // Update existing progress
        await supabase
          .from('tarot_module_progress')
          .update({ status: 'completed', completion_date: new Date().toISOString() })
          .eq('id', existingProgress.id);
      } else {
        // Create new progress entry
        await supabase
          .from('tarot_module_progress')
          .insert([
            {
              user_id: user.id,
              tarot_key: 'the-magician',
              status: 'completed',
              completion_date: new Date().toISOString()
            }
          ]);
      }
      
      // Award XP
      await addXP(85);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error completing The Magician journey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Introduction
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">The Magician's Journey</h2>
            <div className="mb-6 text-gray-600">
              <p className="mb-3">
                The Magician represents manifestation, focused intention, and the bridge between spiritual and material realms.
                As the number One in the Major Arcana, the Magician symbolizes new beginnings with purpose and direction.
              </p>
              <p>
                This journey will connect you with The Magician's energy, enhancing your ability to channel higher forces
                and manifest your intentions through focused will and action.
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="text-blue-800 font-medium mb-2">Key Themes:</div>
              <ul className="space-y-1 text-blue-700">
                <li>• Manifestation and focused will</li>
                <li>• Skill and mastery of elements</li>
                <li>• Bridging heaven and earth</li>
                <li>• The power of intention</li>
                <li>• The Hebrew letter Beth (ב) - The house or vessel</li>
              </ul>
            </div>
          </div>
        );
        
      case 1: // Set Intention
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Set Your Magician's Intention</h2>
            <p className="mb-6 text-gray-600">
              The Magician teaches that focused intention is the first step in manifestation.
              What do you wish to manifest or bring into reality through your will?
            </p>
            
            <div className="mb-4">
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 'I manifest creative abundance' or 'I channel divine wisdom into practical skills'"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                maxLength={150}
              ></textarea>
              <div className="text-xs text-right text-gray-500 mt-1">
                {intention.length}/150
              </div>
            </div>
          </div>
        );
        
      case 2: // Elemental Power
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose Your Elemental Power</h2>
            <p className="mb-6 text-gray-600">
              The Magician has mastery over the four elemental powers. Which element resonates most
              strongly with your intention and current path?
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'fire', name: 'Fire', desc: 'Transformation, passion, and energy' },
                { id: 'water', name: 'Water', desc: 'Emotions, intuition, and flow' },
                { id: 'air', name: 'Air', desc: 'Intellect, communication, and ideas' },
                { id: 'earth', name: 'Earth', desc: 'Manifestation, stability, and growth' }
              ].map(element => (
                <button
                  key={element.id}
                  className={`p-4 rounded-lg border flex flex-col items-center ${
                    selectedElement === element.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="text-xl font-semibold mb-2">{element.name}</div>
                  <div className="text-sm text-gray-500">{element.desc}</div>
                </button>
              ))}
            </div>
            
            {selectedElement && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-800">
                {selectedElement === 'fire' && "Fire represents transformation, passion, and creative energy. Use it to bring vitality to your intentions."}
                {selectedElement === 'water' && "Water embodies intuition, emotion, and adaptability. It helps you flow around obstacles and connect with deeper wisdom."}
                {selectedElement === 'air' && "Air governs intellect, communication, and ideas. It will help you articulate and clarify your intentions."}
                {selectedElement === 'earth' && "Earth is the realm of manifestation, stability, and growth. It grounds your intentions into physical reality."}
              </div>
            )}
          </div>
        );
        
      case 3: // Create Ritual
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Design Your Magician's Ritual</h2>
            <p className="mb-6 text-gray-600">
              The Magician works through ritual action, turning intention into reality through symbolic gestures.
              Describe a simple ritual you can perform to activate your intention with the chosen element.
            </p>
            
            <div className="mb-4">
              <textarea
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe a simple ritual practice using your chosen element that you can perform regularly (e.g., lighting a candle, placing stones in a pattern, using specific words or movements...)"
                value={ritualDescription}
                onChange={(e) => setRitualDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-800 text-sm">
                <p className="font-medium mb-2">Ritual Components:</p>
                <ul className="space-y-1">
                  <li>• Clear intention stated with conviction</li>
                  <li>• Symbolic object representing your goal</li>
                  <li>• Element-based action or focus</li>
                  <li>• Gesture to mark beginning and end</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      case 4: // Complete Journey
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Complete Your Magician's Journey</h2>
            <p className="mb-6 text-gray-600">
              You have connected with The Magician's energy of manifestation and skilled action.
              A Manifestation Sigil will be generated based on your inputs.
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Your Intention</h3>
                <p className="text-gray-600">{intention}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Your Elemental Power</h3>
                <p className="text-gray-600">{selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1)}</p>
              </div>
              
              {ritualDescription && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-800">Your Ritual Practice</h3>
                  <p className="text-gray-600">{ritualDescription}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800">
                Completing this journey will award you <span className="font-bold">85 XP</span> and create a Manifestation Sigil attuned to your magical intention.
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
      case 1: // Intention
        return intention.trim().length > 0;
      case 2: // Elemental Power
        return selectedElement !== '';
      case 3: // Ritual
        return ritualDescription.trim().length > 0;
      case 4: // Complete
        return true;
      default:
        return false;
    }
  };
  
  // Function to generate a demo sigil SVG for The Magician
  const generateMagicianSigilSvg = (chakra: 'Throat', intention: string): string => {
    // Generate a seed from the intention text
    const seed = intention.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Choose colors based on chakra
    const primaryColor = chakraColors[chakra];
    const secondaryColor = '#3B82F6'; // Blue for The Magician
    
    // Generate paths for the sigil
    let paths = '';
    
    // Add central star/pentagram - representing The Magician's mastery
    const starPoints = 5;
    const outerRadius = 40;
    const innerRadius = 20;
    
    let starPath = '<path d="M';
    
    for (let i = 0; i < starPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / starPoints) * i;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      
      if (i === 0) {
        starPath += `${x},${y} `;
      } else {
        starPath += `L ${x},${y} `;
      }
    }
    
    starPath += 'Z" fill="none" stroke="' + primaryColor + '" stroke-width="1.5" />';
    paths += starPath;
    
    // Add a circle representing infinity/wholeness
    paths += `<circle cx="50" cy="50" r="${outerRadius + 5}" 
               fill="none" stroke="${secondaryColor}" stroke-width="1" stroke-dasharray="3,3" />`;
    
    // Add elemental symbols based on seed
    const symbols = Math.floor(seed % 4) + 3; // 3 to 6 symbols
    
    for (let i = 0; i < symbols; i++) {
      const angle = (i * 2 * Math.PI / symbols) + (Math.PI / 6);
      const radius = innerRadius + 25;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      const size = 8 + (i % 3) * 2;
      
      // Add symbol
      paths += `<circle cx="${x}" cy="${y}" r="${size}" 
                 fill="${secondaryColor}30" stroke="${primaryColor}" stroke-width="1" />`;
      
      // Connect to center
      paths += `<line x1="50" y1="50" x2="${x}" y2="${y}" 
                 stroke="${primaryColor}70" stroke-width="0.5" />`;
    }
    
    // Add the magician's wand (line with dots at ends)
    const wandAngle = seed % 360 * (Math.PI / 180);
    const wandLength = 35;
    const x1 = 50 + Math.cos(wandAngle) * wandLength;
    const y1 = 50 + Math.sin(wandAngle) * wandLength;
    const x2 = 50 + Math.cos(wandAngle + Math.PI) * wandLength;
    const y2 = 50 + Math.sin(wandAngle + Math.PI) * wandLength;
    
    paths += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
               stroke="${secondaryColor}" stroke-width="1.5" />`;
    paths += `<circle cx="${x1}" cy="${y1}" r="3" fill="${primaryColor}" />`;
    paths += `<circle cx="${x2}" cy="${y2}" r="3" fill="${primaryColor}" />`;
    
    // Add a subtle glow in the center
    paths += `<circle cx="50" cy="50" r="10" fill="${primaryColor}30" />`;
    
    // Create the final SVG
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${paths}</svg>`;
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">The Magician's Journey</h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index < currentStep 
                    ? 'bg-blue-500 text-white' 
                    : index === currentStep
                    ? 'bg-blue-100 text-blue-500 border border-blue-500' 
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
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-300 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
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
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-300 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isSubmitting ? (
              <>
                <motion.span 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block mr-2"
                >
                  ⟳
                </motion.span>
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
const chakraColors: Record<string, string> = {
  Root: '#FF0000',
  Sacral: '#FF8C00',
  SolarPlexus: '#FFFF00',
  Heart: '#00FF00',
  Throat: '#00BFFF',
  ThirdEye: '#4B0082',
  Crown: '#9400D3'
};

// Frequency mapping for chakras
const chakraFrequencies: Record<string, number> = {
  Root: 396,
  Sacral: 417,
  SolarPlexus: 528,
  Heart: 639,
  Throat: 741,
  ThirdEye: 852,
  Crown: 963
};

export default MagicianPage;