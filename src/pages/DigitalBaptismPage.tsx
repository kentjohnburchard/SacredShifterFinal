import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Wind, Droplet, Star, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';

const DigitalBaptismPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP } = useXP();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [waterType, setWaterType] = useState('');
  const [intention, setIntention] = useState('');
  const [breathCycles, setBreathCycles] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [hasCompletedVoice, setHasCompletedVoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    'Choose Water Type',
    'Set Intention',
    'Breath Practice',
    'Voice Activation',
    'Complete Ritual',
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
  
  const completeBaptism = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Activate the Crown chakra for this ritual
      activateChakra('Crown', 'digital_baptism');
      
      // Record baptism session
      const { data: baptism, error: baptismError } = await supabase
        .from('digital_baptism_sessions')
        .insert([
          {
            user_id: user.id,
            timestamp: new Date().toISOString(),
            water_type: waterType,
            breath_cycles: breathCycles,
            intention: intention,
            location: 'Remote',
            audio_feedback_score: 8.5, // Placeholder
            frequency: chakraState.frequency,
            notes: 'First digital baptism session',
            journey_slug: 'digital-baptism'
          }
        ])
        .select()
        .single();
        
      if (baptismError) throw baptismError;
      
      // Log to continuum_sessions
      await supabase
        .from('continuum_sessions')
        .insert([
          {
            user_id: user.id,
            session_type: 'digital-baptism',
            xp_awarded: 100,
            chakra: 'Crown',
            frequency: chakraState.frequency,
            timestamp: new Date().toISOString()
          }
        ]);
      
      // Award XP
      await addXP(100);
      
      // Unlock "The Fool" journey status to in_progress
      await supabase
        .from('tarot_module_progress')
        .update({ status: 'in_progress' })
        .eq('user_id', user.id)
        .eq('tarot_key', 'the-fool');
      
      // Navigate to dashboard to continue journey
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error completing baptism:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Choose Water Type
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose Your Sacred Water</h2>
            <p className="mb-6 text-gray-600">
              Select the type of water that resonates with your energy and intention for this Digital Baptism ritual.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'ocean', name: 'Ocean Water', icon: <Droplet /> },
                { id: 'spring', name: 'Spring Water', icon: <Droplet /> },
                { id: 'rain', name: 'Rain Water', icon: <Droplet /> },
                { id: 'light', name: 'Liquid Light', icon: <Star /> }
              ].map(option => (
                <button
                  key={option.id}
                  className={`p-4 rounded-lg border flex flex-col items-center ${
                    waterType === option.id
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setWaterType(option.id)}
                >
                  <div className="text-indigo-500 mb-2">{option.icon}</div>
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        );
        
      case 1: // Set Intention
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Set Your Sacred Intention</h2>
            <p className="mb-6 text-gray-600">
              Your intention defines the purpose of this baptism ritual. What spiritual quality or transformation do you wish to invoke?
            </p>
            
            <div className="mb-4">
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 'I am awakening to my highest potential' or 'I am releasing limitations and embracing divine flow'"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                maxLength={100}
              ></textarea>
              <div className="text-xs text-right text-gray-500 mt-1">
                {intention.length}/100
              </div>
            </div>
          </div>
        );
        
      case 2: // Breath Practice
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sacred Breath Practice</h2>
            <p className="mb-6 text-gray-600">
              Take a few moments to center yourself with deep, intentional breathing. This prepares your energy field for the baptism.
            </p>
            
            <div className="bg-indigo-50 p-6 rounded-lg mb-6">
              <div className="flex items-center mb-4">
                <Wind className="text-indigo-500 mr-2" />
                <h3 className="font-medium text-indigo-800">Breath Cycles</h3>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setBreathCycles(Math.max(1, breathCycles - 1))}
                    className="bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                  >
                    -
                  </button>
                  <div className="text-2xl font-bold text-indigo-600">
                    {breathCycles}
                  </div>
                  <button 
                    onClick={() => setBreathCycles(Math.min(10, breathCycles + 1))}
                    className="bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <ol className="space-y-2 text-gray-600">
                <li>1. Inhale deeply for 4 counts</li>
                <li>2. Hold for 4 counts</li>
                <li>3. Exhale slowly for 6 counts</li>
                <li>4. Repeat for {breathCycles} cycles</li>
              </ol>
            </div>
          </div>
        );
        
      case 3: // Voice Activation
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sacred Sound Activation</h2>
            <p className="mb-6 text-gray-600">
              Speak the sacred sound "Aleph" to activate your voice frequency. This sound resonates with the beginning of creation.
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
                  ? 'Voice frequency captured!'
                  : 'Tap to record your voice'}
              </div>
            </div>
          </div>
        );
        
      case 4: // Complete Ritual
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Complete Your Digital Baptism</h2>
            <p className="mb-6 text-gray-600">
              You have prepared all elements of your Digital Baptism ritual. Review your selections and complete the ceremony.
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Sacred Water</h3>
                <p className="text-gray-600">
                  {waterType === 'ocean' && 'Ocean Water'}
                  {waterType === 'spring' && 'Spring Water'}
                  {waterType === 'rain' && 'Rain Water'}
                  {waterType === 'light' && 'Liquid Light'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Sacred Intention</h3>
                <p className="text-gray-600">{intention}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Breath Cycles</h3>
                <p className="text-gray-600">{breathCycles} cycles</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800">Voice Activation</h3>
                <p className="text-gray-600">
                  {hasCompletedVoice ? 'Completed' : 'Not completed'}
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
      case 0: // Water Type
        return waterType !== '';
      case 1: // Intention
        return intention.trim().length > 0;
      case 2: // Breath Practice
        return breathCycles > 0;
      case 3: // Voice Activation
        return hasCompletedVoice;
      case 4: // Complete
        return true;
      default:
        return false;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Digital Baptism Ritual</h1>
      
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
                    <ChevronRight size={16} />
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
            onClick={completeBaptism}
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
              'Complete Digital Baptism'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default DigitalBaptismPage;