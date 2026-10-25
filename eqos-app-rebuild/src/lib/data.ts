import { EmotionItem, ResetScript, ConversationScript, HelplineItem, ReflectionTool, ProgramItem, VideoClipItem, UserProfile } from './types';

import rawAtlas from '../data/seed/emotion-atlas.json';
import rawReset from '../data/seed/reset-scripts.json';
import rawScripts from '../data/seed/conversation-scripts.json';
import rawHelplines from '../data/seed/helplines.json';
import rawTools from '../data/seed/reflection-tools.json';

export const ATLAS_EMOTIONS: EmotionItem[] = rawAtlas as EmotionItem[];
export const RESET_SCRIPTS: ResetScript[] = rawReset as ResetScript[];
export const CONVERSATION_SCRIPTS: ConversationScript[] = rawScripts as ConversationScript[];
export const HELPLINES: HelplineItem[] = rawHelplines as HelplineItem[];
export const REFLECTION_TOOLS: ReflectionTool[] = rawTools as ReflectionTool[];

export const EMOTION_FAMILIES = [
  { id: 'anger', name: 'Anger', color: 'var(--f-anger)', icon: '🔥', count: 5 },
  { id: 'fear', name: 'Fear', color: 'var(--f-fear)', icon: '⚡', count: 5 },
  { id: 'overwhelm', name: 'Overwhelm', color: 'var(--f-overwhelm)', icon: '🌊', count: 5 },
  { id: 'sadness', name: 'Sadness', color: 'var(--f-sadness)', icon: '🌧️', count: 5 },
  { id: 'lonely', name: 'Loneliness', color: 'var(--f-lonely)', icon: '🌫️', count: 5 },
  { id: 'shame', name: 'Shame', color: 'var(--f-shame)', icon: '🥀', count: 5 },
  { id: 'guilt', name: 'Guilt', color: 'var(--f-guilt)', icon: '⚖️', count: 5 },
  { id: 'envy', name: 'Envy', color: 'var(--f-envy)', icon: '👀', count: 5 },
  { id: 'contempt', name: 'Disgust', color: 'var(--f-contempt)', icon: '🛑', count: 5 },
  { id: 'surprise', name: 'Surprise', color: 'var(--f-surprise)', icon: '✨', count: 5 },
  { id: 'joy', name: 'Joy & Calm', color: 'var(--f-joy)', icon: '☀️', count: 6 }
];

export const PROGRAMS: ProgramItem[] = [
  {
    id: 'baseqs',
    name: 'BASEQS',
    sub: 'EQ basics',
    description: 'The core of emotions and emotional intelligence: self-awareness and emotional agility.',
    modules: [
      { title: 'Emotions as data', tools: ['card-naming', 'mood-check'] },
      { title: 'Naming feelings', tools: ['card-naming', 'grounding'] },
      { title: 'The pause', tools: ['slow-exhale', 'cool-down'] }
    ]
  },
  {
    id: 'equip',
    name: 'EQUIP',
    sub: 'Up your EQ',
    description: 'Deeper EQ for accountability, creativity and empathy.',
    modules: [
      { title: 'Anger is a secondary emotion', tools: ['card-secondary', 'feeling-under'] },
      { title: 'Expect vs express', tools: ['card-expect', 'ask-for-need'] },
      { title: 'Repair after a rupture', tools: ['card-impact', 'repair-apology'] }
    ]
  },
  {
    id: 'upshift',
    name: 'UPSHIFT',
    sub: 'First-time managers',
    description: 'From individual contributor to team leader.',
    modules: [
      { title: 'Feedback without fear', tools: ['hard-feedback'] },
      { title: '1:1s that matter', tools: ['one-to-one'] },
      { title: 'Saying no upward', tools: ['say-no-senior'] }
    ]
  },
  {
    id: 'xo',
    name: 'XTREME OWNERSHIP',
    sub: 'Accountability mindset',
    description: 'Total accountability and initiative.',
    modules: [
      { title: 'From blame to facts', tools: ['story-fact'] },
      { title: 'Owning a mistake', tools: ['repair-apology', 'self-kind'] }
    ]
  },
  {
    id: 'neuro',
    name: 'NEUROZOOM',
    sub: 'Focus',
    description: 'Staying focused and sharp in a world of distractions.',
    modules: [
      { title: 'Reset the nervous system', tools: ['box-breath', 'slow-exhale'] },
      { title: 'Before high-stakes moments', tools: ['pre-performance'] }
    ]
  }
];

export const VIDEOS: Record<string, VideoClipItem> = {
  'v-secondary': {
    title: 'Anger arrives second',
    who: 'Anbarasu Thangavelu',
    secs: 75,
    kind: 'Facilitator clip',
    purpose: 'Make the idea memorable with a real scene before the card text.',
    beats: [
      'A moment from EQ Sundays: the anger that came out at dinner',
      'What was underneath: hurt that was never voiced',
      'The one question to ask: what came just before this?'
    ],
    on: 'card-secondary'
  },
  'v-expect': {
    title: 'What I expect vs what I express',
    who: 'Deepa Kannan',
    secs: 70,
    kind: 'Facilitator clip',
    purpose: 'Show how unspoken expectations turn into resentment.',
    beats: [
      'A couple, both working, one silently carrying more',
      'The disappointment that follows',
      'Say the need early and specifically'
    ],
    on: 'card-expect'
  },
  'v-impact': {
    title: 'Impact vs intention',
    who: 'Deepa Kannan',
    secs: 60,
    kind: 'Facilitator clip',
    purpose: 'Help people apologise for impact without arguing about intent.',
    beats: [
      'A harmless-meant correction in public',
      'How it landed',
      'The sentence that repairs it'
    ],
    on: 'card-impact'
  },
  'v-naming': {
    title: 'Name it to tame it',
    who: 'Dr. Gabriel',
    secs: 80,
    kind: 'Facilitator clip',
    purpose: 'Explain simply why naming a feeling lowers its intensity.',
    beats: [
      'The brain’s alarm, in plain words',
      'What the research found',
      'Try it now: one precise word'
    ],
    on: 'card-naming'
  },
  'v-feedback': {
    title: 'Feedback, two ways',
    who: 'Two actors',
    secs: 45,
    kind: 'Modelled conversation',
    purpose: 'Show a poor and a good version of the same feedback.',
    beats: [
      'Version one: vague and blaming',
      'Pause: what went wrong',
      'Version two: situation, behaviour, impact, ask'
    ],
    on: 'hard-feedback'
  },
  'v-sayno': {
    title: 'Saying no to a senior',
    who: 'Two actors',
    secs: 50,
    kind: 'Modelled conversation',
    purpose: 'Model a respectful no in a hierarchical workplace.',
    beats: [
      'The request at 6 pm',
      'A face-saving no with an offer',
      'The senior chooses'
    ],
    on: 'say-no-senior'
  },
  'v-cousin': {
    title: 'When the employee is family',
    who: 'Two actors',
    secs: 60,
    kind: 'Modelled conversation',
    purpose: 'Model a firm conversation that keeps family respect intact.',
    beats: [
      'Relationship first',
      'Facts and impact',
      'Support plus a deadline'
    ],
    on: 'cousin-employee'
  },
  'v-askneed': {
    title: 'Asking for what you need',
    who: 'Two actors',
    secs: 45,
    kind: 'Modelled conversation',
    purpose: 'Show the when, feel, need, ask pattern at home.',
    beats: [
      'The silent version',
      'The spoken version',
      'How the partner responds'
    ],
    on: 'ask-for-need'
  },
  'v-repair': {
    title: 'Repair after a rupture',
    who: 'Two actors',
    secs: 45,
    kind: 'Modelled conversation',
    purpose: 'Model a short, real apology.',
    beats: [
      'Name it',
      'Own the impact',
      'Repair and ask'
    ],
    on: 'repair-apology'
  },
  'v-teen': {
    title: 'When a teenager goes quiet',
    who: 'Two actors',
    secs: 60,
    kind: 'Modelled conversation',
    purpose: 'Show opening a door without forcing it.',
    beats: [
      'The drive with no agenda',
      'Naming what you see',
      'Listening past “I’m fine”'
    ],
    on: 'talk-teen'
  },
  'v-grounding': {
    title: '5-4-3-2-1 grounding walkthrough',
    who: 'Dr. Gabriel',
    secs: 40,
    kind: 'Walkthrough',
    purpose: 'Teach the technique once, calmly, so it can be used later without video.',
    beats: [
      'Why the senses bring you back',
      'Doing it together',
      'When to use it'
    ],
    on: 'grounding'
  },
  'v-preperf': {
    title: 'Before you walk in',
    who: 'Anbarasu Thangavelu',
    secs: 50,
    kind: 'Walkthrough',
    purpose: 'Teach the pre-performance routine once.',
    beats: [
      'Nerves and excitement feel the same',
      'Breath and first line',
      'Shoulders down, one task'
    ],
    on: 'pre-performance'
  },
  'v-fine': {
    title: '“I’m fine”',
    who: 'Deepa Kannan and Anbarasu Thangavelu',
    secs: 90,
    kind: 'Scenario story',
    purpose: 'An EQ Sundays scene about displaced anger, cut to 90 seconds.',
    beats: [
      'The scene',
      'What she needed',
      'What he could have asked'
    ],
    on: 'grow'
  },
  'v-presentation': {
    title: 'The presentation nobody asked about',
    who: 'Deepa Kannan and Anbarasu Thangavelu',
    secs: 85,
    kind: 'Scenario story',
    purpose: 'An EQ Sundays scene about being seen and supported.',
    beats: [
      'A big day at work, unnoticed at home',
      'The anger that came later',
      'Emotional attunement in one question'
    ],
    on: 'grow'
  },
  'v-alumni': {
    title: 'Alumni win: a 1:1 that went differently',
    who: 'A past participant',
    secs: 60,
    kind: 'Alumni win',
    purpose: 'Peer proof that the tools work in real life.',
    beats: [
      'The old pattern',
      'What they tried',
      'What changed'
    ],
    on: 'grow'
  }
};

export function getClip(id: string): VideoClipItem | null {
  if (VIDEOS[id]) return { ...VIDEOS[id], id };
  const m = /^prog:([^:]+):(\d+)$/.exec(id);
  if (!m) return null;
  const progId = m[1];
  const modIndex = +m[2];

  let pr: ProgramItem | undefined;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('eqos_custom_programs');
      if (stored) {
        const list: ProgramItem[] = JSON.parse(stored);
        pr = list.find(x => 
          x.id === progId || 
          x.id.toLowerCase() === progId.toLowerCase() ||
          x.name.toLowerCase() === progId.toLowerCase()
        );
      }
    } catch (e) {}
  }
  if (!pr) {
    pr = PROGRAMS.find(x => 
      x.id === progId || 
      x.id.toLowerCase() === progId.toLowerCase() ||
      x.name.toLowerCase() === progId.toLowerCase()
    );
  }

  if (!pr) return null;
  const mod = pr.modules && pr.modules[modIndex];
  if (!mod) return null;
  const who = ['Deepa Kannan', 'Anbarasu Thangavelu', 'Dr. Gabriel'][modIndex % 3];
  return {
    id,
    title: mod.title,
    who,
    secs: 75,
    kind: 'Facilitator clip',
    purpose: 'Opens the module in the facilitator’s own voice, so the program continues after the workshop.',
    beats: [
      'The idea in one sentence',
      'A real example from the workshop',
      'What to try this week'
    ],
    on: 'program ' + pr.name
  };
}

export const TOOL_NAMES: Record<string, { name: string; mins: string; desc: string }> = {
  'card-secondary': { name: 'Anger is often a secondary emotion', mins: '2 min', desc: 'Anger arrives second. Find what came first.' },
  'feeling-under': { name: 'The feeling under the feeling', mins: '4 min', desc: 'Anger often arrives second. Find what came first.' },
  'card-expect': { name: 'What I expect vs what I express', mins: '2 min', desc: 'Turn unspoken expectations into clear requests.' },
  'ask-for-need': { name: 'Ask for what you need', mins: '4 min', desc: 'Say the expectation out loud before it becomes resentment.' },
  'card-impact': { name: 'Impact vs intention', mins: '2 min', desc: 'Both are real. Apologise for impact first.' },
  'repair-apology': { name: 'Repair after a rupture', mins: '4 min', desc: 'Name it, own the impact, repair, ask.' },
  'card-naming': { name: 'Why naming a feeling helps', mins: '2 min', desc: 'Name it to tame it: precision brings calm.' },
  'mood-check': { name: 'Check in', mins: '30 sec', desc: 'A feeling word and how strong it is.' },
  'grounding': { name: '5-4-3-2-1 grounding', mins: '2 min', desc: 'Bring attention back to the room.' },
  'slow-exhale': { name: 'Slow-exhale breathing', mins: '1 min', desc: 'A longer out-breath helps the body settle.' },
  'cool-down': { name: 'Cool-down for anger', mins: '1 min', desc: 'Shake out the heat, slow the breath.' },
  'hard-feedback': { name: 'Feedback that lands', mins: '5 min', desc: 'Situation, behaviour, impact, ask.' },
  'one-to-one': { name: '1:1 prep', mins: '4 min', desc: 'Prepare for a supportive conversation.' },
  'say-no-senior': { name: 'Saying no to a senior', mins: '5 min', desc: 'Protect your priorities without loss of face.' },
  'story-fact': { name: 'Story vs fact', mins: '3 min', desc: 'Separate what happened from the story about it.' },
  'self-kind': { name: 'What would you say to a friend?', mins: '3 min', desc: 'Separate the person from the act.' },
  'box-breath': { name: 'Box breathing', mins: '2 min', desc: 'Four-count breathing for steadiness under pressure.' },
  'pre-performance': { name: 'Pre-performance routine', mins: '2 min', desc: 'For exams, pitches, interviews and matches.' }
};

export const GOALS: Record<string, string> = {
  self: 'Understand myself',
  stress: 'Stay calm under fire',
  hardtime: 'Stop spiralling',
  repair: 'Repair relationships',
  lead: 'Lead with empathy',
  bound: 'Hold boundaries'
};

export const AVAILABLE_LANGUAGES = [
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' }
];

export const DEFAULT_PROFILES: Record<string, UserProfile> = {
  priya: {
    id: 'priya',
    name: 'Priya',
    email: 'priya@example.com',
    phone: '+91 98765 43210',
    ini: 'P',
    blurb: '23 · software engineer · Bengaluru',
    band: '18–24',
    country: 'India',
    city: 'Bengaluru',
    lang: 'ta',
    langLabel: 'Tamil + English',
    languages: ['ta', 'en'],
    channel: 'Web app + WhatsApp reminders',
    goal: 'self',
    role: 'Software engineer',
    rg: 'knowledge',
    household: 'Shared hostel; family in Madurai',
    children: 'None',
    caregiving: 'None',
    pattern: 'Hybrid, long evenings online',
    culture: 'Family-first at home; strong hierarchy at work',
    faith: 'Not shared',
    gender: 'Not shared',
    guidanceSwitches: {
      household: true,
      children: true,
      caregiving: true,
      role: true,
      pattern: true,
      culture: true,
      faith: true,
      gender: true
    }
  },
  mark: {
    id: 'mark',
    name: 'Mark',
    email: 'mark@example.com',
    phone: '+44 7700 900123',
    ini: 'M',
    blurb: '46 · nurse manager · Manchester',
    band: '35–49',
    country: 'United Kingdom',
    city: 'Manchester',
    lang: 'en',
    langLabel: 'English',
    languages: ['en'],
    channel: 'App + smartwatch',
    goal: 'stress',
    role: 'Nurse manager',
    rg: 'healthcare',
    household: 'Married; two teenagers',
    children: 'Two teenagers (14, 17)',
    caregiving: 'Mother with dementia',
    pattern: 'Some night shifts',
    culture: 'Direct; restraint at work is normal',
    faith: 'Not shared',
    gender: 'Not shared',
    guidanceSwitches: {
      household: true,
      children: true,
      caregiving: true,
      role: true,
      pattern: true,
      culture: true,
      faith: true,
      gender: true
    }
  },
  amina: {
    id: 'amina',
    name: 'Amina',
    email: 'amina@example.com',
    phone: '+234 802 123 4567',
    ini: 'A',
    blurb: '38 · family logistics firm · Lagos',
    band: '35–49',
    country: 'Nigeria',
    city: 'Lagos',
    lang: 'en',
    langLabel: 'English (Nigerian examples)',
    languages: ['en'],
    channel: 'Web app + WhatsApp reminders',
    goal: 'lead',
    role: 'Co-owner, family logistics firm',
    rg: 'founder',
    household: 'Married; three children; relatives on the payroll',
    children: 'Three (6, 10, 13)',
    caregiving: 'None',
    pattern: 'Long days, frequent travel',
    culture: 'Respect for elders; family loyalty in business',
    faith: 'Opted in: faith-based reflection',
    gender: 'Not shared',
    guidanceSwitches: {
      household: true,
      children: true,
      caregiving: true,
      role: true,
      pattern: true,
      culture: true,
      faith: true,
      gender: true
    }
  },
  amit: {
    id: 'amit',
    name: 'Amit',
    email: 'amit@example.com',
    phone: '+91 98200 12345',
    ini: 'A',
    blurb: '34 · startup founder · New Delhi',
    band: '25–34',
    country: 'India',
    city: 'New Delhi',
    lang: 'hi',
    langLabel: 'Hindi + English',
    languages: ['hi', 'en'],
    channel: 'Web app + WhatsApp',
    goal: 'lead',
    role: 'Founder & CEO',
    rg: 'founder',
    household: 'Married, nuclear family',
    children: 'One (3)',
    caregiving: 'None',
    pattern: 'Fast-paced, high pressure',
    culture: 'Direct, proactive, collaborative',
    faith: 'Not shared',
    gender: 'Male',
    guidanceSwitches: {
      household: true,
      children: true,
      caregiving: true,
      role: true,
      pattern: true,
      culture: true,
      faith: true,
      gender: true
    }
  },
  lucas: {
    id: 'lucas',
    name: 'Lucas',
    email: 'lucas@example.com',
    phone: '+55 11 91234 5678',
    ini: 'L',
    blurb: '67 · retired · São Paulo',
    band: '65+',
    country: 'Brazil',
    city: 'São Paulo',
    lang: 'pt',
    langLabel: 'Português',
    languages: ['pt'],
    channel: 'Voice-first',
    goal: 'hardtime',
    role: 'Retired bank manager',
    rg: 'retired',
    household: 'Lives alone; widowed last year',
    children: 'Two adult children',
    caregiving: 'None',
    pattern: 'Retired',
    culture: 'Warm, expressive family culture',
    faith: 'Not shared',
    gender: 'Not shared',
    guidanceSwitches: {
      household: true,
      children: true,
      caregiving: true,
      role: true,
      pattern: true,
      culture: true,
      faith: true,
      gender: true
    }
  }
};

