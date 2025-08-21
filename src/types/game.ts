export interface GameStats {
  totalPlayers: number;
  dailyPlayers: number;
  averageScore: number;
  highestScore: number;
  totalGamesPlayed: number;
  averageGameLength: string;
}

export interface PowerUp {
  name: string;
  description: string;
  icon: string;
  rarity: string;
}

export interface Controls {
  [key: string]: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  difficulty: string;
  maxPlayers: number;
  averageGameTime: string;
  tags: string[];
  isActive: boolean;
  betAmounts: number[];
  stats: GameStats;
  controls: Controls;
  rules: string[];
  powerUps: PowerUp[];
  status?: string;
}
