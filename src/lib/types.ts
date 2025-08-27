export interface Memory {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  date: string;
  photos: string[];
  videoLinks: string[];
  aiStory?: string;
  sentiment?: 'happy' | 'nostalgic' | 'sad' | 'excited' | 'neutral';
  sentimentScore?: number;
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: {
    type: 'memory_count' | 'country_count' | 'sentiment_streak' | 'story_generation';
    threshold: number;
  };
}

export interface UserStats {
  totalMemories: number;
  countriesVisited: number;
  sentimentBreakdown: {
    happy: number;
    nostalgic: number;
    sad: number;
    excited: number;
    neutral: number;
  };
  streakDays: number;
  badges: Badge[];
}

export interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  preview: string;
  sentiment: Memory['sentiment'];
}

export type ViewMode = 'map' | 'timeline' | 'dashboard' | 'profile';

export interface TimelineGroup {
  year: number;
  month?: number;
  memories: Memory[];
}

export interface SentimentAnalysis {
  sentiment: Memory['sentiment'];
  score: number;
  confidence: number;
}