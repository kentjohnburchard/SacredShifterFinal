// Placeholder data for Sacred Circle module

import { ChakraType } from '../types';

// Circle Members data
export interface CircleMember {
  id: string;
  displayName: string;
  soulName: string;
  avatarUrl: string;
  primaryChakra: ChakraType;
  timelineAlignment: 'past' | 'present' | 'future';
  xpLevel: number;
  currentSigilId: string;
  statusMessage: string;
  lastRitual: string;
}

export const circleMembersData: CircleMember[] = [
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    displayName: 'Astra',
    soulName: 'Celestial Voyager',
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    primaryChakra: 'Crown',
    timelineAlignment: 'future',
    xpLevel: 7,
    currentSigilId: 'sigil-001',
    statusMessage: 'Exploring the quantum field',
    lastRitual: '2025-06-05T14:30:00Z'
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    displayName: 'Orion',
    soulName: 'Flame Keeper',
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    primaryChakra: 'SolarPlexus',
    timelineAlignment: 'present',
    xpLevel: 5,
    currentSigilId: 'sigil-002',
    statusMessage: 'Manifesting with intention',
    lastRitual: '2025-06-06T09:15:00Z'
  },
  {
    id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
    displayName: 'Luna',
    soulName: 'Midnight Dreamer',
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    primaryChakra: 'ThirdEye',
    timelineAlignment: 'past',
    xpLevel: 8,
    currentSigilId: 'sigil-003',
    statusMessage: 'Integrating ancestral wisdom',
    lastRitual: '2025-06-04T23:45:00Z'
  },
  {
    id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
    displayName: 'Zephyr',
    soulName: 'Wind Walker',
    avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    primaryChakra: 'Throat',
    timelineAlignment: 'present',
    xpLevel: 6,
    currentSigilId: 'sigil-004',
    statusMessage: 'Speaking my truth into existence',
    lastRitual: '2025-06-06T16:20:00Z'
  },
  {
    id: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
    displayName: 'Terra',
    soulName: 'Earth Weaver',
    avatarUrl: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=150',
    primaryChakra: 'Root',
    timelineAlignment: 'past',
    xpLevel: 4,
    currentSigilId: 'sigil-005',
    statusMessage: 'Grounding in ancestral wisdom',
    lastRitual: '2025-06-05T07:30:00Z'
  },
  {
    id: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
    displayName: 'Nova',
    soulName: 'Cosmic Catalyst',
    avatarUrl: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
    primaryChakra: 'Heart',
    timelineAlignment: 'future',
    xpLevel: 9,
    currentSigilId: 'sigil-006',
    statusMessage: 'Radiating unconditional love',
    lastRitual: '2025-06-06T12:00:00Z'
  },
  {
    id: '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v',
    displayName: 'Indigo',
    soulName: 'Void Dancer',
    avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    primaryChakra: 'Sacral',
    timelineAlignment: 'present',
    xpLevel: 3,
    currentSigilId: 'sigil-007',
    statusMessage: 'Creating from the void',
    lastRitual: '2025-06-05T19:10:00Z'
  }
];

// Ritual Log data
export interface Ritual {
  ritualId: string;
  ritualName: string;
  participants: string[];
  datePerformed: string;
  intention: string;
  outcome: string;
  resonanceScore: number;
  sigilsUsed: string[];
}

export const ritualLogData: Ritual[] = [
  {
    ritualId: 'ritual-001',
    ritualName: 'Quantum Field Harmonization',
    participants: ['1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u'],
    datePerformed: '2025-06-05T20:00:00Z',
    intention: 'Align our collective field with the highest timeline',
    outcome: 'Achieved 87% resonance with future timeline',
    resonanceScore: 87,
    sigilsUsed: ['sigil-001', 'sigil-003', 'sigil-006']
  },
  {
    ritualId: 'ritual-002',
    ritualName: 'Heart Chakra Activation',
    participants: ['2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u'],
    datePerformed: '2025-06-04T18:30:00Z',
    intention: 'Open the heart center to universal love',
    outcome: 'Increased heart resonance by 23%',
    resonanceScore: 92,
    sigilsUsed: ['sigil-002', 'sigil-004', 'sigil-006']
  },
  {
    ritualId: 'ritual-003',
    ritualName: 'Ancestral Wisdom Retrieval',
    participants: ['3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t'],
    datePerformed: '2025-06-03T22:15:00Z',
    intention: 'Connect with ancestral knowledge',
    outcome: 'Received insights about past timeline nodes',
    resonanceScore: 78,
    sigilsUsed: ['sigil-003', 'sigil-005']
  },
  {
    ritualId: 'ritual-004',
    ritualName: 'Tesla 369 Manifestation',
    participants: ['1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v'],
    datePerformed: '2025-06-06T03:06:09Z',
    intention: 'Activate the 369 code in our collective field',
    outcome: 'Created a stable vortex with 93% resonance',
    resonanceScore: 93,
    sigilsUsed: ['sigil-001', 'sigil-002', 'sigil-007']
  },
  {
    ritualId: 'ritual-005',
    ritualName: 'Throat Chakra Voice Activation',
    participants: ['4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s'],
    datePerformed: '2025-06-05T15:45:00Z',
    intention: 'Amplify authentic expression',
    outcome: 'Cleared throat chakra blockages',
    resonanceScore: 81,
    sigilsUsed: ['sigil-004']
  }
];

// Shared Sigil Board data
export interface SharedSigil {
  sigilId: string;
  createdBy: string;
  timeline: 'past' | 'present' | 'future';
  chakra: ChakraType;
  intention: string;
  evolutionStage: 'seed' | 'sprout' | 'bloom' | 'mature' | 'transcendent';
  likes: number;
  comments: number;
  resonanceImpact: number;
}

export const sharedSigilBoardData: SharedSigil[] = [
  {
    sigilId: 'sigil-001',
    createdBy: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    timeline: 'future',
    chakra: 'Crown',
    intention: 'Manifest collective ascension',
    evolutionStage: 'mature',
    likes: 12,
    comments: 5,
    resonanceImpact: 87
  },
  {
    sigilId: 'sigil-002',
    createdBy: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    timeline: 'present',
    chakra: 'SolarPlexus',
    intention: 'Empower authentic action',
    evolutionStage: 'bloom',
    likes: 8,
    comments: 3,
    resonanceImpact: 74
  },
  {
    sigilId: 'sigil-003',
    createdBy: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
    timeline: 'past',
    chakra: 'ThirdEye',
    intention: 'Retrieve ancestral wisdom',
    evolutionStage: 'transcendent',
    likes: 15,
    comments: 7,
    resonanceImpact: 93
  },
  {
    sigilId: 'sigil-004',
    createdBy: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
    timeline: 'present',
    chakra: 'Throat',
    intention: 'Speak universal truth',
    evolutionStage: 'bloom',
    likes: 9,
    comments: 4,
    resonanceImpact: 81
  },
  {
    sigilId: 'sigil-005',
    createdBy: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
    timeline: 'past',
    chakra: 'Root',
    intention: 'Ground in ancestral stability',
    evolutionStage: 'sprout',
    likes: 6,
    comments: 2,
    resonanceImpact: 65
  },
  {
    sigilId: 'sigil-006',
    createdBy: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
    timeline: 'future',
    chakra: 'Heart',
    intention: 'Radiate unconditional love',
    evolutionStage: 'transcendent',
    likes: 18,
    comments: 9,
    resonanceImpact: 96
  },
  {
    sigilId: 'sigil-007',
    createdBy: '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v',
    timeline: 'present',
    chakra: 'Sacral',
    intention: 'Create from divine inspiration',
    evolutionStage: 'seed',
    likes: 4,
    comments: 1,
    resonanceImpact: 58
  }
];

// Group Metrics data
export interface GroupMetrics {
  totalCircleXP: number;
  highestResonance: number;
  chakraDistribution: Record<ChakraType, number>;
  timelineBalance: {
    past: number;
    present: number;
    future: number;
  };
  dailyPulseRate: number;
}

export const groupMetricsData: GroupMetrics = {
  totalCircleXP: 2850,
  highestResonance: 96,
  chakraDistribution: {
    Root: 10,
    Sacral: 15,
    SolarPlexus: 12,
    Heart: 25,
    Throat: 18,
    ThirdEye: 20,
    Crown: 15
  },
  timelineBalance: {
    past: 30,
    present: 45,
    future: 25
  },
  dailyPulseRate: 3.7
};

// Message Scrolls (Chat) data
export interface MessageScroll {
  messageId: string;
  senderId: string;
  timestamp: string;
  text: string;
  emojiIntent: string;
  sigilAttached?: string;
  timelineVibe: 'past' | 'present' | 'future';
}

export const messageScrollsData: MessageScroll[] = [
  {
    messageId: 'msg-001',
    senderId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    timestamp: '2025-06-06T14:23:15Z',
    text: 'Just completed a Crown chakra meditation. The resonance is still flowing through me.',
    emojiIntent: '✨',
    timelineVibe: 'present'
  },
  {
    messageId: 'msg-002',
    senderId: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
    timestamp: '2025-06-06T14:25:30Z',
    text: 'I can feel the ripples in the field. Your sigil is pulsing strongly.',
    emojiIntent: '🌊',
    timelineVibe: 'present'
  },
  {
    messageId: 'msg-003',
    senderId: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
    timestamp: '2025-06-06T14:28:45Z',
    text: 'Who wants to join me for a Heart Resonance session at 8pm? I\'ve prepared a new sigil for collective amplification.',
    emojiIntent: '💗',
    sigilAttached: 'sigil-006',
    timelineVibe: 'future'
  },
  {
    messageId: 'msg-004',
    senderId: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    timestamp: '2025-06-06T14:30:12Z',
    text: 'I\'ll be there. My Solar Plexus is aligned and ready to contribute.',
    emojiIntent: '🔥',
    timelineVibe: 'present'
  },
  {
    messageId: 'msg-005',
    senderId: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
    timestamp: '2025-06-06T14:32:50Z',
    text: 'Has anyone worked with ancestral timeline nodes? I\'m trying to integrate some wisdom from my Root work.',
    emojiIntent: '🌱',
    timelineVibe: 'past'
  },
  {
    messageId: 'msg-006',
    senderId: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
    timestamp: '2025-06-06T14:35:22Z',
    text: 'Terra, I can help with that. My Third Eye work has revealed some techniques for ancestral integration.',
    emojiIntent: '👁️',
    timelineVibe: 'past'
  },
  {
    messageId: 'msg-007',
    senderId: '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v',
    timestamp: '2025-06-06T14:38:05Z',
    text: 'Just created a new sigil with 369 Tesla frequencies. It\'s still in seed stage but already pulsing strongly.',
    emojiIntent: '🌀',
    sigilAttached: 'sigil-007',
    timelineVibe: 'present'
  }
];

// Ritual Archetypes
export interface RitualArchetype {
  id: string;
  name: string;
  description: string;
  primaryChakra: ChakraType;
  timelineAffinity: 'past' | 'present' | 'future';
  minParticipants: number;
  maxParticipants: number;
  duration: number; // minutes
  resonanceBoost: number;
  requiredItems: string[];
  steps: string[];
}

export const ritualArchetypes: RitualArchetype[] = [
  {
    id: 'ritual-archetype-001',
    name: 'Heart Resonance Amplification',
    description: 'A collective ritual to amplify heart-centered energy and strengthen the bonds between circle members.',
    primaryChakra: 'Heart',
    timelineAffinity: 'present',
    minParticipants: 2,
    maxParticipants: 12,
    duration: 60,
    resonanceBoost: 25,
    requiredItems: ['Heart chakra sigils', 'Green or pink visualization', 'Shared intention'],
    steps: [
      'Form a virtual circle with all participants',
      'Activate heart chakra through synchronized breathing',
      'Share individual intentions',
      'Merge intentions into collective field',
      'Amplify with 639 Hz frequency',
      'Seal the resonance with gratitude'
    ]
  },
  {
    id: 'ritual-archetype-002',
    name: 'Ancestral Wisdom Retrieval',
    description: 'Connect with the past timeline to retrieve and integrate ancestral wisdom and healing.',
    primaryChakra: 'Root',
    timelineAffinity: 'past',
    minParticipants: 1,
    maxParticipants: 7,
    duration: 45,
    resonanceBoost: 20,
    requiredItems: ['Root chakra sigil', 'Past timeline node connection', 'Personal ancestry item or memory'],
    steps: [
      'Ground energy through Root chakra',
      'Create secure connection to past timeline',
      'Call upon ancestral guides',
      'Receive wisdom or healing',
      'Integrate insights with 396 Hz frequency',
      'Express gratitude and close the connection'
    ]
  },
  {
    id: 'ritual-archetype-003',
    name: 'Quantum Manifestation',
    description: 'Project intentions into the future timeline to manifest desired outcomes.',
    primaryChakra: 'ThirdEye',
    timelineAffinity: 'future',
    minParticipants: 1,
    maxParticipants: 9,
    duration: 33,
    resonanceBoost: 30,
    requiredItems: ['Third Eye sigil', 'Clear intention statement', 'Future timeline node connection'],
    steps: [
      'Activate Third Eye chakra',
      'Formulate precise intention',
      'Visualize intention as already manifested',
      'Project into future timeline with 852 Hz frequency',
      'Anchor with Tesla 3-6-9 code',
      'Release attachment to outcome'
    ]
  },
  {
    id: 'ritual-archetype-004',
    name: 'Voice Activation Ceremony',
    description: 'Empower authentic expression and clear communication blocks.',
    primaryChakra: 'Throat',
    timelineAffinity: 'present',
    minParticipants: 1,
    maxParticipants: 5,
    duration: 27,
    resonanceBoost: 15,
    requiredItems: ['Throat chakra sigil', 'Sound bowl or tone generator', 'Personal mantra'],
    steps: [
      'Center in present moment awareness',
      'Activate throat chakra with 741 Hz frequency',
      'Tone sacred sounds individually',
      'Share personal truth statements',
      'Create harmonic resonance with group toning',
      'Seal with silence'
    ]
  },
  {
    id: 'ritual-archetype-005',
    name: 'Solar Empowerment Circle',
    description: 'Strengthen personal power and manifest intentions through the solar plexus.',
    primaryChakra: 'SolarPlexus',
    timelineAffinity: 'present',
    minParticipants: 3,
    maxParticipants: 12,
    duration: 54,
    resonanceBoost: 22,
    requiredItems: ['Solar Plexus sigils', 'Yellow visualization', 'Personal power objects'],
    steps: [
      'Form triangle or hexagonal formation',
      'Activate solar plexus with 528 Hz frequency',
      'Share power statements',
      'Channel collective energy into central point',
      'Distribute amplified energy back to participants',
      'Ground and integrate'
    ]
  },
  {
    id: 'ritual-archetype-006',
    name: 'Crown Ascension Protocol',
    description: 'Connect with higher consciousness and spiritual dimensions.',
    primaryChakra: 'Crown',
    timelineAffinity: 'future',
    minParticipants: 1,
    maxParticipants: 7,
    duration: 63,
    resonanceBoost: 33,
    requiredItems: ['Crown chakra sigil', 'Violet or white visualization', 'Clear quartz or amethyst (virtual or physical)'],
    steps: [
      'Create sacred space with 963 Hz frequency',
      'Open crown chakra with breath work',
      'Ascend consciousness through guided meditation',
      'Receive downloads from higher dimensions',
      'Integrate insights with Tesla 9 code',
      'Return to physical awareness with grounding'
    ]
  },
  {
    id: 'ritual-archetype-007',
    name: 'Creative Womb Activation',
    description: 'Awaken creative potential and manifest new beginnings.',
    primaryChakra: 'Sacral',
    timelineAffinity: 'present',
    minParticipants: 1,
    maxParticipants: 8,
    duration: 42,
    resonanceBoost: 18,
    requiredItems: ['Sacral chakra sigil', 'Orange visualization', 'Water element (virtual or physical)'],
    steps: [
      'Connect with sacral center using 417 Hz frequency',
      'Activate creative energy with flowing movements',
      'Visualize project or creation in detail',
      'Infuse with emotional energy',
      'Set timeline for manifestation',
      'Celebrate the creative process'
    ]
  }
];