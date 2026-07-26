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
  created_by: string | null;
  created_at: string;
}

export type MissionType = 'words_explorer' | 'phonics' | 'speaking_challenge';

export interface WordsExplorerContent {
  topic: string;
  words: { word: string; imageUrl: string }[];
}

export interface PhonicsContent {
  highlight?: string;
  lines: string[];
}

export interface SpeakingChallengeContent {
  script: string;
  prompt?: string;
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
