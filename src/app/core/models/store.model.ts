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
