export interface MapCell {
  type: string;
  row: number;
  col: number;
  cabanaId?: string;
  pathTile?: string;
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

export interface MapData {
  grid: MapCell[][];
  cabanas: CabanaInfo[];
}
