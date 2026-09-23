export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface MazeCell {
  x: number;
  y: number;
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  visited: boolean;
  hasOrb?: boolean;
  hasGem?: boolean;
}

export interface PlayerStats {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  credits: number;
  gamesPlayed: number;
  gamesWon: number;
  bestTime: Record<Difficulty, number | null>;
  totalOrbsCollected: number;
  selectedSkin: string;
  unlockedSkins: string[];
  selectedTheme: string;
  unlockedThemes: string[];
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  rewardCredits: number;
  icon: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  timeMs: number;
  difficulty: Difficulty;
  score: number;
  date: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  rewardCredits: number;
  rewardXp: number;
}
