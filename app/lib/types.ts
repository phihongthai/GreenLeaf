export type GradeCode = 'kindergarten' | 'kids1' | 'kids2' | 'teens';

export interface Grade {
  id: string;
  code: GradeCode;
  name: string;
  age_range: string;
  order_index: number;
}

export interface Lesson {
  id: string;
  grade_id: string;
  title: string;
  order_index: number;
  is_unlocked?: boolean;
  /** Per-student teacher override: true = open, false = locked, undefined = follow lesson default. */
  access_override?: boolean;
  created_by: string | null;
  created_at: string;
}

export interface WritingTopic {
  id: string;
  grade_id: string;
  title: string;
  prompt: string;
  order_index: number;
  created_by: string | null;
  created_at: string;
}

export type MissionType = 'words_explorer' | 'phonics' | 'speaking_challenge';

export interface WordsExplorerContent {
  topic: string;
  words: { word: string; imageUrl: string; meaning?: string }[];
}

export interface PhonicsLine {
  text: string;
  imageUrl?: string;
  imageDescription?: string;
}

export interface PhonicsContent {
  highlight?: string;
  lines: PhonicsLine[];
}

export interface SpeakingChallengeContent {
  script: string;
  prompt?: string;
  imageUrl?: string;
  imageDescription?: string;
}

export type MissionContent = WordsExplorerContent | PhonicsContent | SpeakingChallengeContent;

export interface Mission {
  id: string;
  lesson_id: string;
  type: MissionType;
  order_index: number;
  title: string;
  content: MissionContent;
}

export interface RewardState {
  student_id: string;
  leaf_count: number;
  streak_days: number;
  last_active_date: string | null;
}
