export interface LessonPoint {
  id: string;
  title: string;
  text: string;
}

export interface LessonQA {
  q: string;
  a: string;
}

export interface LessonItem {
  id: string;
  title: string;
  description?: string;
  iconName: string;
  category: string;
  points?: LessonPoint[];
  content?: string; // For simple text-based content
  offlineSummary?: string;       // AI pre-generated summary
  keyPoints?: string[];          // AI key points
  qaList?: LessonQA[];           // Q&A section
  relatedIds?: string[];         // Offline related lesson suggestions
}

export interface HighlightItem {
  id: string;
  lessonId: string;
  text: string;
  color: string;
  createdAt: string;
}

export interface LessonNote {
  id: string;
  lessonId: string;
  content: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface PracticeSession {
  id: string;
  title: string;
  duration: number; // in seconds
  date: string;
  audioBlobUrl?: string; // active session object url
  hasAudio: boolean;
  notes?: string;
}

export interface ProgressState {
  readLessons: string[]; // ids of read lesson items
  completedLessonsPercent: number;
}

export type ThemeType = 
  | 'light' 
  | 'dark' 
  | 'sepia' 
  | 'emerald' 
  | 'ocean' 
  | 'rose' 
  | 'coffee' 
  | 'lavender' 
  | 'crimson' 
  | 'navy';

export type FontSizeType = 'sm' | 'md' | 'lg' | 'xl';
export type LineHeightType = 'normal' | 'relaxed' | 'loose';
export type LayoutType = 'grid' | 'list';

export interface SettingsState {
  theme: ThemeType;
  fontSize: FontSizeType;
  lineHeight: LineHeightType;
  layoutType: LayoutType;
}

export interface InspirationalQuote {
  text: string;
  source: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

