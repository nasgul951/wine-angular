import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { StorageGridComponent } from './storage-grid';
import { StorageLocationService } from '../../../core/services/storage-location.service';
import { WineStore, IStoreInventory, IStoreCell } from '../../../core/models/store.model';

interface ParseResult {
  bins: { id: number; count: number; isDouble: boolean; isRow: boolean }[];
  outOfRange: IStoreCell[];
}

function makeInventory(overrides: Partial<IStoreInventory> = {}): IStoreInventory {
  return {
    id: 5,
    name: 'Test Store',
    abbreviation: 'T',
    color: '#000',
    rows: 2,
    columns: 2,
    hasTopBin: false,
    hasBottomBin: false,
    totalBottles: 0,
    cells: [],
    ...overrides,
  };
}

describe('StorageGridComponent — parseContentsBetter', () => {
  let component: StorageGridComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '5' } } },
        },
        {
          provide: StorageLocationService,
          useValue: { getInventory: () => of(makeInventory()) },
        },
      ],
    });

    const fixture = TestBed.createComponent(StorageGridComponent);
    component = fixture.componentInstance;
    (component as any).wineStore = new WineStore(5);
  });

  function parse(inventory: IStoreInventory): ParseResult {
    return (component as any).parseContentsBetter(inventory);
  }

  describe('top bin', () => {
    it('is omitted when hasTopBin is false', () => {
      const { bins } = parse(makeInventory({ hasTopBin: false }));
      expect(bins.some(b => b.isRow)).toBeFalse();
    });

    it('is prepended as a full-width double-height entry when hasTopBin is true', () => {
      const { bins } = parse(makeInventory({
        hasTopBin: true,
        cells: [{ id: 1, binX: 1, binY: 0, count: 4 }],
      }));
      expect(bins[0].isRow).toBeTrue();
      expect(bins[0].isDouble).toBeTrue();
      expect(bins[0].count).toBe(4);
    });

    it('sums multiple cells at y=0 into a single top bin count', () => {
      const { bins } = parse(makeInventory({
        hasTopBin: true,
        cells: [
          { id: 1, binX: 1, binY: 0, count: 3 },
          { id: 2, binX: 2, binY: 0, count: 2 },
        ],
      }));
      expect(bins[0].count).toBe(5);
    });
  });

  describe('bottom bin', () => {
    it('is omitted when hasBottomBin is false', () => {
      const { bins } = parse(makeInventory({ hasBottomBin: false }));
      expect(bins.some(b => b.isRow)).toBeFalse();
    });

    it('is appended as a full-width double-height entry when hasBottomBin is true', () => {
      const { bins } = parse(makeInventory({
        rows: 2,
        columns: 2,
        hasBottomBin: true,
        cells: [{ id: 1, binX: 1, binY: 3, count: 7 }],
      }));
      const last = bins[bins.length - 1];
      expect(last.isRow).toBeTrue();
      expect(last.isDouble).toBeTrue();
      expect(last.count).toBe(7);
    });

    it('uses rows+1 as the bottom bin y coordinate, not a hardcoded value', () => {
      const { bins } = parse(makeInventory({
        rows: 4,
        columns: 2,
        hasBottomBin: true,
        cells: [{ id: 1, binX: 1, binY: 5, count: 3 }],
      }));
      expect(bins[bins.length - 1].count).toBe(3);
    });
  });

  describe('main grid', () => {
    it('produces exactly rows × columns entries', () => {
      const { bins } = parse(makeInventory({ rows: 3, columns: 4 }));
      expect(bins.length).toBe(12);
    });

    it('respects inventory dimensions, not a hardcoded 15×6 grid', () => {
      const { bins } = parse(makeInventory({ rows: 8, columns: 12 }));
      expect(bins.length).toBe(96);
    });

    it('fills positions with no matching cell as count 0', () => {
      const { bins } = parse(makeInventory());
      expect(bins.every(b => b.count === 0)).toBeTrue();
    });

    it('places a cell count at the correct grid position', () => {
      const { bins } = parse(makeInventory({
        cells: [{ id: 1, binX: 2, binY: 1, count: 9 }],
      }));
      // 2×2 grid, no top/bottom: index 0=(x=1,y=1), index 1=(x=2,y=1)
      expect(bins[0].count).toBe(0);
      expect(bins[1].count).toBe(9);
    });
  });

  describe('out-of-range cells', () => {
    it('returns empty outOfRange when all cells are within bounds', () => {
      const { outOfRange } = parse(makeInventory({
        cells: [{ id: 1, binX: 1, binY: 1, count: 1 }],
      }));
      expect(outOfRange).toEqual([]);
    });

    it('returns a cell whose binX exceeds columns', () => {
      const cell: IStoreCell = { id: 1, binX: 3, binY: 1, count: 2 };
      const { outOfRange } = parse(makeInventory({ cells: [cell] }));
      expect(outOfRange).toContain(cell);
    });

    it('returns a cell whose binY exceeds rows', () => {
      const cell: IStoreCell = { id: 1, binX: 1, binY: 9, count: 1 };
      const { outOfRange } = parse(makeInventory({ cells: [cell] }));
      expect(outOfRange).toContain(cell);
    });

    it('separates in-range and out-of-range cells correctly', () => {
      const { bins, outOfRange } = parse(makeInventory({
        cells: [
          { id: 1, binX: 1, binY: 1, count: 5 },
          { id: 2, binX: 3, binY: 1, count: 2 }, // binX=3 exceeds columns=2
        ],
      }));
      expect(outOfRange.length).toBe(1);
      expect(outOfRange[0].id).toBe(2);
      expect(bins[0].count).toBe(5); // in-range cell still placed correctly
    });
  });

  it('handles an empty cells array without error', () => {
    const inv = makeInventory({ hasTopBin: true, hasBottomBin: true });
    expect(() => parse(inv)).not.toThrow();
  });
});
