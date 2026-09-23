import { PlayerStats, Achievement, LeaderboardEntry, DailyMission, Difficulty } from './types';

const STORAGE_KEY_STATS = 'mazequest_player_stats_v1';
const STORAGE_KEY_LEADERBOARD = 'mazequest_leaderboard_v1';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'Primeiro Escape',
    description: 'Complete qualquer labirinto com sucesso.',
    rewardXp: 150,
    rewardCredits: 50,
    icon: '🚀'
  },
  {
    id: 'speedrunner',
    title: 'Velocista Neon',
    description: 'Vença um labirinto em menos de 15 segundos.',
    rewardXp: 300,
    rewardCredits: 100,
    icon: '⚡'
  },
  {
    id: 'orb_collector',
    title: 'Mineiro de Dados',
    description: 'Colete um total acumulado de 50 orbes.',
    rewardXp: 250,
    rewardCredits: 120,
    icon: '💎'
  },
  {
    id: 'expert_master',
    title: 'Mestre da Sobrecarga',
    description: 'Vença no modo Especialista.',
    rewardXp: 600,
    rewardCredits: 250,
    icon: '👑'
  },
  {
    id: 'clean_run',
    title: 'Instinto Puro',
    description: 'Vença uma partida sem usar nenhuma dica.',
    rewardXp: 200,
    rewardCredits: 80,
    icon: '🧠'
  },
  {
    id: 'level_5',
    title: 'Engenheiro Veterano',
    description: 'Alcance o nível 5 de jogador.',
    rewardXp: 400,
    rewardCredits: 200,
    icon: '⭐'
  }
];

export const SKINS = [
  { id: 'cyan_spark', name: 'Faísca Ciano', color: '#00f2fe', cost: 0 },
  { id: 'synth_pink', name: 'Synthwave Neon', color: '#ff007f', cost: 150 },
  { id: 'matrix_green', name: 'Protocolo Verde', color: '#00ff66', cost: 300 },
  { id: 'solar_flare', name: 'Explosão Solar', color: '#ffb703', cost: 450 },
  { id: 'quantum_purple', name: 'Vértice Quântico', color: '#a855f7', cost: 600 }
];

export const THEMES = [
  { id: 'cyberpunk', name: 'Cyberpunk Grid', wallColor: '#1e1b4b', pathColor: '#09090b', glowColor: '#06b6d4', cost: 0 },
  { id: 'dracula', name: 'Drácula Neon', wallColor: '#271a38', pathColor: '#120d1c', glowColor: '#ff79c6', cost: 200 },
  { id: 'emerald', name: 'Terminal Esmeralda', wallColor: '#052e16', pathColor: '#022c22', glowColor: '#10b981', cost: 350 },
  { id: 'retro_sunset', name: 'Pôr do Sol 80s', wallColor: '#451a03', pathColor: '#1c1917', glowColor: '#f97316', cost: 500 }
];

export class GameStorage {
  public static getStats(): PlayerStats {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STATS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (_) {}

    return {
      level: 1,
      currentXp: 0,
      nextLevelXp: 500,
      credits: 100,
      gamesPlayed: 0,
      gamesWon: 0,
      bestTime: {
        easy: null,
        medium: null,
        hard: null,
        expert: null
      },
      totalOrbsCollected: 0,
      selectedSkin: 'cyan_spark',
      unlockedSkins: ['cyan_spark'],
      selectedTheme: 'cyberpunk',
      unlockedThemes: ['cyberpunk'],
      achievements: []
    };
  }

  public static saveStats(stats: PlayerStats) {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (_) {}
  }

  public static addXpAndCredits(xpToAdd: number, creditsToAdd: number): { stats: PlayerStats; leveledUp: boolean } {
    const stats = this.getStats();
    stats.currentXp += xpToAdd;
    stats.credits += creditsToAdd;

    let leveledUp = false;
    while (stats.currentXp >= stats.nextLevelXp) {
      stats.currentXp -= stats.nextLevelXp;
      stats.level += 1;
      stats.nextLevelXp = Math.floor(stats.nextLevelXp * 1.35);
      stats.credits += 150; // bônus de nível
      leveledUp = true;
    }

    if (stats.level >= 5 && !stats.achievements.includes('level_5')) {
      stats.achievements.push('level_5');
    }

    this.saveStats(stats);
    return { stats, leveledUp };
  }

  public static recordGameEnd(difficulty: Difficulty, won: boolean, timeMs: number, orbsCollected: number, usedHints: boolean): { stats: PlayerStats; newAchievements: Achievement[] } {
    const stats = this.getStats();
    stats.gamesPlayed += 1;
    stats.totalOrbsCollected += orbsCollected;

    const newAchievements: Achievement[] = [];

    if (won) {
      stats.gamesWon += 1;
      const currentBest = stats.bestTime[difficulty];
      if (!currentBest || timeMs < currentBest) {
        stats.bestTime[difficulty] = timeMs;
      }

      // Conquista de primeiro escape
      if (!stats.achievements.includes('first_win')) {
        stats.achievements.push('first_win');
        const ach = ALL_ACHIEVEMENTS.find((a) => a.id === 'first_win');
        if (ach) newAchievements.push(ach);
      }

      // Conquista de velocidade
      if (timeMs < 15000 && !stats.achievements.includes('speedrunner')) {
        stats.achievements.push('speedrunner');
        const ach = ALL_ACHIEVEMENTS.find((a) => a.id === 'speedrunner');
        if (ach) newAchievements.push(ach);
      }

      // Conquista especialista
      if (difficulty === 'expert' && !stats.achievements.includes('expert_master')) {
        stats.achievements.push('expert_master');
        const ach = ALL_ACHIEVEMENTS.find((a) => a.id === 'expert_master');
        if (ach) newAchievements.push(ach);
      }

      // Sem dicas
      if (!usedHints && !stats.achievements.includes('clean_run')) {
        stats.achievements.push('clean_run');
        const ach = ALL_ACHIEVEMENTS.find((a) => a.id === 'clean_run');
        if (ach) newAchievements.push(ach);
      }
    }

    // Colete de orbes
    if (stats.totalOrbsCollected >= 50 && !stats.achievements.includes('orb_collector')) {
      stats.achievements.push('orb_collector');
      const ach = ALL_ACHIEVEMENTS.find((a) => a.id === 'orb_collector');
      if (ach) newAchievements.push(ach);
    }

    this.saveStats(stats);
    return { stats, newAchievements };
  }

  public static getLeaderboard(): LeaderboardEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
      if (raw) return JSON.parse(raw);
    } catch (_) {}

    // Dados iniciais de simulação de jogadores na rede
    return [
      { id: '1', name: 'CyberBlade', timeMs: 14200, difficulty: 'easy', score: 980, date: 'Hoje' },
      { id: '2', name: 'NeonPilot', timeMs: 18450, difficulty: 'easy', score: 850, date: 'Hoje' },
      { id: '3', name: 'GridMaster', timeMs: 42100, difficulty: 'medium', score: 1950, date: 'Ontem' },
      { id: '4', name: 'GlitchRunner', timeMs: 51200, difficulty: 'medium', score: 1720, date: 'Ontem' },
      { id: '5', name: 'QuantumZero', timeMs: 112000, difficulty: 'expert', score: 5400, date: 'Há 2 dias' }
    ];
  }

  public static addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>) {
    const list = this.getLeaderboard();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      date: 'Agora'
    };
    list.push(newEntry);
    list.sort((a, b) => b.score - a.score);
    try {
      localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(list.slice(0, 30)));
    } catch (_) {}
  }
}
