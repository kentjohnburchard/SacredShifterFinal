import React, { useRef, useEffect } from 'react';
import p5 from 'react-p5';
import { useChakra } from '../../context/ChakraContext';

interface SpiralVisualizerProps {
  amplitudeA?: number;
  amplitudeB?: number;
  amplitudeC?: number;
  freqA?: number;
  freqB?: number;
  freqC?: number;
  backgroundColor?: string;
  lineColor?: string;
  opacity?: number;
  className?: string;
  height?: string | number;
}

const SpiralVisualizer: React.FC<SpiralVisualizerProps> = ({
  amplitudeA = 1.1,
  amplitudeB = 0.8,
  amplitudeC = 1.2,
  freqA = 2.4,
  freqB = 3.3,
  freqC = 4.6,
  backgroundColor,
  lineColor,
  opacity = 50,
  className = '',
  height = 400
}) => {
  const { chakraState } = useChakra();
  const sketchRef = useRef<any>(null);
  
  const params = {
    amplitudeA,
    amplitudeB,
    amplitudeC,
    freqA,
    freqB,
    freqC,
    backgroundColor: backgroundColor || '#0a0a1a',
    lineColor: lineColor || chakraState.color,
    opacity
  };

  let t = 0;

  const setup = (p5: any, canvasParentRef: Element) => {
    p5.createCanvas(canvasParentRef.clientWidth, typeof height === 'number' ? height : parseInt(height)).parent(canvasParentRef);
    p5.angleMode(p5.RADIANS);
    p5.noFill();
    p5.frameRate(30);
    
    sketchRef.current = p5;
  };

  const draw = (p5: any) => {
    p5.background(params.backgroundColor, params.opacity);
    p5.translate(p5.width / 2, p5.height / 2);
    p5.stroke(params.lineColor);
    p5.strokeWeight(1.2);

    p5.beginShape();
    for (let theta = 0; theta < Math.PI * 6; theta += 0.01) {
      const r =
        params.amplitudeA * Math.sin(params.freqA * theta + t) +
        params.amplitudeB * Math.cos(params.freqB * theta + t) +
        params.amplitudeC * Math.sin(params.freqC * theta + t);

      const x = r * Math.cos(theta) * 100;
      const y = r * Math.sin(theta) * 100;
      p5.vertex(x, y);
    }
    p5.endShape();

    t += 0.003;
  };

  // Resize canvas when parent size changes
  useEffect(() => {
    const handleResize = () => {
      if (sketchRef.current && sketchRef.current.canvas?.parentElement) {
        sketchRef.current.resizeCanvas(
          sketchRef.current.canvas.parentElement.clientWidth, 
          typeof height === 'number' ? height : parseInt(height)
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <p5 setup={setup} draw={draw} />
    </div>
  );
};

export default SpiralVisualizer;