// Core types used throughout the application

export type ChakraType = 
  | 'Root'
  | 'Sacral'
  | 'SolarPlexus'
  | 'Heart'
  | 'Throat'
  | 'ThirdEye'
  | 'Crown';

export interface ChakraState {
  type: ChakraType;
  frequency: number;
  color: string;
  intensity: number;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  onboarding_completed: boolean;
  light_points: number;
  light_level: number;
  ascension_title: string;
  chakra_highlight?: ChakraType;
  subscription_tier?: string;
}

export interface LightbearerLevel {
  level_num: number;
  threshold: number;
  title: string;
  next_threshold: number;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  is_completed: boolean;
}

export interface SigilParameters {
  frequency: number;
  archetypeKey?: string;
  chakra: ChakraType;
  intention: string;
  prime_multiplier: number;
  numerology_profile: {
    lifePath: number;
    expression: number;
    soulUrge: number;
    baseForm: string;
    overlay: string;
    ornamentation: string;
  };
  svg: string;
}

export interface Sigil {
  id: string;
  user_id: string;
  session_id?: string;
  image_url?: string;
  parameters: SigilParameters;
  created_at: string;
}

export interface SigilSticker {
  sigil_id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  chakra: ChakraType;
}

export interface SigilBoard {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  stickers: SigilSticker[];
  created_at: string;
  updated_at: string;
}

export interface ContinuumSession {
  id: string;
  user_id: string;
  session_type: string;
  xp_awarded: number;
  chakra?: ChakraType;
  frequency?: number;
  tarot_archetype?: string;
  sephirah?: string;
  timestamp: string;
}

// Sacred Circle types
export interface Circle {
  id: string;
  name: string;
  description?: string;
  love_level: number;
  creator_id: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user?: UserProfile;
}

export interface CirclePost {
  id: string;
  circle_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  comments?: CircleComment[];
  comment_count?: number;
}

export interface CircleComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

export interface CircleMessage {
  id: string;
  circle_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: UserProfile;
}

export interface HeartResonanceSession {
  id: string;
  circle_id: string;
  creator_id: string;
  title: string;
  description?: string;
  scheduled_for?: string;
  duration_minutes?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  creator?: UserProfile;
}

export interface LoveNote {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: UserProfile;
}