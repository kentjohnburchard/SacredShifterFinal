import React from 'react';
import TimelineSelector from '../components/TimelineSelector';

const mockSigil = {
  id: 'mock-001',
  name: 'Soul Bridge',
  parameters: {
    svg: `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" stroke="gold" stroke-width="4" fill="none"/>
      <line x1="50" y1="10" x2="50" y2="90" stroke="gold" stroke-width="2"/>
      <line x1="10" y1="50" x2="90" y2="50" stroke="gold" stroke-width="2"/>
    </svg>`,
  },
};

const TimelineSelectorPage: React.FC = () => {
  return <TimelineSelector userSigil={mockSigil} />;
};

export default TimelineSelectorPage;
