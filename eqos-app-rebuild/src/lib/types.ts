export type TabType = 'today' | 'library' | 'story';
export type SubViewType = 'main' | 'program' | 'video' | 'profile';

export interface EmotionItem {
  id: string;
  family: string;
  intensity_rank: number;
  name: string;
  definition: string;
  body_signals: string;
  triggers: string;
  need: string;
  now_action: string;
  after_action: string;
  over_time: string;
  never_do: string;
}

export interface ResetScript {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  pattern: {
    inhale: number;
    exhale: number;
    hold?: number;
    rest?: number;
    cycles: number;
  };
  visual_pacer: string;
  haptics_enabled: boolean;
  prompts: { second: number; text: string }[];
  after_action: string;
}

export interface ConversationScript {
  id: string;
  title: string;
  domain: 'work' | 'home';
  description: string;
  direct: {
    step_1: string;
    step_2: string;
    step_3: string;
    step_4: string;
  };
  diplomatic: {
    step_1: string;
    step_2: string;
    step_3: string;
    step_4: string;
  };
}

export interface HelplineItem {
  country: string;
  name: string;
  numbers: string[];
  hours: string;
  languages: string[];
  url: string;
  verified_at: string;
}

export interface ReflectionTool {
  tool_id: string;
  title: string;
  engine: string;
  phase: string;
  minutes: number;
  tags: string[];
  steps: {
    prompt: string;
    placeholder?: string;
    options?: string[];
  }[];
}

export interface CheckInRecord {
  id: string;
  word: string;
  family: string;
  intensity: number;
  timestamp: string;
  source: string;
}

export interface MomentRecord {
  id: string;
  text: string;
  created_at: string;
}

export interface ProgramModule {
  title: string;
  tools: string[];
}

export interface ProgramItem {
  id: string;
  name: string;
  sub: string;
  description: string;
  modules: ProgramModule[];
}

export interface VideoClipItem {
  id?: string;
  title: string;
  who: string;
  secs: number;
  kind: string;
  purpose: string;
  beats: string[];
  on: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  ini: string;
  blurb: string;
  band: string;
  country: string;
  city: string;
  lang: string; // preferred language code e.g. "ta", "en", "pt", "hi", "es"
  langLabel: string;
  languages: string[];
  channel: string;
  goal: string;
  role: string;
  rg: string;
  household: string;
  children: string;
  caregiving: string;
  pattern: string;
  culture: string;
  faith: string;
  gender: string;
  guidanceSwitches: Record<string, boolean>;
}

