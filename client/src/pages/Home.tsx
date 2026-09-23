import React, { useState, useEffect } from 'react';
import { GameContainer } from '../components/GameContainer';
import { PlayerStats, LeaderboardEntry, Difficulty, Achievement } from '../game/types';
import { GameStorage, ALL_ACHIEVEMENTS, SKINS, THEMES } from '../game/storage';
import { Button } from '../components/ui/button';
import { Trophy, ShoppingBag, ShieldCheck, Gamepad2, Flame, RefreshCw, Zap } from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState<PlayerStats>(GameStorage.getStats());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(GameStorage.getLeaderboard());
  const [activeTab, setActiveTab] = useState<'game' | 'leaderboard' | 'shop' | 'achievements'>('game');
  const [victoryModal, setVictoryModal] = useState<{
    visible: boolean;
    timeMs: number;
    score: number;
    orbs: number;
    difficulty: Difficulty;
    moves: number;
    unlockedAchievements: Achievement[];
    leveledUp: boolean;
  } | null>(null);

  const refreshStats = () => {
    setStats(GameStorage.getStats());
    setLeaderboard(GameStorage.getLeaderboard());
  };

  const handleGameWin = (res: {
    timeMs: number;
    score: number;
    orbs: number;
    difficulty: Difficulty;
    moves: number;
    usedHints: boolean;
  }) => {
    const { stats: updatedStats, newAchievements } = GameStorage.recordGameEnd(
      res.difficulty,
      true,
      res.timeMs,
      res.orbs,
      res.usedHints
    );

    // Recompensas em XP e Créditos
    const earnedXp = Math.floor(res.score * 0.4) + res.orbs * 20;
    const earnedCredits = Math.floor(res.score * 0.1) + res.orbs * 10;
    const { leveledUp } = GameStorage.addXpAndCredits(earnedXp, earnedCredits);

    // Adiciona ao Leaderboard
    GameStorage.addLeaderboardEntry({
      name: `Piloto-${stats.selectedSkin.split('_')[0].toUpperCase()}`,
      timeMs: res.timeMs,
      difficulty: res.difficulty,
      score: res.score
    });

    setVictoryModal({
      visible: true,
      timeMs: res.timeMs,
      score: res.score,
      orbs: res.orbs,
      difficulty: res.difficulty,
      moves: res.moves,
      unlockedAchievements: newAchievements,
      leveledUp
    });

    refreshStats();
  };

  const handleBuySkin = (skinId: string, cost: number) => {
    if (stats.credits >= cost && !stats.unlockedSkins.includes(skinId)) {
      const s = { ...stats };
      s.credits -= cost;
      s.unlockedSkins.push(skinId);
      s.selectedSkin = skinId;
      GameStorage.saveStats(s);
      refreshStats();
    }
  };

  const handleSelectSkin = (skinId: string) => {
    if (stats.unlockedSkins.includes(skinId)) {
      const s = { ...stats };
      s.selectedSkin = skinId;
      GameStorage.saveStats(s);
      refreshStats();
    }
  };

  const handleBuyTheme = (themeId: string, cost: number) => {
    if (stats.credits >= cost && !stats.unlockedThemes.includes(themeId)) {
      const s = { ...stats };
      s.credits -= cost;
      s.unlockedThemes.push(themeId);
      s.selectedTheme = themeId;
      GameStorage.saveStats(s);
      refreshStats();
    }
  };

  const handleSelectTheme = (themeId: string) => {
    if (stats.unlockedThemes.includes(themeId)) {
      const s = { ...stats };
      s.selectedTheme = themeId;
      GameStorage.saveStats(s);
      refreshStats();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Barra de Navegação Superior */}
      <header className="border-b border-cyan-500/20 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400">
                MazeQuest Arcade
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                Grid Cyberpunk • Procedural DFS
              </p>
            </div>
          </div>

          {/* Perfil & Nível */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> NÍVEL {stats.level}
              </div>
              <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (stats.currentXp / stats.nextLevelXp) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
              <Zap className="w-3.5 h-3.5" /> {stats.credits} CR
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col items-center">
        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 mb-6 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <Button
            size="sm"
            variant={activeTab === 'game' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('game')}
            className={activeTab === 'game' ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400'}
          >
            <Gamepad2 className="w-4 h-4 mr-1.5" /> Jogo
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'leaderboard' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('leaderboard')}
            className={activeTab === 'leaderboard' ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400'}
          >
            <Trophy className="w-4 h-4 mr-1.5" /> Classificação
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'shop' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('shop')}
            className={activeTab === 'shop' ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400'}
          >
            <ShoppingBag className="w-4 h-4 mr-1.5" /> Loja Neon
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'achievements' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('achievements')}
            className={activeTab === 'achievements' ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400'}
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" /> Conquistas
          </Button>
        </div>

        {/* View: Jogo */}
        {activeTab === 'game' && (
          <GameContainer onWin={handleGameWin} stats={stats} onRefreshStats={refreshStats} />
        )}

        {/* View: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-400">
                <Trophy className="w-5 h-5 text-amber-400" /> Melhores Pontuações da Rede
              </h2>
              <span className="text-xs font-mono text-slate-500">Local Leaderboard</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-xs">
                    <th className="pb-3 px-2">#</th>
                    <th className="pb-3 px-2">PILOTO</th>
                    <th className="pb-3 px-2">DIFICULDADE</th>
                    <th className="pb-3 px-2">TEMPO</th>
                    <th className="pb-3 px-2 text-right">PONTOS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {leaderboard.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2 text-cyan-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-2 font-sans font-medium text-slate-200">{item.name}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-400">
                        {(item.timeMs / 1000).toFixed(1)}s
                      </td>
                      <td className="py-3 px-2 text-right text-amber-400 font-bold">{item.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View: Loja */}
        {activeTab === 'shop' && (
          <div className="w-full max-w-3xl space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Cores e Estilos do Piloto
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {SKINS.map((skin) => {
                  const isUnlocked = stats.unlockedSkins.includes(skin.id);
                  const isSelected = stats.selectedSkin === skin.id;

                  return (
                    <div
                      key={skin.id}
                      className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-full mb-3 flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: skin.color, boxShadow: `0 0 16px ${skin.color}` }}
                      >
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                      <span className="font-bold text-sm text-slate-200 mb-1">{skin.name}</span>
                      <span className="text-xs text-slate-500 mb-4 font-mono">
                        {skin.cost === 0 ? 'Gratuito' : `${skin.cost} Créditos`}
                      </span>

                      {isSelected ? (
                        <span className="text-xs font-bold font-mono text-cyan-400">ATIVADO</span>
                      ) : isUnlocked ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectSkin(skin.id)}
                          className="w-full text-xs"
                        >
                          Equipar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={stats.credits < skin.cost}
                          onClick={() => handleBuySkin(skin.id, skin.cost)}
                          className="w-full text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                        >
                          Comprar
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Temas de Labirinto
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEMES.map((theme) => {
                  const isUnlocked = stats.unlockedThemes.includes(theme.id);
                  const isSelected = stats.selectedTheme === theme.id;

                  return (
                    <div
                      key={theme.id}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/20'
                          : 'border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg border-2"
                          style={{
                            backgroundColor: theme.pathColor,
                            borderColor: theme.glowColor,
                            boxShadow: `0 0 10px ${theme.glowColor}`
                          }}
                        />
                        <div>
                          <div className="font-bold text-sm text-slate-200">{theme.name}</div>
                          <div className="text-xs text-slate-500 font-mono">
                            {theme.cost === 0 ? 'Padrão' : `${theme.cost} Créditos`}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="text-xs font-bold font-mono text-cyan-400">ATIVO</span>
                      ) : isUnlocked ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectTheme(theme.id)}
                          className="text-xs"
                        >
                          Aplicar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={stats.credits < theme.cost}
                          onClick={() => handleBuyTheme(theme.id, theme.cost)}
                          className="text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                        >
                          Comprar
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* View: Conquistas */}
        {activeTab === 'achievements' && (
          <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-400 mb-6">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Conquistas e Recompensas
            </h2>

            <div className="space-y-3">
              {ALL_ACHIEVEMENTS.map((ach) => {
                const unlocked = stats.achievements.includes(ach.id);

                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                      unlocked
                        ? 'border-emerald-500/30 bg-emerald-950/10'
                        : 'border-slate-800 bg-slate-950/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="text-2xl p-2 rounded-lg bg-slate-900 border border-slate-800">
                        {ach.icon}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-200">{ach.title}</div>
                        <div className="text-xs text-slate-400">{ach.description}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-bold text-amber-400">+{ach.rewardXp} XP</span>
                      <span className="text-xs font-mono text-emerald-400">+{ach.rewardCredits} CR</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Vitória */}
      {victoryModal && victoryModal.visible && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(16,185,129,0.5)] mb-4">
              🏆
            </div>

            <h3 className="text-2xl font-black tracking-wide text-white mb-1">LABIRINTO CONCLUÍDO!</h3>
            <p className="text-xs text-cyan-400 font-mono mb-4 uppercase tracking-widest">
              Dificuldade: {victoryModal.difficulty}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono text-sm">
              <div>
                <span className="text-slate-500 text-xs block">TEMPO</span>
                <span className="text-white font-bold">{(victoryModal.timeMs / 1000).toFixed(2)}s</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">SCORE FINAL</span>
                <span className="text-amber-400 font-bold">{victoryModal.score}</span>
              </div>
            </div>

            {victoryModal.leveledUp && (
              <div className="p-2 mb-4 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300">
                ⭐ SUBIU DE NÍVEL! Bônus de créditos creditado.
              </div>
            )}

            {victoryModal.unlockedAchievements.length > 0 && (
              <div className="mb-4 text-left">
                <span className="text-xs text-slate-400 font-mono block mb-1">Novas Conquistas:</span>
                {victoryModal.unlockedAchievements.map((ach) => (
                  <div key={ach.id} className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                    <span>{ach.icon}</span> {ach.title} (+{ach.rewardCredits} CR)
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={() => setVictoryModal(null)}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              Jogar Próximo Labirinto
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
