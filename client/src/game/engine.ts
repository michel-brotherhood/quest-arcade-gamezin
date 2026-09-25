import { MazeCell, Difficulty, PlayerStats } from './types';
import { MazeGenerator, DIFFICULTY_CONFIG } from './generator';
import { AStarFinder } from './pathfinder';
import { GameStorage, SKINS, THEMES } from './storage';
import { sounds } from './audio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private hintTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Estado do Labirinto
  public grid: MazeCell[][] = [];
  public cols: number = 11;
  public rows: number = 11;
  public difficulty: Difficulty = 'easy';

  // Jogador
  public player = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    renderX: 0,
    renderY: 0
  };

  // Partículas
  private particles: Particle[] = [];

  // Temporizador e Métricas
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isWon: boolean = false;
  public startTime: number = 0;
  public elapsedTimeMs: number = 0;
  public orbsCollectedThisRun: number = 0;
  public hintsUsed: number = 0;
  public movesCount: number = 0;
  public currentScore: number = 0;

  // Rota de Dica
  public hintPath: { x: number; y: number }[] = [];

  // Callbacks de Eventos
  public onWinCallback?: (result: {
    timeMs: number;
    score: number;
    orbs: number;
    difficulty: Difficulty;
    moves: number;
    usedHints: boolean;
  }) => void;
  public onStatsUpdate?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.handleResize();
    this.bindEvents();
  }

  public handleResize() {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      // Garante uma visualização maior e mais proeminente no centro da tela
      const availableWidth = rect.width ? Math.min(rect.width - 24, 620) : 560;
      const size = Math.max(340, availableWidth);
      this.canvas.width = size * window.devicePixelRatio;
      this.canvas.height = size * window.devicePixelRatio;
      this.canvas.style.width = `${size}px`;
      this.canvas.style.height = `${size}px`;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }

  public startNewGame(difficulty: Difficulty = this.difficulty) {
    this.difficulty = difficulty;
    const { grid, cols, rows } = MazeGenerator.generate(difficulty);
    this.grid = grid;
    this.cols = cols;
    this.rows = rows;

    this.player.x = 0;
    this.player.y = 0;
    this.player.targetX = 0;
    this.player.targetY = 0;
    this.player.renderX = 0;
    this.player.renderY = 0;

    this.hintPath = [];
    this.particles = [];
    this.isRunning = true;
    this.isPaused = false;
    this.isWon = false;
    this.startTime = Date.now();
    this.elapsedTimeMs = 0;
    this.orbsCollectedThisRun = 0;
    this.hintsUsed = 0;
    this.movesCount = 0;
    this.currentScore = DIFFICULTY_CONFIG[difficulty].baseScore;

    if (!this.animFrameId) {
      this.loop();
    }
  }

  public pauseGame() {
    if (this.isRunning && !this.isWon) {
      this.isPaused = !this.isPaused;
    }
  }

  public requestHint() {
    if (!this.isRunning || this.isWon || this.isPaused) return;
    this.hintsUsed += 1;
    this.currentScore = Math.max(100, this.currentScore - 150);
    sounds.playHint();

    this.hintPath = AStarFinder.findPath(
      this.grid,
      this.cols,
      this.rows,
      this.player.x,
      this.player.y,
      this.cols - 1,
      this.rows - 1
    );

    // Dica dura 5 segundos visível
    if (this.hintTimeoutId !== null) {
      clearTimeout(this.hintTimeoutId);
    }

    this.hintTimeoutId = setTimeout(() => {
      this.hintPath = [];
      this.hintTimeoutId = null;
    }, 5000);
  }

  public move(dir: 'up' | 'right' | 'down' | 'left') {
    if (!this.isRunning || this.isWon || this.isPaused) return;

    const cell = this.grid[this.player.y][this.player.x];
    let nx = this.player.x;
    let ny = this.player.y;

    if (dir === 'up' && !cell.top) ny -= 1;
    if (dir === 'right' && !cell.right) nx += 1;
    if (dir === 'down' && !cell.bottom) ny += 1;
    if (dir === 'left' && !cell.left) nx -= 1;

    if (nx !== this.player.x || ny !== this.player.y) {
      this.player.x = nx;
      this.player.y = ny;
      this.movesCount += 1;
      sounds.playMove();

      // Verifica coleta de orbes
      const targetCell = this.grid[ny][nx];
      if (targetCell.hasOrb) {
        targetCell.hasOrb = false;
        this.orbsCollectedThisRun += 1;
        this.currentScore += 100;
        this.spawnCollectParticles(nx, ny, '#00f2fe');
        sounds.playOrbCollect();
      } else if (targetCell.hasGem) {
        targetCell.hasGem = false;
        this.orbsCollectedThisRun += 3;
        this.currentScore += 300;
        this.spawnCollectParticles(nx, ny, '#ff007f');
        sounds.playOrbCollect();
      }

      // Verifica se chegou ao fim
      if (nx === this.cols - 1 && ny === this.rows - 1) {
        this.triggerWin();
      }
    }
  }

  private triggerWin() {
    this.isWon = true;
    this.isRunning = false;
    sounds.playVictory();

    // Explosão comemorativa de partículas
    for (let i = 0; i < 60; i++) {
      this.spawnParticle(
        (this.cols - 0.5) * (this.canvas.width / (this.cols * window.devicePixelRatio)),
        (this.rows - 0.5) * (this.canvas.height / (this.rows * window.devicePixelRatio)),
        ['#00f2fe', '#ff007f', '#00ff66', '#ffb703'][Math.floor(Math.random() * 4)]
      );
    }

    if (this.onWinCallback) {
      this.onWinCallback({
        timeMs: this.elapsedTimeMs,
        score: this.currentScore,
        orbs: this.orbsCollectedThisRun,
        difficulty: this.difficulty,
        moves: this.movesCount,
        usedHints: this.hintsUsed > 0
      });
    }
  }

  private spawnCollectParticles(gridX: number, gridY: number, color: string) {
    const cellSize = (this.canvas.width / window.devicePixelRatio) / this.cols;
    const px = (gridX + 0.5) * cellSize;
    const py = (gridY + 0.5) * cellSize;
    for (let i = 0; i < 12; i++) {
      this.spawnParticle(px, py, color);
    }
  }

  private spawnParticle(x: number, y: number, color: string) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;
    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: Math.random() * 3.5 + 1.5,
      alpha: 1,
      life: 0,
      maxLife: Math.random() * 25 + 20
    });
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (['ArrowUp', 'KeyW'].includes(e.code)) {
      e.preventDefault();
      this.move('up');
    } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
      e.preventDefault();
      this.move('right');
    } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
      e.preventDefault();
      this.move('down');
    } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
      e.preventDefault();
      this.move('left');
    } else if (e.code === 'KeyH') {
      this.requestHint();
    } else if (e.code === 'KeyP') {
      this.pauseGame();
    }
  };

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  public loop = () => {
    this.update();
    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update() {
    if (this.isRunning && !this.isPaused && !this.isWon) {
      this.elapsedTimeMs = Date.now() - this.startTime;
      // Pequeno decaimento de score por segundo para incentivar velocidade
      if (this.elapsedTimeMs % 1000 < 20 && this.currentScore > 50) {
        this.currentScore -= 2;
      }
    }

    // Suavização do movimento visual do jogador (interpolação suave)
    const lerpSpeed = 0.25;
    this.player.renderX += (this.player.x - this.player.renderX) * lerpSpeed;
    this.player.renderY += (this.player.y - this.player.renderY) * lerpSpeed;

    // Atualiza partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life += 1;
      p.alpha = 1 - p.life / p.maxLife;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private render() {
    const w = this.canvas.width / window.devicePixelRatio;
    const h = this.canvas.height / window.devicePixelRatio;
    this.ctx.clearRect(0, 0, w, h);

    const stats = GameStorage.getStats();
    const currentTheme = THEMES.find((t) => t.id === stats.selectedTheme) || THEMES[0];
    const currentSkin = SKINS.find((s) => s.id === stats.selectedSkin) || SKINS[0];

    // Fundo
    this.ctx.fillStyle = currentTheme.pathColor;
    this.ctx.fillRect(0, 0, w, h);

    if (this.grid.length === 0) return;

    const cellSize = w / this.cols;

    // Desenha dica se ativa
    if (this.hintPath.length > 0) {
      this.ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
      this.ctx.lineWidth = cellSize * 0.2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      for (let i = 0; i < this.hintPath.length; i++) {
        const pt = this.hintPath[i];
        const px = (pt.x + 0.5) * cellSize;
        const py = (pt.y + 0.5) * cellSize;
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.stroke();
    }

    // Desenha orbes e gemas
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        const cx = (c + 0.5) * cellSize;
        const cy = (r + 0.5) * cellSize;

        if (cell.hasOrb) {
          this.ctx.fillStyle = '#00f2fe';
          this.ctx.shadowColor = '#00f2fe';
          this.ctx.shadowBlur = 8;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, cellSize * 0.16, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
        } else if (cell.hasGem) {
          this.ctx.fillStyle = '#ff007f';
          this.ctx.shadowColor = '#ff007f';
          this.ctx.shadowBlur = 10;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, cellSize * 0.22, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
        }
      }
    }

    // Ponto de chegada (Portal Neon)
    const endX = (this.cols - 0.5) * cellSize;
    const endY = (this.rows - 0.5) * cellSize;
    this.ctx.fillStyle = '#10b981';
    this.ctx.shadowColor = '#10b981';
    this.ctx.shadowBlur = 14;
    this.ctx.beginPath();
    this.ctx.arc(endX, endY, cellSize * 0.32, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Paredes do Labirinto
    this.ctx.strokeStyle = currentTheme.wallColor;
    this.ctx.lineWidth = Math.max(2, cellSize * 0.08);
    this.ctx.shadowColor = currentTheme.glowColor;
    this.ctx.shadowBlur = 4;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        const x = c * cellSize;
        const y = r * cellSize;

        this.ctx.beginPath();
        if (cell.top) {
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x + cellSize, y);
        }
        if (cell.right) {
          this.ctx.moveTo(x + cellSize, y);
          this.ctx.lineTo(x + cellSize, y + cellSize);
        }
        if (cell.bottom) {
          this.ctx.moveTo(x, y + cellSize);
          this.ctx.lineTo(x + cellSize, y + cellSize);
        }
        if (cell.left) {
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x, y + cellSize);
        }
        this.ctx.stroke();
      }
    }
    this.ctx.shadowBlur = 0;

    // Jogador (Nave / Cursor de Luz)
    const px = (this.player.renderX + 0.5) * cellSize;
    const py = (this.player.renderY + 0.5) * cellSize;
    this.ctx.fillStyle = currentSkin.color;
    this.ctx.shadowColor = currentSkin.color;
    this.ctx.shadowBlur = 12;

    this.ctx.beginPath();
    this.ctx.arc(px, py, cellSize * 0.28, 0, Math.PI * 2);
    this.ctx.fill();

    // Núcleo branco no centro do jogador
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(px, py, cellSize * 0.1, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Partículas
    for (const p of this.particles) {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;
  }

  public destroy() {
    window.removeEventListener('keydown', this.onKeyDown);

    if (this.hintTimeoutId !== null) {
      clearTimeout(this.hintTimeoutId);
      this.hintTimeoutId = null;
    }

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.isRunning = false;
    this.particles = [];
  }
}
