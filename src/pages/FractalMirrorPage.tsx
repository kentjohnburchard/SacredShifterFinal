import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { useXP } from '../context/XPProvider';
import { supabase } from '../lib/supabase';
import ChakraBadge from '../components/chakra/ChakraBadge';

const FractalMirrorPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const { addXP } = useXP();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [emotionDetected, setEmotionDetected] = useState('Neutral');
  const [journalEntry, setJournalEntry] = useState('');
  const [hasCamera, setHasCamera] = useState(false);
  
  // Initialize the fractal visualization
  useEffect(() => {
    if (!canvasRef.current || !isSessionActive) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Animation variables
    let animationFrameId: number;
    let time = 0;
    
    // Simple fractal animation based on chakra color
    const animate = () => {
      time += 0.01;
      
      // Clear the canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Convert chakra color to RGB
      const colorHex = chakraState.color.replace('#', '');
      const r = parseInt(colorHex.substring(0, 2), 16);
      const g = parseInt(colorHex.substring(2, 4), 16);
      const b = parseInt(colorHex.substring(4, 6), 16);
      
      // Draw fractal pattern
      for (let i = 0; i < 8; i++) {
        const angle = time + (i * Math.PI / 4);
        const radius = 50 + 25 * Math.sin(time * 2);
        
        const x = centerX + Math.cos(angle) * radius * 3;
        const y = centerY + Math.sin(angle) * radius * 3;
        
        ctx.beginPath();
        drawSpiral(ctx, x, y, 10 * chakraState.intensity, 5, angle + time);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.5 * chakraState.intensity})`;
        ctx.fill();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Draw a spiral
    const drawSpiral = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      radius: number, 
      arms: number, 
      startAngle: number
    ) => {
      for (let i = 0; i < arms; i++) {
        const angle = startAngle + (i * Math.PI * 2 / arms);
        const maxTurns = 2;
        
        for (let j = 0; j < 50; j++) {
          const t = j / 50;
          const r = radius * t;
          const spiralAngle = angle + (t * maxTurns * Math.PI * 2);
          
          const spiralX = x + Math.cos(spiralAngle) * r;
          const spiralY = y + Math.sin(spiralAngle) * r;
          
          const dotSize = (1 - t) * 5;
          
          ctx.moveTo(spiralX, spiralY);
          ctx.arc(spiralX, spiralY, dotSize, 0, Math.PI * 2);
        }
      }
    };
    
    animate();
    
    // Session timer
    const intervalId = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isSessionActive, chakraState]);
  
  // Check for camera
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some(device => device.kind === 'videoinput');
        setHasCamera(hasVideoInput);
      } catch (error) {
        console.error('Error checking for camera:', error);
        setHasCamera(false);
      }
    };
    
    checkCamera();
  }, []);
  
  const startSession = async () => {
    setIsSessionActive(true);
    setSessionDuration(0);
  };
  
  const endSession = async () => {
    if (!user) return;
    
    setIsSessionActive(false);
    
    try {
      // Calculate XP based on duration
      const xpEarned = Math.min(Math.floor(sessionDuration / 10), 50);
      
      // Log session to database
      const { data: session, error: sessionError } = await supabase
        .from('fractal_mirror_sessions')
        .insert([
          {
            user_id: user.id,
            duration_seconds: sessionDuration,
            emotion_detected: emotionDetected,
            chakra_state: chakraState.type,
            frequency_peak: chakraState.frequency,
            visual_theme: 'default',
            has_camera_data: hasCamera,
            xp_earned: xpEarned
          }
        ])
        .select()
        .single();
        
      if (sessionError) throw sessionError;
      
      // If there's a journal entry, save it
      if (journalEntry.trim()) {
        const { error: journalError } = await supabase
          .from('tattoo_journal_entries')
          .insert([
            {
              user_id: user.id,
              content: journalEntry,
              emotion_tag: emotionDetected,
              chakra_tag: chakraState.type,
              frequency: chakraState.frequency,
              mirror_session_id: session.id,
              visibility: 'private'
            }
          ]);
          
        if (journalError) throw journalError;
      }
      
      // Log to continuum_sessions
      await supabase
        .from('continuum_sessions')
        .insert([
          {
            user_id: user.id,
            session_type: 'fractal_mirror',
            xp_awarded: xpEarned,
            chakra: chakraState.type,
            frequency: chakraState.frequency,
            timestamp: new Date().toISOString()
          }
        ]);
      
      // Award XP
      await addXP(xpEarned);
      
      // Reset journal entry
      setJournalEntry('');
      
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Fractal Mirror</h1>
      <p className="text-gray-600 mb-6">
        The Fractal Mirror reflects your energetic state through sacred geometry. 
        Breathe deeply and observe the patterns to connect with your higher consciousness.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Controls and info */}
        <div className="space-y-6">
          {/* Session controls */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Mirror Session</h2>
            
            {!isSessionActive ? (
              <button
                onClick={startSession}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Begin Mirror Session
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="text-xl font-semibold">{formatTime(sessionDuration)}</div>
                  </div>
                  
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse"
                    style={{ 
                      backgroundColor: `${chakraState.color}20`,
                      boxShadow: `0 0 10px ${chakraState.color}40`
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: chakraState.color }}
                    ></div>
                  </div>
                </div>
                
                <button
                  onClick={endSession}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  End Session
                </button>
              </div>
            )}
          </div>
          
          {/* Chakra selection */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Select Chakra Focus</h2>
            
            <div className="space-y-2">
              {(['Root', 'Sacral', 'SolarPlexus', 'Heart', 'Throat', 'ThirdEye', 'Crown'] as ChakraType[]).map(chakra => (
                <button
                  key={chakra}
                  onClick={() => activateChakra(chakra)}
                  className={`w-full flex items-center p-2 rounded-md ${
                    chakraState.type === chakra
                      ? 'bg-opacity-10'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: chakraState.type === chakra ? `${chakraColors[chakra]}10` : undefined,
                  }}
                  disabled={isSessionActive}
                >
                  <ChakraBadge chakra={chakra} />
                </button>
              ))}
            </div>
          </div>
          
          {/* Journal */}
          {isSessionActive && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Mirror Journal</h2>
              <p className="text-sm text-gray-500 mb-3">
                Capture your insights from this mirror session:
              </p>
              
              <textarea
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="What do you see in the fractal patterns? What emotions or insights arise?"
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
              ></textarea>
            </div>
          )}
        </div>
        
        {/* Right columns: Fractal visualization */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden h-[500px] relative">
            {isSessionActive ? (
              <>
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                ></canvas>
                
                <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 py-1 px-3 rounded-full text-sm">
                  {chakraState.frequency} Hz
                </div>
                
                <div className="absolute top-4 right-4">
                  <ChakraBadge chakra={chakraState.type} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <div className="mb-4 text-center">
                  <svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="1" />
                    <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="1" />
                    <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="none" stroke="white" strokeWidth="1" />
                    <path d="M30,30 L70,30 L70,70 L30,70 Z" fill="none" stroke="white" strokeWidth="1" />
                  </svg>
                </div>
                
                <p className="text-xl">Begin a Mirror Session to activate</p>
                <p className="text-gray-400 mt-2 max-w-md text-center">
                  The Fractal Mirror will generate patterns based on your selected chakra energy.
                  {hasCamera && " Camera integration is available for enhanced reflection."}
                </p>
              </div>
            )}
          </div>
        </div>
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

export default FractalMirrorPage;