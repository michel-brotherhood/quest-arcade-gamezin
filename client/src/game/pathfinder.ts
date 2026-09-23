import { MazeCell } from './types';

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export class AStarFinder {
  public static findPath(
    grid: MazeCell[][],
    cols: number,
    rows: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): { x: number; y: number }[] {
    const openList: Node[] = [];
    const closedSet = new Set<string>();

    const startNode: Node = {
      x: startX,
      y: startY,
      g: 0,
      h: Math.abs(endX - startX) + Math.abs(endY - startY),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    while (openList.length > 0) {
      // Pega o nó com menor f
      let lowestIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[lowestIndex].f) {
          lowestIndex = i;
        }
      }

      const current = openList.splice(lowestIndex, 1)[0];
      const key = `${current.x},${current.y}`;

      if (current.x === endX && current.y === endY) {
        // Reconstrói o caminho
        const path: { x: number; y: number }[] = [];
        let curr: Node | null = current;
        while (curr) {
          path.unshift({ x: curr.x, y: curr.y });
          curr = curr.parent;
        }
        return path;
      }

      closedSet.add(key);

      const cell = grid[current.y][current.x];
      const neighbors: { x: number; y: number }[] = [];

      if (!cell.top && current.y > 0) neighbors.push({ x: current.x, y: current.y - 1 });
      if (!cell.right && current.x < cols - 1) neighbors.push({ x: current.x + 1, y: current.y });
      if (!cell.bottom && current.y < rows - 1) neighbors.push({ x: current.x, y: current.y + 1 });
      if (!cell.left && current.x > 0) neighbors.push({ x: current.x - 1, y: current.y });

      for (const n of neighbors) {
        const nKey = `${n.x},${n.y}`;
        if (closedSet.has(nKey)) continue;

        const gScore = current.g + 1;
        let neighborNode = openList.find((node) => node.x === n.x && node.y === n.y);

        if (!neighborNode) {
          neighborNode = {
            x: n.x,
            y: n.y,
            g: gScore,
            h: Math.abs(endX - n.x) + Math.abs(endY - n.y),
            f: 0,
            parent: current
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openList.push(neighborNode);
        } else if (gScore < neighborNode.g) {
          neighborNode.g = gScore;
          neighborNode.f = neighborNode.g + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }

    return [];
  }
}
