import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Mic, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';

const TheFoolPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP } = useXP();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [intention, setIntention] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasCompletedVoice, setHasCompletedVoice] = useState(false);
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    'Introduction',
    'Set Intention',
    'Voice Activation',
    'Reflection',
    'Complete Journey',
  ];
  
  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };
  
  const startRecording = () => {
    setIsRecording(true);
    
    // Simulate voice recording for demo
    setTimeout(() => {
      setIsRecording(false);
      setHasCompletedVoice(true);
    }, 3000);
  };
  
  const completeJourney = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Activate the Crown chakra for this journey
      activateChakra('Crown', 'the_fool_journey');
      
      // Update tarot module progress
      const { data: tarotProgress, error: tarotError } = await supabase
        .from('tarot_module_progress')
        .update({ status: 'completed', completion_date: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('tarot_key', 'the-fool')
        .select()
        .single();
        
      if (tarotError) throw tarotError;
      
      // Log to continuum_sessions
      await supabase
        .from('continuum_sessions')
        .insert([
          {
            user_id: user.id,
            session_type: 'tarot-the-fool',
            xp_awarded: 75,
            chakra: 'Crown',
            frequency: chakraState.frequency,
            tarot_archetype: 'The Fool',
            timestamp: new Date().toISOString()
          }
        ]);
      
      // Save reflection if provided
      if (reflection.trim()) {
        await supabase
          .from('tarot_reflections')
          .insert([
            {
              user_id: user.id,
              tarot_progress_id: tarotProgress.id,
              tarot_key: 'the-fool',
              question: 'What does The Fool\'s journey mean to you?',
              answer: reflection
            }
          ]);
      }
      
      // Award XP
      await addXP(75);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error completing The Fool journey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Introduction
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">The Fool's Journey</h2>
            <div className="mb-6 text-gray-600">
              <p className="mb-3">
                The Fool represents the beginning of all possibility, the number Zero, unlimited potential.
                As you embark on this journey, you step into the energy of pure potential, ready to take a leap of faith.
              </p>
              <p>
                This journey will guide you through an energetic connection with The Fool archetype, helping
                you embrace new beginnings with courage and innocence.
              </p>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg mb-6">
              <div className="text-indigo-800 font-medium mb-2">Key Themes:</div>
              <ul className="space-y-1 text-indigo-700">
                <li>• New beginnings and spontaneity</li>
                <li>• Innocent optimism and faith</li>
                <li>• Stepping into the unknown</li>
                <li>• Freedom from constraints</li>
                <li>• The letter Aleph (א) - The breath of creation</li>
              </ul>
            </div>
          </div>
        );
        
      case 1: // Set Intention
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Set Your Intention</h2>
            <p className="mb-6 text-gray-600">
              Your intention shapes your journey with The Fool. What aspect of new beginnings
              or spontaneity are you seeking to embrace in your life?
            </p>
            
            <div className="mb-4">
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 'I am open to new possibilities' or 'I embrace the unknown with courage and trust'"
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
        
      case 2: // Voice Activation
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Voice Activation</h2>
            <p className="mb-6 text-gray-600">
              The Fool is connected to the Hebrew letter Aleph (א), representing the breath of creation.
              Speak the sacred sound "Aleph" to activate this energy within you.
            </p>
            
            <div className="bg-indigo-50 p-6 rounded-lg mb-6 flex flex-col items-center">
              <div className="text-5xl font-serif text-indigo-600 mb-4">א</div>
              <p className="text-indigo-800 text-center mb-6">
                Aleph - The first letter of the Hebrew alphabet, representing oneness and the breath of life.
              </p>
              
              <button
                onClick={startRecording}
                disabled={isRecording || hasCompletedVoice}
                className={`flex items-center justify-center p-4 rounded-full ${
                  isRecording
                    ? 'bg-red-500 animate-pulse'
                    : hasCompletedVoice
                    ? 'bg-green-500'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white shadow-lg mb-2`}
                style={{
                  width: '80px',
                  height: '80px',
                }}
              >
                {isRecording ? (
                  <div className="animate-pulse">
                    <div className="w-8 h-8 bg-white rounded-full opacity-75"></div>
                  </div>
                ) : hasCompletedVoice ? (
                  <Check size={32} />
                ) : (
                  <Mic size={32} />
                )}
              </button>
              
              <div className="text-sm text-gray-600">
                {isRecording
                  ? 'Speak "Aleph" now...'
                  : hasCompletedVoice
                  ? 'Voice activation complete!'
                  : 'Tap to record your voice'}
              </div>
            </div>
          </div>
        );
        
      case 3: // Reflection
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Journey Reflection</h2>
            <p className="mb-6 text-gray-600">
              Take a moment to reflect on what The Fool's journey means to you.
              How does this energy of new beginnings and unlimited potential resonate with your current life path?
            </p>
            
            <div className="mb-4">
              <textarea
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Share your reflections on The Fool's energy and what this journey has revealed to you..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              ></textarea>
            </div>
          </div>
        );
        
      case 4: // Complete Journey
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Complete Your Journey</h2>
            <p className="mb-6 text-gray-600">
              You have connected with The Fool's energy and taken the first step on your Tarot journey.
              This marks the beginning of your path through the Major Arcana.
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Your Intention</h3>
                <p className="text-gray-600">{intention}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Voice Activation</h3>
                <p className="text-gray-600">
                  {hasCompletedVoice ? 'Completed' : 'Not completed'}
                </p>
              </div>
              
              {reflection && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-800">Your Reflection</h3>
                  <p className="text-gray-600">{reflection}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-md">
              <p className="text-indigo-800">
                Completing this journey will award you <span className="font-bold">75 XP</span> and unlock the next arcanum on your path.
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
      case 2: // Voice Activation
        return hasCompletedVoice;
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">The Fool's Journey</h1>
      
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
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-indigo-300 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
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

export default TheFoolPage;