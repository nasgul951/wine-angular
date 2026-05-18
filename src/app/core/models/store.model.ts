export interface IBin {
  x: number;
  y: number;
}

export class WineStore {
  private _id: number;

  constructor(id: number) {
    this._id = id;
  }

  packBinId(x: number, y: number): number {
    return this._id * 1000 + (x * 100) + y;
  }

  unpackBinId(binId: number): IBin {
    return {
      x: Math.floor((binId % (1000 * this._id)) / 100),
      y: (binId % (1000 * this._id)) % 100,
    };
  }
}

export interface IStoreCell {
  id: number;
  binX: number;
  binY: number;
  count: number;
}

export interface IStoreInventory {
  id: number;
  name: string;
  abbreviation: string;
  color: string;
  rows: number;
  columns: number;
  hasTopBin: boolean;
  hasBottomBin: boolean;
  totalBottles: number;
  cells: IStoreCell[];
}