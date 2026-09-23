import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine';
import { Difficulty, PlayerStats } from '../game/types';
import { GameStorage } from '../game/storage';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, Lightbulb, Volume2, VolumeX, Award, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { sounds } from '../game/audio';

interface GameContainerProps {
  onWin: (result: {
    timeMs: number;
    score: number;
    orbs: number;
    difficulty: Difficulty;
    moves: number;
    usedHints: boolean;
  }) => void;
  stats: PlayerStats;
  onRefreshStats: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ onWin, stats, onRefreshStats }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isPaused, setIsPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [timeDisplay, setTimeDisplay] = useState('00:00.0');
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [orbsDisplay, setOrbsDisplay] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    engine.onWinCallback = (res) => {
      onWin(res);
      onRefreshStats();
    };

    engine.startNewGame(difficulty);

    const timerInterval = setInterval(() => {
      if (engine.isRunning && !engine.isPaused && !engine.isWon) {
        const totalMs = engine.elapsedTimeMs;
        const mins = Math.floor(totalMs / 60000);
        const secs = Math.floor((totalMs % 60000) / 1000);
        const tenths = Math.floor((totalMs % 1000) / 100);
        setTimeDisplay(
          `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`
        );
        setScoreDisplay(engine.currentScore);
        setOrbsDisplay(engine.orbsCollectedThisRun);
      }
    }, 100);

    const onResize = () => engine.handleResize();
    window.addEventListener('resize', onResize);

    return () => {
      clearInterval(timerInterval);
      window.removeEventListener('resize', onResize);
      engine.destroy();
    };
  }, []);

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    if (engineRef.current) {
      engineRef.current.startNewGame(diff);
      setIsPaused(false);
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startNewGame(difficulty);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pauseGame();
      setIsPaused(engineRef.current.isPaused);
    }
  };

  const handleHint = () => {
    if (engineRef.current) {
      engineRef.current.requestHint();
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sounds.setSoundEnabled(next);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Barra de Status do Jogo */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 bg-slate-900/80 p-3 rounded-xl border border-cyan-500/20 backdrop-blur-md">
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">TEMPO</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{timeDisplay}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">SCORE</span>
          <span className="text-xl font-bold font-mono text-amber-400">{scoreDisplay}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">DADOS COLETADOS</span>
          <span className="text-xl font-bold font-mono text-fuchsia-400">💎 {orbsDisplay}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">CRÉDITOS</span>
          <span className="text-xl font-bold font-mono text-emerald-400">⚡ {stats.credits}</span>
        </div>
      </div>

      {/* Seleção de Dificuldade & Controles Rápidos */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 mb-3">
        <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
          {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => handleDifficultyChange(d)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                difficulty === d
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {d === 'easy' && 'Fácil'}
              {d === 'medium' && 'Médio'}
              {d === 'hard' && 'Difícil'}
              {d === 'expert' && 'Especialista'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleHint}
            className="border-amber-500/30 text-amber-300 hover:bg-amber-950/30 text-xs gap-1.5"
            title="Dica A* (-150 pontos)"
          >
            <Lightbulb className="w-3.5 h-3.5" /> Dica A*
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handlePause}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRestart}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
            title="Novo Labirinto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={toggleSound}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Área do Canvas de Jogo */}
      <div className="relative w-full max-w-[640px] aspect-square flex items-center justify-center p-3 rounded-2xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="rounded-xl cursor-crosshair touch-none"
        />

        {isPaused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
            <h3 className="text-2xl font-bold font-mono text-cyan-400 mb-2">JOGO EM PAUSA</h3>
            <p className="text-sm text-slate-400 mb-4">Pressione Continuar para retornar à grade</p>
            <Button onClick={handlePause} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
              Continuar Partida
            </Button>
          </div>
        )}
      </div>

      {/* D-Pad Virtual para Mobile ou Mouse */}
      <div className="flex flex-col items-center mt-4 sm:hidden">
        <Button
          size="sm"
          variant="outline"
          onClick={() => engineRef.current?.move('up')}
          className="w-12 h-12 mb-1 border-slate-700 bg-slate-900/60"
        >
          <ArrowUp className="w-5 h-5 text-cyan-400" />
        </Button>
        <div className="flex gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => engineRef.current?.move('left')}
            className="w-12 h-12 border-slate-700 bg-slate-900/60"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => engineRef.current?.move('down')}
            className="w-12 h-12 border-slate-700 bg-slate-900/60"
          >
            <ArrowDown className="w-5 h-5 text-cyan-400" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => engineRef.current?.move('right')}
            className="w-12 h-12 border-slate-700 bg-slate-900/60"
          >
            <ArrowRight className="w-5 h-5 text-cyan-400" />
          </Button>
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-slate-500 font-mono">
        Comandos: <span className="text-slate-300">W, A, S, D</span> ou <span className="text-slate-300">Setas</span> | Dica: <span className="text-slate-300">H</span> | Pausa: <span className="text-slate-300">P</span>
      </div>
    </div>
  );
};
