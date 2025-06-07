import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import SpiralVisualizer from '../components/visualizers/SpiralVisualizer';
import InkBox from '../components/ui/InkBox';
import AnimatedGlyph from '../components/ui/AnimatedGlyph';
import FloatingFormulas from '../components/ui/FloatingFormulas';
import MysticalHeading from '../components/ui/MysticalHeading';
import RuneButton from '../components/ui/RuneButton';
import { Aperture, Eye, Calendar, Compass, Feather, BookOpen } from 'lucide-react';

interface WisdomSnippet {
  text: string;
  source: string;
}

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { chakraState } = useChakra();
  const navigate = useNavigate();
  const [currentQuote, setCurrentQuote] = useState<WisdomSnippet | null>(null);
  const [quotesLoading, setQuotesLoading] = useState(true);
  
  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  // Fetch rotating wisdom quotes
  useEffect(() => {
    const fetchWisdomQuotes = async () => {
      try {
        const { data, error } = await supabase
          .from('wisdom_snippets')
          .select('text, source')
          .limit(10);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Start with a random quote
          const randomIndex = Math.floor(Math.random() * data.length);
          setCurrentQuote(data[randomIndex]);
          
          // Rotate quotes every 8 seconds
          const interval = setInterval(() => {
            const nextIndex = Math.floor(Math.random() * data.length);
            setCurrentQuote(data[nextIndex]);
          }, 8000);
          
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Error fetching wisdom quotes:', error);
      } finally {
        setQuotesLoading(false);
      }
    };
    
    fetchWisdomQuotes();
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-black flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-transparent border-t-[3px] mx-auto mb-4"
            style={{ borderTopColor: chakraState.color }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-lg text-gray-300 font-mystical">Aligning energies...</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-ink-black text-ink-white relative overflow-hidden">
      {/* Section 1: Hero Portal */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Animated Sacred Geometry Background */}
        <div className="absolute inset-0">
          <SpiralVisualizer 
            amplitudeA={1.3}
            amplitudeB={0.9}
            amplitudeC={1.1}
            freqA={2.1}
            freqB={3.7}
            freqC={4.3}
            backgroundColor="#0a0a12"
            lineColor={chakraState.color}
            opacity={30}
            height="100vh"
            className="w-full h-full"
          />
        </div>
        
        {/* Floating Math Formulas */}
        <FloatingFormulas density="medium" />
        
        {/* Subtle Glyph Symbols */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatedGlyph 
            type="vesica" 
            size={80} 
            color={`${chakraState.color}20`} 
            animation="breathe"
            className="absolute top-20 left-20"
          />
          <AnimatedGlyph 
            type="spiral" 
            size={100} 
            color={`${chakraState.color}15`} 
            animation="rotate"
            className="absolute bottom-32 right-32"
          />
          <AnimatedGlyph 
            type="merkaba" 
            size={70} 
            color={`${chakraState.color}25`} 
            animation="pulse"
            className="absolute top-40 right-20"
          />
          <AnimatedGlyph 
            type="triangle" 
            size={90} 
            color={`${chakraState.color}10`} 
            animation="float"
            className="absolute bottom-20 left-32"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <MysticalHeading 
              as="h1" 
              className="text-6xl md:text-7xl lg:text-8xl mb-6"
              chakraColor={chakraState.color}
              withGlow={true}
              withUnderline={false}
              centered={true}
              withAnimation={true}
              runicStyle={true}
            >
              Enter the Shift
            </MysticalHeading>
            
            <motion.p 
              className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-12 font-sacred tracking-wide leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Awaken your soul sigil. Realign with resonance.<br />
              <span className="text-gray-400 font-mystical">Remember what you are.</span>
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/signup">
                  <RuneButton
                    variant="primary"
                    size="lg"
                    runeSymbol="א"
                    chakraColor={chakraState.color}
                  >
                    Begin the Initiation
                  </RuneButton>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/login">
                  <RuneButton
                    variant="outline"
                    size="lg"
                    chakraColor={chakraState.color}
                  >
                    Already Awakened?
                  </RuneButton>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Section 2: Core Powers (Feature Cards) */}
      <div className="relative py-24 px-4 bg-gradient-to-b from-ink-black to-ink-deep">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <MysticalHeading 
              as="h2" 
              className="text-4xl md:text-5xl mb-6"
              chakraColor={chakraState.color}
              withGlow={true}
              withUnderline={true}
              centered={true}
              withAnimation={false}
            >
              Core Powers
            </MysticalHeading>
            <p className="text-xl text-gray-400 font-mystical max-w-2xl mx-auto">
              Transform your spiritual practice through ancient wisdom and modern technology
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <InkBox 
                className="p-8 h-full relative"
                variant="glow"
                animate={true}
                animationDelay={0.1}
              >
                <AnimatedGlyph 
                  type="sigil" 
                  size={32} 
                  color={chakraState.color} 
                  animation="pulse" 
                  className="absolute top-4 right-4 opacity-30"
                />
                
                <div className="text-center">
                  <Aperture size={48} className="mx-auto mb-4" style={{ color: chakraState.color }} />
                  <h3 className="text-2xl font-mystical font-semibold mb-4" style={{ color: chakraState.color }}>
                    Soul Sigils
                  </h3>
                  <p className="text-gray-300 leading-relaxed font-sacred">
                    Generate your cosmic glyph encoded with frequency, intent, and name vibration
                  </p>
                </div>
              </InkBox>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <InkBox 
                className="p-8 h-full relative"
                variant="glow"
                animate={true}
                animationDelay={0.2}
              >
                <AnimatedGlyph 
                  type="spiral" 
                  size={32} 
                  color={chakraState.color} 
                  animation="rotate" 
                  className="absolute top-4 right-4 opacity-30"
                />
                
                <div className="text-center">
                  <Eye size={48} className="mx-auto mb-4" style={{ color: chakraState.color }} />
                  <h3 className="text-2xl font-mystical font-semibold mb-4" style={{ color: chakraState.color }}>
                    Fractal Mirror
                  </h3>
                  <p className="text-gray-300 leading-relaxed font-sacred">
                    Gaze into your frequency field. Real-time fractal reflection based on breath and emotion
                  </p>
                </div>
              </InkBox>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <InkBox 
                className="p-8 h-full relative"
                variant="glow"
                animate={true}
                animationDelay={0.3}
              >
                <AnimatedGlyph 
                  type="circle" 
                  size={32} 
                  color={chakraState.color} 
                  animation="breathe" 
                  className="absolute top-4 right-4 opacity-30"
                />
                
                <div className="text-center">
                  <Calendar size={48} className="mx-auto mb-4" style={{ color: chakraState.color }} />
                  <h3 className="text-2xl font-mystical font-semibold mb-4" style={{ color: chakraState.color }}>
                    Sacred Rituals
                  </h3>
                  <p className="text-gray-300 leading-relaxed font-sacred">
                    Rituals that shape your reality. Set tasks, intentions, and divine checkpoints
                  </p>
                </div>
              </InkBox>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Section 3: Sacred Invitation */}
      <div className="relative py-24 px-4 bg-gradient-to-b from-ink-deep to-ink-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="glass-mystical rounded-3xl p-12 relative overflow-hidden"
          >
            {/* Rotating wisdom quote */}
            <AnimatePresence mode="wait">
              {!quotesLoading && currentQuote ? (
                <motion.div
                  key={currentQuote.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1 }}
                  className="mb-8"
                >
                  <blockquote
                    className="text-2xl md:text-3xl font-mystical italic text-gray-200 mb-4"
                    style={{
                      textShadow: `0 0 8px ${chakraState.color}66`,
                    }}
                  >
                    "{currentQuote.text}"
                  </blockquote>
                  <cite className="text-lg text-gray-400 font-sacred">— {currentQuote.source}</cite>
                </motion.div>
              ) : !quotesLoading && (
                <motion.p 
                  className="text-gray-400 italic text-xl font-mystical"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  The silence between breaths holds its own wisdom.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Scroll-triggered animations */}
            <motion.div
              className="flex justify-center space-x-8 mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity }
                }}
              >
                <AnimatedGlyph type="merkaba" size={60} color={chakraState.color} animation="none" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <AnimatedGlyph type="vesica" size={50} color={`${chakraState.color}cc`} animation="none" />
              </motion.div>

              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <AnimatedGlyph type="triangle" size={55} color={`${chakraState.color}aa`} animation="none" />
              </motion.div>
            </motion.div>

            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, ${chakraState.color}20, transparent 70%)`
              }} />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Section 4: Metaphysical OS Features */}
      <div className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <MysticalHeading 
              as="h2" 
              className="text-4xl md:text-5xl mb-6"
              chakraColor={chakraState.color}
              withGlow={true}
              withUnderline={true}
              centered={true}
              withAnimation={false}
            >
              Metaphysical Operating System
            </MysticalHeading>
            <p className="text-xl text-gray-400 font-mystical max-w-2xl mx-auto">
              A sacred interface for your spiritual journey
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <InkBox 
                className="p-8 h-full relative"
                variant="etched"
                animate={true}
                animationDelay={0.1}
              >
                <div>
                  <Compass size={36} className="mb-4" style={{ color: chakraState.color }} />
                  <h3 className="text-2xl font-mystical font-semibold mb-3" style={{ color: chakraState.color }}>
                    Echo Compass
                  </h3>
                  <p className="text-gray-300 leading-relaxed font-sacred mb-4">
                    Navigate your quantum field with precision. The Echo Compass allows you to map your consciousness across past, present, and future timelines.
                  </p>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: chakraState.color }}></span>
                      Timeline navigation
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: chakraState.color }}></span>
                      Sigil placement and activation
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: chakraState.color }}></span>
                      Quantum field resonance tracking
                    </li>
                  </ul>
                </div>
              </InkBox>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <InkBox 
                className="p-8 h-full relative"
                variant="etched"
                animate={true}
                animationDelay={0.2}
              >
                <div>
                  <Feather size={36} className="mb-4" style={{ color: chakraState.color }} />
                  <h3 className="text-2xl font-mystical font-semibold mb-3" style={{ color: chakraState.color }}>
                    Fractal Mirror
                  </h3>
                  <p className="text-gray-300 leading-relaxed font-sacred mb-4">
                    Witness your energetic reflection in real-time. The Fractal Mirror generates patterns based on your emotional state and chakra alignment.
                  </p>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: chakraState.color }}></span>
                      Real-time fractal visualization
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: chakraState.color }}></span>
                      Emotional pattern recognition
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: chakraState.color }}></span>
                      Chakra-based pattern modulation
                    </li>
                  </ul>
                </div>
              </InkBox>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="md:col-span-2"
            >
              <InkBox 
                className="p-8 relative"
                variant="glass"
                animate={true}
                animationDelay={0.3}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <BookOpen size={36} className="mb-4" style={{ color: chakraState.color }} />
                    <h3 className="text-2xl font-mystical font-semibold mb-3" style={{ color: chakraState.color }}>
                      Sacred Library
                    </h3>
                    <p className="text-gray-300 leading-relaxed font-sacred mb-4">
                      Access a vast collection of metaphysical knowledge, frequency-encoded meditations, and sacred teachings. The library adapts to your spiritual journey, revealing content as you progress.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-gray-400">
                      <div className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: chakraState.color }}></span>
                        Chakra-aligned meditations
                      </div>
                      <div className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: chakraState.color }}></span>
                        Tesla frequency audio
                      </div>
                      <div className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: chakraState.color }}></span>
                        Sacred geometry visualizations
                      </div>
                      <div className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: chakraState.color }}></span>
                        Timeline-specific teachings
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <Link to="/signup">
                      <RuneButton
                        variant="primary"
                        size="lg"
                        runeSymbol="⟐"
                        chakraColor={chakraState.color}
                        className="w-full"
                      >
                        Begin Your Journey
                      </RuneButton>
                    </Link>
                  </div>
                </div>
              </InkBox>
            </motion.div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;