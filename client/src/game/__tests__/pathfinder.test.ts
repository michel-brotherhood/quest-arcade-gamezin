import { describe, expect, it } from 'vitest';
import { AStarFinder } from '../pathfinder';
import type { MazeCell } from '../types';

function createGrid(rows: number, cols: number, walls = true): MazeCell[][] {
  return Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => ({
      x,
      y,
      top: walls,
      right: walls,
      bottom: walls,
      left: walls,
      visited: true
    }))
  );
}

describe('AStarFinder.findPath', () => {
  it('finds the shortest route through open passages', () => {
    const grid = createGrid(3, 3, false);
    const path = AStarFinder.findPath(grid, 3, 3, 0, 0, 2, 2);

    expect(path).toHaveLength(5);
    expect(path[0]).toEqual({ x: 0, y: 0 });
    expect(path.at(-1)).toEqual({ x: 2, y: 2 });
  });

  it('returns an empty path when walls block the destination', () => {
    const grid = createGrid(2, 2);

    expect(AStarFinder.findPath(grid, 2, 2, 0, 0, 1, 1)).toEqual([]);
  });

  it('returns the current cell when start and destination match', () => {
    const grid = createGrid(1, 1);

    expect(AStarFinder.findPath(grid, 1, 1, 0, 0, 0, 0)).toEqual([{ x: 0, y: 0 }]);
  });

  it.each([
    [-1, 0, 1, 1],
    [0, 0, 2, 1],
    [0.5, 0, 1, 1],
    [0, 0, 1, Number.NaN]
  ])('returns an empty path for invalid coordinates %j', (startX, startY, endX, endY) => {
    const grid = createGrid(2, 2, false);

    expect(AStarFinder.findPath(grid, 2, 2, startX, startY, endX, endY)).toEqual([]);
  });

  it('returns an empty path when grid dimensions do not match', () => {
    expect(AStarFinder.findPath(createGrid(1, 2, false), 2, 2, 0, 0, 1, 0)).toEqual([]);
    expect(AStarFinder.findPath([[createGrid(1, 2, false)[0][0]]], 2, 1, 0, 0, 1, 0)).toEqual([]);
  });
});
