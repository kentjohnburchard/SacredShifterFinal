import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, ChevronRight, Check, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import SpiralVisualizer from '../components/visualizers/SpiralVisualizer';
import ChakraMeditationLibrary from '../components/meditation/ChakraMeditationLibrary';
import TattooButton from '../components/ui/TattooButton';

interface MeditationTrack {
  id: string;
  title: string;
  chakra: string;
  frequency_hz: number;
  description: string;
  file_url: string;
  is_guided: boolean;
  duration_minutes: number;
}

const HighPriestessPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP } = useXP();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MeditationTrack | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [meditationTime, setMeditationTime] = useState(0);
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    'Introduction',
    'Temple Entry',
    'Silent Meditation',
    'Reflection',
    'Complete Journey',
  ];

  // Activate Third Eye chakra on component mount
  useEffect(() => {
    activateChakra('ThirdEye', 'high_priestess_journey');
  }, []);
  
  // Timer for meditation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentStep === 2 && isAudioPlaying) {
      interval = setInterval(() => {
        setMeditationTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, isAudioPlaying]);
  
  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSelectTrack = (track: MeditationTrack) => {
    setSelectedTrack(track);
    setIsAudioPlaying(true);
    setShowLibrary(false);
  };

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };
  
  const completeJourney = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Log to high_priestess_sessions
      const { error: sessionError } = await supabase
        .from('high_priestess_sessions')
        .insert([
          {
            user_id: user.id,
            meditation_duration_seconds: meditationTime,
            reflection_text: reflection,
            chakra: 'ThirdEye',
            frequency: 852,
            track_id: selectedTrack?.id,
            intuition_score: Math.floor(Math.random() * 5) + 6 // Random 6-10 for demo
          }
        ]);
        
      if (sessionError) throw sessionError;
      
      // Update tarot module progress
      await supabase
        .from('tarot_module_progress')
        .insert([
          {
            user_id: user.id,
            tarot_key: 'the-high-priestess',
            status: 'completed',
            completion_date: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      // Log to continuum_sessions
      await supabase
        .from('continuum_sessions')
        .insert([
          {
            user_id: user.id,
            session_type: 'tarot-high-priestess',
            xp_awarded: 100,
            chakra: 'ThirdEye',
            frequency: 852,
            tarot_archetype: 'The High Priestess',
            timestamp: new Date().toISOString()
          }
        ]);
      
      // Award XP
      await addXP(100);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error completing High Priestess journey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Introduction
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">The High Priestess Journey</h2>
            <div className="mb-6 text-gray-300">
              <p className="mb-3">
                The High Priestess represents intuition, mystery, and the subconscious mind.
                She is the keeper of secrets and hidden knowledge, seated between the pillars of duality.
              </p>
              <p>
                This journey invites you to access your inner knowing and the wisdom that lies beneath 
                the surface of conscious thought. Through meditation and silence, you will connect with 
                the intuitive power of the High Priestess.
              </p>
            </div>
            
            <div className="bg-dark-100 p-4 rounded-lg mb-6 border border-dark-300">
              <div className="text-indigo-300 font-medium mb-2">Key Themes:</div>
              <ul className="space-y-1 text-indigo-200">
                <li>• Intuition and inner knowing</li>
                <li>• The subconscious mind</li>
                <li>• Mysteries and hidden knowledge</li>
                <li>• Duality and the space between</li>
                <li>• The Hebrew letter Gimel (ג) - The camel crossing worlds</li>
              </ul>
            </div>
          </div>
        );
        
      case 1: // Temple Entry
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Temple of the High Priestess</h2>
            
            <div className="prose prose-invert max-w-none mb-6">
              <p>Enter gently. This is a place beyond words.<br/>
              Let your breath be the key.</p>
              
              <p>Visualize a silver veil parting before you.<br/>
              Behind it, a temple lit only by moonlight and memory.</p>
              
              <p>There is no guide here but your own knowing.</p>
              
              <p>Sit. Breathe.<br/>
              A voice rises—not from outside you, but within.<br/>
              She whispers:</p>
              
              <p className="italic">"You already know. You always did."</p>
              
              <p>Linger here. Let the spiral draw you inward.<br/>
              Each breath deepens the silence.<br/>
              Each silence births a revelation.</p>
              
              <p>When you're ready to return, close the veil softly.<br/>
              But know—what you've seen will echo in all that comes next.</p>
            </div>
            
            <div className="bg-dark-100 p-4 rounded-lg mb-6 border border-dark-300">
              <div className="flex items-center justify-between mb-3">
                <div className="text-indigo-300 font-medium">Background Music:</div>
                
                {selectedTrack ? (
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm mr-3">
                      {selectedTrack.title} ({selectedTrack.frequency_hz}Hz)
                    </span>
                    <button 
                      onClick={toggleAudio}
                      className="p-2 rounded-full bg-dark-200"
                    >
                      {isAudioPlaying ? (
                        <VolumeX size={16} className="text-indigo-300" />
                      ) : (
                        <Volume2 size={16} className="text-indigo-300" />
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLibrary(true)}
                    className="text-sm text-indigo-300 hover:text-indigo-200 flex items-center"
                  >
                    <Volume2 size={16} className="mr-1" />
                    Select a track
                  </button>
                )}
              </div>
              
              {showLibrary && (
                <div className="mt-4">
                  <ChakraMeditationLibrary 
                    onSelectTrack={handleSelectTrack}
                    initialChakraFilter="third_eye"
                  />
                </div>
              )}
            </div>
          </div>
        );
        
      case 2: // Silent Meditation
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">The High Priestess Silent Meditation</h2>
            
            <div className="text-center mb-6">
              <div className="flex justify-center items-center">
                <div className="text-5xl font-serif text-indigo-300 mb-2">ג</div>
                <div className="mx-4 text-gray-400">•</div>
                <div className="font-medium text-indigo-300">Gimel - The Camel</div>
              </div>
              <p className="text-gray-300 mt-2">
                Meditating with the energy of the High Priestess, who carries us between worlds
              </p>
            </div>
            
            <div className="mb-6 p-4 rounded-lg border border-dark-300 bg-dark-100">
              <div className="flex justify-center mb-3">
                <div 
                  className="text-2xl font-mono font-bold px-4 py-1 rounded-lg"
                  style={{ color: chakraState.color }}
                >
                  {formatTime(meditationTime)}
                </div>
              </div>
              
              <div className="flex justify-center">
                {selectedTrack ? (
                  <button
                    onClick={toggleAudio}
                    className="flex items-center px-3 py-1.5 rounded-md"
                    style={{ 
                      backgroundColor: `${chakraState.color}20`,
                      color: chakraState.color
                    }}
                  >
                    {isAudioPlaying ? (
                      <>
                        <Pause size={16} className="mr-2" />
                        Pause Audio
                      </>
                    ) : (
                      <>
                        <Play size={16} className="mr-2" />
                        Resume Audio
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowLibrary(true)}
                    className="flex items-center px-3 py-1.5 rounded-md bg-dark-200 text-gray-300 hover:bg-dark-300"
                  >
                    <Volume2 size={16} className="mr-2" />
                    Select Background Audio
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-gray-300 mb-3">
              Sit in silence with the energy of the High Priestess. Allow your intuition to speak.
              Stay present with what arises, without judgment or analysis.
            </p>
            <p className="text-gray-400 text-sm">
              Recommended meditation duration: 5-10 minutes
            </p>
            
            {showLibrary && (
              <div className="mt-6">
                <ChakraMeditationLibrary 
                  onSelectTrack={handleSelectTrack}
                  initialChakraFilter="third_eye"
                />
              </div>
            )}
          </div>
        );
        
      case 3: // Reflection
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Priestess Reflection</h2>
            <p className="mb-6 text-gray-300">
              Take a moment to reflect on what arose during your meditation.
              What insights or feelings came through the silence? What did your intuition reveal?
            </p>
            
            <div className="mb-6">
              <textarea
                rows={6}
                className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                placeholder="Share your reflections from the Temple of the High Priestess..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              ></textarea>
            </div>
            
            <div className="p-4 rounded-lg border border-dark-300 bg-dark-100">
              <div className="text-indigo-300 font-medium mb-2">Reflection Prompts:</div>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• What images or symbols appeared to you during the meditation?</li>
                <li>• Was there a message or knowing that came through the silence?</li>
                <li>• How did you experience the energy of intuition?</li>
                <li>• What might the High Priestess be revealing to you about your current path?</li>
              </ul>
            </div>
          </div>
        );
        
      case 4: // Complete Journey
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Complete Your High Priestess Journey</h2>
            <p className="mb-6 text-gray-300">
              You have connected with the energy of the High Priestess and touched the wisdom of your inner knowing.
              This marks another step on your journey through the Major Arcana.
            </p>
            
            <div className="space-y-4">
              {meditationTime > 0 && (
                <div className="bg-dark-300 p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-1">Meditation Duration</h3>
                  <p className="text-gray-300">{formatTime(meditationTime)}</p>
                </div>
              )}
              
              {selectedTrack && (
                <div className="bg-dark-300 p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-1">Selected Track</h3>
                  <p className="text-gray-300">
                    {selectedTrack.title} ({selectedTrack.frequency_hz}Hz)
                  </p>
                </div>
              )}
              
              {reflection && (
                <div className="bg-dark-300 p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-1">Your Reflection</h3>
                  <p className="text-gray-300 whitespace-pre-line">{reflection}</p>
                </div>
              )}
            </div>
            
            <div 
              className="mt-6 p-4 rounded-lg"
              style={{ 
                backgroundColor: `${chakraState.color}15`,
                borderColor: `${chakraState.color}30`,
                borderWidth: '1px'
              }}
            >
              <p style={{ color: chakraState.color }}>
                Completing this journey will award you <span className="font-bold">100 XP</span> and strengthen your connection to your intuitive wisdom.
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
      case 1: // Temple Entry
        return true; // Optional to select audio
      case 2: // Silent Meditation
        return true; // No strict requirements
      case 3: // Reflection
        return true; // Reflection is optional
      case 4: // Complete
        return true;
      default:
        return false;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Moon className="mr-2" style={{ color: chakraState.color }} />
        Temple of the High Priestess
      </h1>
      
      {/* Visualization */}
      <div className="mb-6 rounded-2xl overflow-hidden border border-dark-300">
        <SpiralVisualizer 
          amplitudeA={1.1}
          amplitudeB={0.8}
          amplitudeC={1.2}
          freqA={2.4}
          freqB={3.3}
          freqC={4.6}
          lineColor={chakraState.color}
          height={200}
        />
      </div>
      
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index < currentStep 
                    ? 'bg-indigo-600 text-white' 
                    : index === currentStep
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-dark-300' 
                    : 'bg-gray-100 text-gray-400 dark:bg-dark-400 dark:text-gray-500'
                }`}>
                  {index < currentStep ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="hidden md:block ml-2 text-xs text-gray-400">
                  {step}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden sm:block w-12 h-0.5 bg-dark-400"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Step content */}
      <div className="bg-dark-200 p-6 rounded-2xl shadow-chakra-glow border border-dark-300 mb-6">
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-2xl ${
            currentStep === 0
              ? 'border-dark-500 bg-dark-400 text-gray-600 cursor-not-allowed'
              : 'border-dark-400 bg-dark-300 text-gray-300 hover:bg-dark-400'
          }`}
        >
          Back
        </button>
        
        {currentStep < steps.length - 1 ? (
          <TattooButton
            onClick={handleNextStep}
            disabled={!isStepComplete()}
            chakraColor={chakraState.color}
          >
            Continue
            <ChevronRight className="ml-1 h-4 w-4" />
          </TattooButton>
        ) : (
          <TattooButton
            onClick={completeJourney}
            disabled={isSubmitting}
            chakraColor={chakraState.color}
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
          </TattooButton>
        )}
      </div>
    </div>
  );
};

export default HighPriestessPage;