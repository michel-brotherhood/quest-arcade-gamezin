import { MazeCell, Difficulty } from './types';

export const DIFFICULTY_CONFIG: Record<Difficulty, { cols: number; rows: number; name: string; baseScore: number }> = {
  easy: { cols: 11, rows: 11, name: 'Fácil (11x11)', baseScore: 500 },
  medium: { cols: 17, rows: 17, name: 'Médio (17x17)', baseScore: 1200 },
  hard: { cols: 25, rows: 25, name: 'Difícil (25x25)', baseScore: 2500 },
  expert: { cols: 31, rows: 31, name: 'Especialista (31x31)', baseScore: 5000 }
};

export class MazeGenerator {
  public static generate(difficulty: Difficulty): { grid: MazeCell[][]; cols: number; rows: number } {
    const config = DIFFICULTY_CONFIG[difficulty];
    const cols = config.cols;
    const rows = config.rows;

    const grid: MazeCell[][] = [];
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        grid[r][c] = {
          x: c,
          y: r,
          top: true,
          right: true,
          bottom: true,
          left: true,
          visited: false,
          hasOrb: Math.random() < 0.15 && !(c === 0 && r === 0) && !(c === cols - 1 && r === rows - 1),
          hasGem: Math.random() < 0.04 && !(c === 0 && r === 0) && !(c === cols - 1 && r === rows - 1)
        };
      }
    }

    const stack: { x: number; y: number }[] = [];
    let current = { x: 0, y: 0 };
    grid[0][0].visited = true;

    while (true) {
      const neighbors: { x: number; y: number; dir: 'top' | 'right' | 'bottom' | 'left' }[] = [];
      const { x, y } = current;

      if (y > 0 && !grid[y - 1][x].visited) neighbors.push({ x, y: y - 1, dir: 'top' });
      if (x < cols - 1 && !grid[y][x + 1].visited) neighbors.push({ x: x + 1, y, dir: 'right' });
      if (y < rows - 1 && !grid[y + 1][x].visited) neighbors.push({ x, y: y + 1, dir: 'bottom' });
      if (x > 0 && !grid[y][x - 1].visited) neighbors.push({ x: x - 1, y, dir: 'left' });

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        stack.push(current);

        // Remove paredes entre a célula atual e a vizinha
        if (next.dir === 'top') {
          grid[y][x].top = false;
          grid[next.y][next.x].bottom = false;
        } else if (next.dir === 'right') {
          grid[y][x].right = false;
          grid[next.y][next.x].left = false;
        } else if (next.dir === 'bottom') {
          grid[y][x].bottom = false;
          grid[next.y][next.x].top = false;
        } else if (next.dir === 'left') {
          grid[y][x].left = false;
          grid[next.y][next.x].right = false;
        }

        grid[next.y][next.x].visited = true;
        current = { x: next.x, y: next.y };
      } else if (stack.length > 0) {
        current = stack.pop()!;
      } else {
        break;
      }
    }

    // Adiciona alguns atalhos e caminhos alternativos leves para tornar o labirinto mais dinâmico
    const extraLoops = Math.floor((cols * rows) * 0.03);
    for (let i = 0; i < extraLoops; i++) {
      const rx = Math.floor(Math.random() * (cols - 2)) + 1;
      const ry = Math.floor(Math.random() * (rows - 2)) + 1;
      if (Math.random() < 0.5) {
        grid[ry][rx].right = false;
        grid[ry][rx + 1].left = false;
      } else {
        grid[ry][rx].bottom = false;
        grid[ry + 1][rx].top = false;
      }
    }

    return { grid, cols, rows };
  }
}
