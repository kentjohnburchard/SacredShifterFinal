import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, ChevronRight, Check, BookOpen, Save, Scroll } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import { ChakraType } from '../types';
import { motion } from 'framer-motion';
import SpiralVisualizer from '../components/visualizers/SpiralVisualizer';
import WisdomSnippetCard from '../components/hierophant/WisdomSnippetCard';
import CodexEntryModal from '../components/hierophant/CodexEntryModal';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';

interface WisdomSnippet {
  id: string;
  content: string;
  source: string;
  tradition: string;
  chakra: string;
  tags?: string[];
}

interface CodexEntry {
  title: string;
  reflection: string;
  chakra: ChakraType;
  tradition?: string;
  belief_related?: boolean;
  tags?: string[];
}

const HierophantPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP } = useXP();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [mentorName, setMentorName] = useState('');
  const [beliefReflection, setBeliefReflection] = useState('');
  const [selectedWisdom, setSelectedWisdom] = useState<WisdomSnippet | null>(null);
  const [wisdomSnippets, setWisdomSnippets] = useState<WisdomSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    'Introduction',
    'Personal Beliefs',
    'Mentor Visualization',
    'Sacred Teaching',
    'Codex Reflection',
  ];
  
  // Activate Throat chakra on component mount - Hierophant is associated with communication
  useEffect(() => {
    activateChakra('Throat', 'hierophant_journey');
    fetchWisdomSnippets();
  }, []);
  
  const fetchWisdomSnippets = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('wisdom_snippets')
        .select('*')
        .limit(5);
        
      if (error) throw error;
      
      setWisdomSnippets(data || []);
      
      // Randomly select one wisdom snippet
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setSelectedWisdom(data[randomIndex]);
      }
    } catch (error) {
      console.error('Error fetching wisdom snippets:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };
  
  const handleSaveToCodex = async (entry: CodexEntry) => {
    if (!user || !selectedWisdom) return;
    
    try {
      setIsSubmitting(true);
      
      // First, save the codex entry
      const { data: codexEntry, error: codexError } = await supabase
        .from('codex_entries')
        .insert([
          {
            user_id: user.id,
            title: entry.title,
            content: entry.reflection,
            chakra_tag: entry.chakra,
            spiritual_tradition: entry.tradition,
            belief_related: entry.belief_related,
            tags: entry.tags,
            wisdom_snippet_id: selectedWisdom.id
          }
        ])
        .select()
        .single();
        
      if (codexError) throw codexError;
      
      // Then, log the hierophant session
      const { error: sessionError } = await supabase
        .from('hierophant_sessions')
        .insert([
          {
            user_id: user.id,
            mentor_name: mentorName,
            belief_reflection: beliefReflection,
            wisdom_snippet_id: selectedWisdom.id,
            codex_entry_id: codexEntry.id,
            chakra: chakraState.type,
            xp_earned: 125
          }
        ]);
        
      if (sessionError) throw sessionError;
      
      // Log to continuum_sessions
      await supabase
        .from('continuum_sessions')
        .insert([
          {
            user_id: user.id,
            session_type: 'hierophant_journey',
            xp_awarded: 125,
            chakra: chakraState.type,
            frequency: chakraState.frequency,
            tarot_archetype: 'The Hierophant',
            timestamp: new Date().toISOString()
          }
        ]);
      
      // Award XP
      await addXP(125);
      
      // Update tarot module progress
      await supabase
        .from('tarot_module_progress')
        .insert([
          {
            user_id: user.id,
            tarot_key: 'the-hierophant',
            status: 'completed',
            completion_date: new Date().toISOString()
          }
        ]);
      
      // Navigate back to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error saving to codex:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Introduction
        return (
          <div>
            <SacredHeading 
              as="h2" 
              className="text-xl mb-4"
              chakraColor={chakraState.color}
              withGlow
            >
              The Path of the Hierophant
            </SacredHeading>
            
            <div className="prose prose-invert max-w-none mb-6">
              <p>
                Welcome to the Temple of Sacred Knowledge. The Hierophant represents tradition, 
                spiritual wisdom, and the bridge between the divine and humanity.
              </p>
              
              <p>
                As the spiritual teacher and keeper of sacred knowledge, the Hierophant invites us to 
                explore established traditions, connect with mentors, and integrate wisdom into our lives.
              </p>
              
              <p className="font-medium" style={{ color: chakraState.color }}>
                Invocation:
              </p>
              
              <blockquote className="italic">
                "I open myself to the teachings of the ages.<br/>
                Through wisdom passed down through time,<br/>
                I connect to the sacred knowledge within and without.<br/>
                May I be a worthy student of truth."
              </blockquote>
              
              <p>
                In this journey, you will reflect on your personal beliefs, connect with an inner mentor,
                receive a teaching from ancient wisdom, and integrate this knowledge into your own spiritual codex.
              </p>
            </div>
            
            <div className="bg-dark-100 p-4 rounded-lg mb-6 border border-dark-300">
              <div className="text-indigo-300 font-medium mb-2">Key Themes:</div>
              <ul className="space-y-1 text-gray-300">
                <li>• Tradition and spiritual education</li>
                <li>• The bridge between divine and earthly realms</li>
                <li>• Structured spiritual systems</li>
                <li>• Mentorship and guidance</li>
                <li>• The Hebrew letter Vav (ו) - The connecting hook</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${chakraState.color}15` }}>
              <p className="text-sm text-gray-300">
                Soundscape: 528 Hz Solfeggio Frequency - The "Miracle Tone" associated with 
                transformation and DNA repair.
              </p>
            </div>
          </div>
        );
        
      case 1: // Personal Beliefs
        return (
          <div>
            <SacredHeading 
              as="h2" 
              className="text-xl mb-4"
              chakraColor={chakraState.color}
            >
              Reflect on Your Beliefs
            </SacredHeading>
            
            <div className="prose prose-invert max-w-none mb-6">
              <p>
                The Hierophant asks us to examine our relationship with tradition, beliefs, and 
                structured knowledge. Take a moment to consider your own spiritual framework.
              </p>
              
              <p>
                What beliefs, traditions, or practices form the foundation of your spiritual path?
                How do you relate to established traditions and teachings?
              </p>
            </div>
            
            <div className="mb-6">
              <textarea
                rows={6}
                value={beliefReflection}
                onChange={(e) => setBeliefReflection(e.target.value)}
                className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                placeholder="Reflect on your beliefs, spiritual foundations, and relationship with tradition..."
              ></textarea>
            </div>
            
            <div className="p-4 rounded-lg border border-dark-300 bg-dark-100">
              <div className="text-indigo-300 font-medium mb-2">Reflection Prompts:</div>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• What spiritual or philosophical traditions resonate with you?</li>
                <li>• How do you navigate between established teachings and personal insights?</li>
                <li>• Are there any beliefs you've inherited that you're reconsidering?</li>
                <li>• What role does structured knowledge play in your spiritual development?</li>
              </ul>
            </div>
          </div>
        );
        
      case 2: // Mentor Visualization
        return (
          <div>
            <SacredHeading 
              as="h2" 
              className="text-xl mb-4"
              chakraColor={chakraState.color}
            >
              Mentor Visualization
            </SacredHeading>
            
            <div className="prose prose-invert max-w-none mb-6">
              <p>
                The Hierophant often appears as a teacher or guide. In this step, you'll connect 
                with an inner mentor—a personification of wisdom that can guide you on your path.
              </p>
              
              <p>
                Close your eyes and allow an image to form of a wise teacher or guide. This could be:
              </p>
              
              <ul>
                <li>A historical or mythological figure who embodies wisdom</li>
                <li>An archetype of the wise teacher</li>
                <li>A symbolic animal or being that represents guidance</li>
                <li>A personification of your higher self</li>
              </ul>
              
              <p>
                When you have a clear image, give this mentor a name. This name will help you 
                reconnect with this energy whenever you need guidance.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Your Inner Mentor's Name
              </label>
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                placeholder="Enter your mentor's name..."
              />
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${chakraState.color}15` }}>
              <p className="text-sm text-gray-300">
                This mentor represents your connection to wisdom and tradition. You can call upon this 
                energy whenever you seek guidance or clarity on your spiritual path.
              </p>
            </div>
          </div>
        );
        
      case 3: // Sacred Teaching
        return (
          <div>
            <SacredHeading 
              as="h2" 
              className="text-xl mb-4"
              chakraColor={chakraState.color}
            >
              Sacred Teaching
            </SacredHeading>
            
            <div className="prose prose-invert max-w-none mb-6">
              <p>
                Now, your mentor presents you with a piece of wisdom. This teaching comes from the 
                collective wisdom of humanity, carried through traditions and practices across time.
              </p>
              
              <p>
                Take a moment to reflect on this teaching. What does it reveal to you? How might it 
                apply to your current journey?
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <motion.div
                  className="w-12 h-12 rounded-full border-2 border-transparent border-t-[3px]"
                  style={{ borderTopColor: chakraState.color }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : selectedWisdom ? (
              <WisdomSnippetCard snippet={selectedWisdom} className="mb-6" />
            ) : (
              <div className="bg-dark-300 p-4 rounded-lg text-gray-400 text-center mb-6">
                No wisdom teachings available at this time. Please try again later.
              </div>
            )}
            
            <div className="flex justify-end">
              <TattooButton
                chakraColor={chakraState.color}
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!selectedWisdom}
              >
                <Scroll size={16} className="mr-2" />
                Reflect on this Teaching
              </TattooButton>
            </div>
          </div>
        );
        
      case 4: // Codex Reflection
        return (
          <div>
            <SacredHeading 
              as="h2" 
              className="text-xl mb-4"
              chakraColor={chakraState.color}
            >
              Integrate the Wisdom
            </SacredHeading>
            
            <div className="prose prose-invert max-w-none mb-6">
              <p>
                The final step in the Hierophant's path is to integrate the wisdom you've received.
                By recording your insights in your Sacred Codex, you make this wisdom your own.
              </p>
              
              <p>
                Click below to open your Codex and record your reflection on the teaching you received.
                What new understanding has emerged? How will you apply this wisdom in your life?
              </p>
            </div>
            
            {selectedWisdom && (
              <div className="mb-6">
                <WisdomSnippetCard snippet={selectedWisdom} />
              </div>
            )}
            
            <div className="p-4 rounded-lg border border-dark-300 bg-dark-100 mb-6">
              <div className="text-indigo-300 font-medium mb-2">Your Journey Summary:</div>
              <ul className="space-y-2 text-gray-300 text-sm">
                {beliefReflection && (
                  <li>
                    <span className="text-gray-400">Belief Reflection:</span>{' '}
                    {beliefReflection.substring(0, 100)}
                    {beliefReflection.length > 100 ? '...' : ''}
                  </li>
                )}
                {mentorName && (
                  <li>
                    <span className="text-gray-400">Inner Mentor:</span>{' '}
                    {mentorName}
                  </li>
                )}
                {selectedWisdom && (
                  <li>
                    <span className="text-gray-400">Wisdom Source:</span>{' '}
                    {selectedWisdom.source} ({selectedWisdom.tradition})
                  </li>
                )}
              </ul>
            </div>
            
            <div className="flex justify-center">
              <TattooButton
                chakraColor={chakraState.color}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center"
              >
                <BookOpen size={16} className="mr-2" />
                Open Your Sacred Codex
              </TattooButton>
            </div>
            
            {isModalOpen && selectedWisdom && (
              <CodexEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveToCodex}
                wisdomSnippet={{
                  content: selectedWisdom.content,
                  source: selectedWisdom.source,
                  tradition: selectedWisdom.tradition
                }}
              />
            )}
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
      case 1: // Personal Beliefs
        return beliefReflection.trim().length > 0;
      case 2: // Mentor Visualization
        return mentorName.trim().length > 0;
      case 3: // Sacred Teaching
        return selectedWisdom !== null;
      case 4: // Codex Reflection
        return true; // We'll handle this with the modal
      default:
        return false;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Book className="mr-2" style={{ color: chakraState.color }} />
        <h1 className="text-2xl font-bold text-white">The Path of the Hierophant</h1>
      </div>
      
      {/* Visualization */}
      <div className="mb-6 rounded-2xl overflow-hidden border border-dark-300">
        <SpiralVisualizer 
          amplitudeA={1.2}
          amplitudeB={1.0}
          amplitudeC={0.8}
          freqA={3.1}
          freqB={4.4}
          freqC={2.2}
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
        ) : null}
      </div>
    </div>
  );
};

export default HierophantPage;