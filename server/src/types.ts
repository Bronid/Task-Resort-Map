export type CellType = "." | "W" | "p" | "#" | "c";

export type PathTile =
  | "arrowEnd"
  | "arrowStraight"
  | "arrowCornerSquare"
  | "arrowSplit"
  | "arrowCrossing";

export type Direction = "up" | "down" | "left" | "right";

export interface MapCell {
  type: CellType;
  row: number;
  col: number;
  cabanaId?: string;
  pathTile?: PathTile;
  rotation?: number;
}

export interface CabanaInfo {
  id: string;
  row: number;
  col: number;
  booked: boolean;
  bookedBy?: {
    room: string;
    guestName: string;
  };
}

export interface Guest {
  room: string;
  guestName: string;
}

export interface MapData {
  grid: MapCell[][];
  cabanas: CabanaInfo[];
}
