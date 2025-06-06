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

// Echo Compass Codex types
export interface TimelineNode {
  id: string;
  name: string;
  description: string;
  chakra: ChakraType;
  x: number;
  y: number;
  color: string;
}

export interface CodexEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: string;
  chakra: ChakraType;
  tags?: string[];
  created_at: string;
}

export interface UniversalLaw {
  id: string;
  name: string;
  description: string;
}

export interface ResonanceScore {
  overall: number;
  chakraHarmony: number;
  frequencyAlignment: number;
  timelineAlignment: number;
  universalLawCompliance: number;
}

export type SigilEvolutionStage = 'seed' | 'sprout' | 'bloom' | 'mature' | 'transcendent';

export interface SigilAlignment {
  sigil_id: string;
  timeline_node_id: string;
  alignment_date: string;
}

export interface QuantumField {
  resonance: number;
  stability: number;
  chakraInfluence: ChakraType;
  dominantFrequency: number;
  activeLaws: string[];
}

// Sacred Library types
export interface LibraryItem {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  thumbnail_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  chakra?: ChakraType;
  timeline?: 'past' | 'present' | 'future';
  frequency_hz?: number;
  tags?: string[];
  is_locked: boolean;
  media_type: 'audio' | 'video' | 'pdf' | 'image' | 'text';
  duration_seconds?: number;
  view_count: number;
}

export interface LibraryPlaylist {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_shared: boolean;
  cover_image_url?: string;
  item_count: number;
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  item_id: string;
  position: number;
  added_at: string;
  item?: LibraryItem;
}

export interface LibraryComment {
  id: string;
  item_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: UserProfile;
}