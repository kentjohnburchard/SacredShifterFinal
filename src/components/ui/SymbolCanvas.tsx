import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SymbolCanvasProps {
  symbol?: string; // SVG string content
  chakraColor?: string;
  width?: number;
  height?: number;
  animated?: boolean;
  className?: string;
  intensity?: number; // 0 to 1
  geometryType?: 'metatron' | 'fibonacci' | 'vesica' | 'flower-of-life';
}

const SymbolCanvas: React.FC<SymbolCanvasProps> = ({
  symbol,
  chakraColor = 'var(--chakra-color)',
  width = 200,
  height = 200,
  animated = true,
  className = '',
  intensity = 0.6,
  geometryType = 'metatron'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    let animationFrameId: number;
    let time = 0;
    
    // Tesla 369 timing constants
    const teslaCycle = Math.PI * 2;
    const tesla3 = teslaCycle / 3;
    const tesla6 = teslaCycle / 6;
    const tesla9 = teslaCycle / 9;
    
    // Golden ratio (phi)
    const phi = 1.618033988749895;
    
    // Animation function with sacred geometry
    const animate = () => {
      time += 0.01;
      
      // Clear canvas with semi-transparent black for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Parse chakra color to RGB
      let r = 255, g = 255, b = 255;
      if (chakraColor.startsWith('#')) {
        const hex = chakraColor.replace('#', '');
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
      
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Draw based on selected geometry
      switch(geometryType) {
        case 'metatron':
          drawMetatronsCube(ctx, time, r, g, b, intensity);
          break;
        case 'fibonacci':
          drawFibonacciSpiral(ctx, time, r, g, b, intensity);
          break;
        case 'vesica':
          drawVesicaPiscis(ctx, time, r, g, b, intensity);
          break;
        case 'flower-of-life':
          drawFlowerOfLife(ctx, time, r, g, b, intensity);
          break;
        default:
          drawMetatronsCube(ctx, time, r, g, b, intensity);
      }
      
      ctx.restore();
      
      if (animated) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    // Draw Metatron's Cube - foundation of sacred geometry
    const drawMetatronsCube = (
      ctx: CanvasRenderingContext2D,
      time: number,
      r: number, g: number, b: number,
      intensity: number
    ) => {
      // Radius for the main circle
      const radius = 70 * intensity;
      
      // Draw center point
      ctx.beginPath();
      ctx.arc(0, 0, 3 * intensity, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.7 * intensity})`;
      ctx.fill();
      
      // Draw 6 outer points in a hexagon
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) + (time * 0.1);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.arc(x, y, 3 * intensity, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.6 * intensity})`;
        ctx.fill();
        
        points.push({ x, y });
      }
      
      // Draw inner points (another hexagon, rotated)
      const innerPoints = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) + (Math.PI / 6) + (time * 0.1);
        const x = Math.cos(angle) * radius * 0.6;
        const y = Math.sin(angle) * radius * 0.6;
        
        ctx.beginPath();
        ctx.arc(x, y, 2 * intensity, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.5 * intensity})`;
        ctx.fill();
        
        innerPoints.push({ x, y });
      }
      
      // Connect all points to form Metatron's Cube
      // Outer hexagon
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 * intensity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      // Inner hexagon
      for (let i = 0; i < innerPoints.length; i++) {
        const p1 = innerPoints[i];
        const p2 = innerPoints[(i + 1) % innerPoints.length];
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 * intensity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      // Connect inner and outer points
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        
        for (let j = 0; j < innerPoints.length; j++) {
          const p2 = innerPoints[j];
          
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.2 * intensity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        
        // Connect to center
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 * intensity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };
    
    // Draw Fibonacci Spiral - based on the golden ratio
    const drawFibonacciSpiral = (
      ctx: CanvasRenderingContext2D,
      time: number,
      r: number, g: number, b: number,
      intensity: number
    ) => {
      // Scale factor
      const scale = 3 * intensity;
      
      // Fibonacci sequence
      const fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
      
      // Draw spiral
      ctx.beginPath();
      ctx.moveTo(0, 0);
      
      let x = 0, y = 0;
      let angle = time;
      
      for (let i = 0; i < 100; i++) {
        const radius = (fib[i % fib.length] + 1) * scale;
        angle += (Math.PI * 2) / (phi * 6); // Golden angle
        
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        
        ctx.lineTo(x, y);
      }
      
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 * intensity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Draw golden rectangle sequence
      let size = 1 * scale;
      x = 0; y = 0;
      
      for (let i = 0; i < 9; i++) {
        const nextSize = size * phi;
        
        ctx.beginPath();
        ctx.rect(x, y, size, size);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(0.2 + (i * 0.03)) * intensity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // Position for next rectangle following Fibonacci pattern
        if (i % 4 === 0) x += size;
        else if (i % 4 === 1) y += size;
        else if (i % 4 === 2) x -= nextSize;
        else y -= nextSize;
        
        size = nextSize;
      }
    };
    
    // Draw Vesica Piscis - foundation of sacred geometry
    const drawVesicaPiscis = (
      ctx: CanvasRenderingContext2D,
      time: number,
      r: number, g: number, b: number,
      intensity: number
    ) => {
      const radius = 40 * intensity;
      const distance = radius * Math.sin(time * 0.1) * 0.2 + radius;
      
      // Draw first circle
      ctx.beginPath();
      ctx.arc(-distance/2, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 * intensity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw second circle
      ctx.beginPath();
      ctx.arc(distance/2, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 * intensity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw vesica piscis area with subtle fill
      ctx.beginPath();
      ctx.arc(-distance/2, 0, radius, -Math.PI/3, Math.PI/3);
      ctx.arc(distance/2, 0, radius, Math.PI*2/3, Math.PI*4/3);
      ctx.closePath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.1 * intensity})`;
      ctx.fill();
      
      // Add 3-6-9 points at key intersections
      const vesicaHeight = 2 * Math.sqrt(radius*radius - (distance/2)*(distance/2));
      
      // 3 point (top)
      ctx.beginPath();
      ctx.arc(0, vesicaHeight/2, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.6 * intensity})`;
      ctx.fill();
      
      // 6 point (center)
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.8 * intensity})`;
      ctx.fill();
      
      // 9 point (bottom)
      ctx.beginPath();
      ctx.arc(0, -vesicaHeight/2, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.6 * intensity})`;
      ctx.fill();
    };
    
    // Draw Flower of Life - complex sacred geometry pattern
    const drawFlowerOfLife = (
      ctx: CanvasRenderingContext2D,
      time: number,
      r: number, g: number, b: number,
      intensity: number
    ) => {
      const baseRadius = 20 * intensity;
      const circles = [
        {x: 0, y: 0}, // Center
        
        // First ring - 6 circles
        {x: baseRadius * Math.cos(0), y: baseRadius * Math.sin(0)},
        {x: baseRadius * Math.cos(Math.PI/3), y: baseRadius * Math.sin(Math.PI/3)},
        {x: baseRadius * Math.cos(2*Math.PI/3), y: baseRadius * Math.sin(2*Math.PI/3)},
        {x: baseRadius * Math.cos(Math.PI), y: baseRadius * Math.sin(Math.PI)},
        {x: baseRadius * Math.cos(4*Math.PI/3), y: baseRadius * Math.sin(4*Math.PI/3)},
        {x: baseRadius * Math.cos(5*Math.PI/3), y: baseRadius * Math.sin(5*Math.PI/3)},
        
        // Second ring - partial, just for visual effect
        {x: 2*baseRadius * Math.cos(0), y: 2*baseRadius * Math.sin(0)},
        {x: 2*baseRadius * Math.cos(Math.PI/3), y: 2*baseRadius * Math.sin(Math.PI/3)},
        {x: 2*baseRadius * Math.cos(2*Math.PI/3), y: 2*baseRadius * Math.sin(2*Math.PI/3)},
        {x: 2*baseRadius * Math.cos(Math.PI), y: 2*baseRadius * Math.sin(Math.PI)},
        {x: 2*baseRadius * Math.cos(4*Math.PI/3), y: 2*baseRadius * Math.sin(4*Math.PI/3)},
        {x: 2*baseRadius * Math.cos(5*Math.PI/3), y: 2*baseRadius * Math.sin(5*Math.PI/3)}
      ];
      
      // Draw each circle
      circles.forEach((circle, i) => {
        // Rotation animation for sacred geometry effect
        const rotationAngle = time * (i % 3 === 0 ? 0.3 : i % 3 === 1 ? 0.6 : 0.9) * 0.5;
        const x = circle.x * Math.cos(rotationAngle) - circle.y * Math.sin(rotationAngle);
        const y = circle.x * Math.sin(rotationAngle) + circle.y * Math.cos(rotationAngle);
        
        ctx.beginPath();
        ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
        
        // Apply Tesla 369 pattern to opacity
        const opacityModulator = Math.sin(time * (i % 3 === 0 ? 3 : i % 3 === 1 ? 6 : 9) / 10) * 0.2 + 0.4;
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacityModulator * intensity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Add subtle fill for visual depth
        if (i < 7) { // Only fill the central circle and first ring
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.03 * intensity})`;
          ctx.fill();
        }
      });
      
      // Draw sacred triangle
      ctx.beginPath();
      ctx.moveTo(0, -baseRadius * 2);
      ctx.lineTo(baseRadius * Math.sqrt(3), baseRadius);
      ctx.lineTo(-baseRadius * Math.sqrt(3), baseRadius);
      ctx.closePath();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 * intensity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw sacred hexagon (Tesla 6)
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) + (time * 0.1);
        const x = Math.cos(angle) * baseRadius * 2;
        const y = Math.sin(angle) * baseRadius * 2;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.2 * intensity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    
    // Run animation if enabled
    if (animated) {
      animate();
    } else {
      // Just draw once
      animate();
    }
    
    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [width, height, chakraColor, animated, intensity, geometryType]);
  
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {symbol ? (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 3,
            ease: [0.3, 0, 0.6, 1] // Tesla-inspired timing curve
          }}
          dangerouslySetInnerHTML={{ __html: symbol }}
        />
      ) : null}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full rounded-2xl"
      />
    </motion.div>
  );
};

export default SymbolCanvas;