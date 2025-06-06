import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingFormulasProps {
  density?: 'low' | 'medium' | 'high';
  className?: string;
}

const FloatingFormulas: React.FC<FloatingFormulasProps> = ({
  density = 'medium',
  className = ''
}) => {
  const [formulas] = useState([
    'φ = (1 + √5) / 2',
    'ψ = φ - 1',
    'F(n) = F(n-1) + F(n-2)',
    'ν = 528 Hz',
    'Ω = 432 Hz',
    'π = 3.14159...',
    'e = 2.71828...',
    'α = 1/137',
    '∞ = ∞',
    '∇ × E = -∂B/∂t',
    'E = mc²',
    '∑(1/n²) = π²/6',
    'ψ(x,t) = Ae^(i(kx-ωt))',
    'θ = 2π/3',
    'λ = h/p'
  ]);
  
  const getFormulaCount = () => {
    switch (density) {
      case 'low': return 3;
      case 'high': return 8;
      default: return 5;
    }
  };
  
  const getRandomFormulas = () => {
    const count = getFormulaCount();
    const shuffled = [...formulas].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  const [selectedFormulas] = useState(getRandomFormulas());
  
  const getRandomPosition = () => ({
    x: Math.random() * 80 + 10, // 10% to 90% of width
    y: Math.random() * 80 + 10, // 10% to 90% of height
  });
  
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {selectedFormulas.map((formula, index) => {
        const position = getRandomPosition();
        
        return (
          <motion.div
            key={`${formula}-${index}`}
            className="absolute floating-formula"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.15, 0],
              scale: [0.8, 1, 0.8],
              x: [0, Math.random() * 20 - 10],
              y: [0, Math.random() * 20 - 10],
            }}
            transition={{
              duration: 8 + Math.random() * 4, // 8-12 seconds
              repeat: Infinity,
              delay: index * 1.5,
              ease: "easeInOut"
            }}
          >
            {formula}
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingFormulas;