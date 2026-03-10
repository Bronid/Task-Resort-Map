import * as fs from "fs";
import { CellType, MapCell, CabanaInfo, PathTile, Direction } from "../types";

const DIRS: { dr: number; dc: number; dir: Direction }[] = [
  { dr: -1, dc: 0, dir: "up" },
  { dr: 1, dc: 0, dir: "down" },
  { dr: 0, dc: -1, dir: "left" },
  { dr: 0, dc: 1, dir: "right" },
];

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function parseMap(filePath: string): {
  grid: MapCell[][];
  cabanas: CabanaInfo[];
} {
  const raw = fs.readFileSync(filePath, "utf-8");
  return parseMapContent(raw);
}

export function parseMapContent(raw: string): {
  grid: MapCell[][];
  cabanas: CabanaInfo[];
} {
  const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);
  const charGrid: string[][] = lines.map((line) => line.split(""));

  const rows = charGrid.length;
  const cols = Math.max(...charGrid.map((r) => r.length));

  for (let r = 0; r < rows; r++) {
    while (charGrid[r].length < cols) {
      charGrid[r].push(".");
    }
  }

  const grid: MapCell[][] = [];
  const cabanas: CabanaInfo[] = [];
  let cabanaIndex = 1;

  for (let r = 0; r < rows; r++) {
    const row: MapCell[] = [];
    for (let c = 0; c < cols; c++) {
      const ch = charGrid[r][c] as CellType;
      const cell: MapCell = { type: ch, row: r, col: c };

      if (ch === "W") {
        cell.cabanaId = `cabana-${cabanaIndex}`;
        cabanas.push({
          id: `cabana-${cabanaIndex}`,
          row: r,
          col: c,
          booked: false,
        });
        cabanaIndex++;
      }

      row.push(cell);
    }
    grid.push(row);
  }

  const chaletConnections = buildChaletConnections(charGrid, rows, cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === "#") {
        const extra = chaletConnections.get(`${r},${c}`);
        const { tile, rotation } = getPathTile(charGrid, r, c, rows, cols, extra);
        grid[r][c].pathTile = tile;
        grid[r][c].rotation = rotation;
      }
    }
  }

  return { grid, cabanas };
}

function buildChaletConnections(
  charGrid: string[][],
  rows: number,
  cols: number
): Map<string, Set<Direction>> {
  const connections = new Map<string, Set<Direction>>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (charGrid[r][c] !== "c") continue;

      const nearest = findAdjacentPath(charGrid, r, c, rows, cols);
      if (!nearest) continue;

      const key = `${nearest.row},${nearest.col}`;
      if (!connections.has(key)) {
        connections.set(key, new Set());
      }
      connections.get(key)!.add(OPPOSITE[nearest.dir]);
    }
  }

  return connections;
}

function findAdjacentPath(
  charGrid: string[][],
  r: number,
  c: number,
  rows: number,
  cols: number
): { dir: Direction; row: number; col: number } | undefined {
  for (const { dr, dc, dir } of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (isPath(charGrid, nr, nc, rows, cols)) {
      return { dir, row: nr, col: nc };
    }
  }
  return undefined;
}

function isPath(charGrid: string[][], r: number, c: number, rows: number, cols: number): boolean {
  if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
  return charGrid[r][c] === "#";
}

function getPathTile(
  charGrid: string[][],
  r: number,
  c: number,
  rows: number,
  cols: number,
  chaletDirs?: Set<Direction>
): { tile: PathTile; rotation: number } {
  let up = isPath(charGrid, r - 1, c, rows, cols);
  let down = isPath(charGrid, r + 1, c, rows, cols);
  let left = isPath(charGrid, r, c - 1, rows, cols);
  let right = isPath(charGrid, r, c + 1, rows, cols);

  if (chaletDirs) {
    if (chaletDirs.has("up")) up = true;
    if (chaletDirs.has("down")) down = true;
    if (chaletDirs.has("left")) left = true;
    if (chaletDirs.has("right")) right = true;
  }

  const neighbors = [up, down, left, right].filter(Boolean).length;

  if (neighbors === 0) {
    return { tile: "arrowEnd", rotation: 0 };
  }

  if (neighbors === 1) {
    if (down) return { tile: "arrowEnd", rotation: 0 };
    if (left) return { tile: "arrowEnd", rotation: 90 };
    if (up) return { tile: "arrowEnd", rotation: 180 };
    return { tile: "arrowEnd", rotation: 270 };
  }

  if (neighbors === 2) {
    if (up && down) return { tile: "arrowStraight", rotation: 0 };
    if (left && right) return { tile: "arrowStraight", rotation: 90 };
    if (up && right) return { tile: "arrowCornerSquare", rotation: 0 };
    if (right && down) return { tile: "arrowCornerSquare", rotation: 90 };
    if (down && left) return { tile: "arrowCornerSquare", rotation: 180 };
    if (left && up) return { tile: "arrowCornerSquare", rotation: 270 };
  }

  if (neighbors === 3) {
    if (!left) return { tile: "arrowSplit", rotation: 0 };
    if (!up) return { tile: "arrowSplit", rotation: 90 };
    if (!right) return { tile: "arrowSplit", rotation: 180 };
    if (!down) return { tile: "arrowSplit", rotation: 270 };
  }

  return { tile: "arrowCrossing", rotation: 0 };
}
