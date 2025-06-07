import React from 'react';
import { motion } from 'framer-motion';
import { useCodex } from '../../context/CodexContext';
import { useChakra } from '../../context/ChakraContext';
import { UniversalLaw } from '../../types';
import { Scale, Check, AlertCircle, Info } from 'lucide-react';

interface UniversalLawsPanelProps {
  sigilId: string;
  className?: string;
}

const UniversalLawsPanel: React.FC<UniversalLawsPanelProps> = ({
  sigilId,
  className = ''
}) => {
  const { chakraState } = useChakra();
  const { checkUniversalLawCompliance, sigils } = useCodex();
  
  const compliantLaws = checkUniversalLawCompliance(sigilId);
  const sigil = sigils.find(s => s.id === sigilId);
  
  if (!sigil) return null;
  
  // Tesla's 3-6-9 pattern for staggered animations
  const lawVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: i * 0.3, // 3 tenths
        duration: 0.6,  // 6 tenths
        ease: [0.3, 0, 0.6, 1] // Tesla curve - emphasis on 3 and 6
      }
    })
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center mb-4">
        <Scale size={18} className="mr-2" style={{ color: chakraState.color }} />
        <h3 className="text-lg font-medium text-white">Universal Law Compliance</h3>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-gray-300 mb-2">
          Sigil <span className="font-medium text-white">"{sigil.parameters.intention}"</span> is in compliance with:
        </div>
        
        <motion.div 
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {compliantLaws.map((law, index) => (
            <LawItem key={law.id} law={law} index={index} />
          ))}
        </motion.div>
      </div>
      
      {compliantLaws.length < 7 && (
        <div className="p-3 rounded-lg bg-dark-300">
          <div className="flex items-start">
            <Info size={16} className="mr-2 mt-0.5 text-gray-400" />
            <div className="text-xs text-gray-300">
              <p className="mb-1">This sigil could be enhanced by aligning with additional universal laws:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Adjust frequency to a Tesla number (3, 6, or 9)</li>
                <li>Align to a timeline node</li>
                <li>Include polarity in your intention</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface LawItemProps {
  law: UniversalLaw;
  index: number;
}

const LawItem: React.FC<LawItemProps> = ({ law, index }) => {
  const { chakraState } = useChakra();
  
  return (
    <motion.div
      custom={index}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({ 
          opacity: 1, 
          x: 0, 
          transition: { 
            delay: i * 0.3, 
            duration: 0.6 
          }
        })
      }}
      className="p-3 rounded-lg bg-dark-300 flex items-start"
    >
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-3"
        style={{ backgroundColor: `${chakraState.color}30` }}
      >
        <Check size={14} style={{ color: chakraState.color }} />
      </div>
      
      <div>
        <div className="font-medium text-white text-sm">{law.name}</div>
        <div className="text-xs text-gray-400">{law.description}</div>
      </div>
    </motion.div>
  );
};

export default UniversalLawsPanel;