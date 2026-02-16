import { WineStore } from './store.model';

describe('WineStore', () => {
  describe('packBinId / unpackBinId round-trip', () => {
    const cases: { storeId: number; x: number; y: number }[] = [
      { storeId: 5, x: 0, y: 0 },
      { storeId: 5, x: 6, y: 16 },
      { storeId: 5, x: 1, y: 1 },
      { storeId: 1, x: 0, y: 0 },
      { storeId: 1, x: 3, y: 7 },
    ];

    cases.forEach(({ storeId, x, y }) => {
      it(`round-trips (storeId=${storeId}, x=${x}, y=${y})`, () => {
        const store = new WineStore(storeId);
        const packed = store.packBinId(x, y);
        const unpacked = store.unpackBinId(packed);
        expect(unpacked).toEqual({ x, y });
      });
    });
  });

  it('packBinId encodes store id, x, y into a single number', () => {
    const store = new WineStore(5);
    // 5 * 1000 + 6 * 100 + 16 = 5616
    expect(store.packBinId(6, 16)).toBe(5616);
  });

  it('unpackBinId decodes back to { x, y }', () => {
    const store = new WineStore(5);
    expect(store.unpackBinId(5616)).toEqual({ x: 6, y: 16 });
  });
});
