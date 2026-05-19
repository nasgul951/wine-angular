import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StorageLocationService } from '../../../core/services/storage-location.service';
import { WineStore, IStoreCell, IStoreInventory } from '../../../core/models/store.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';
import { BinListComponent } from '../bin-list/bin-list';

interface BinContent {
  id: number;
  count: number;
  isDouble: boolean;
  isRow: boolean;
}

@Component({
  selector: 'app-storage-grid',
  imports: [MatCardModule, MatProgressSpinnerModule, AlertBoxComponent, BinListComponent],
  template: `
    <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />
    <app-alert-box [message]="warning()" type="warning" (cleared)="warning.set(null)" />

    <mat-card class="w-full max-w-xs overflow-hidden!">
      @if (inventory(); as store) {
        <div
          class="flex items-center justify-between px-4 py-3"
          [style.backgroundColor]="store.color">
          <span class="text-white font-semibold text-base tracking-wide">{{ store.name }}</span>
          <span class="text-white text-sm font-medium opacity-90">{{ store.totalBottles }} bottles</span>
        </div>
      }
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <mat-spinner />
        </div>
      } @else {
        <div class="p-1 grid grid-cols-6 gap-1 border-4 text-center">
          @for (bin of bins(); track bin.id) {
            <div
              class="flex items-center justify-center box-content cursor-pointer rounded
                     hover:bg-blue-100 transition-colors"
              [class.h-16]="bin.isDouble"
              [class.pb-1]="bin.isDouble"
              [class.h-8]="!bin.isDouble"
              [class.col-span-6]="bin.isRow"
              [class.shadow-md]="bin.count !== 0"
              [class.shadow-sm]="bin.count === 0"
              [class.bg-gray-50]="bin.count === 0"
              [class.bg-white]="bin.count !== 0"
              (click)="selectedBin.set(bin.id)">
              @if (bin.count !== 0) {
                <span>{{ bin.count }}</span>
              }
            </div>
          }
        </div>
      }
    </mat-card>

    <app-bin-list
      [binId]="selectedBin()"
      [open]="selectedBin() !== null"
      (closed)="selectedBin.set(null)"
      (bottleDeleted)="onBottleDeleted()" />
  `,
})
export class StorageGridComponent implements OnInit {
  private readonly storageLocationService = inject(StorageLocationService);
  private readonly route = inject(ActivatedRoute);

  loading = signal(true);
  error = signal<string | null>(null);
  warning = signal<string | null>(null);
  bins = signal<BinContent[]>([]);
  inventory = signal<IStoreInventory | null>(null);
  selectedBin = signal<number | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private storeId = 5;
  private wineStore!: WineStore;
  private refreshKey = 0;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.storeId = Number(params.get('id')) || 5;
      this.wineStore = new WineStore(this.storeId);
      this.inventory.set(null);
      this.fetchInventory();
    });
  }

  onBottleDeleted(): void {
    this.refreshKey++;
    this.fetchInventory();
  }

  private fetchInventory(): void {
    this.loading.set(true);
    this.storageLocationService.getInventory(this.storeId).subscribe({
      next: (data) => {
        this.inventory.set(data);
        const { bins, outOfRange } = this.parseContentsBetter(data);
        this.bins.set(bins);
        if (outOfRange.length > 0) {
          const coords = outOfRange.map(c => `(${c.binX}, ${c.binY})`).join(', ');
          this.warning.set(`${outOfRange.length} bottle(s) are outside the grid at: ${coords}`);
        } else {
          this.warning.set(null);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(`Failed to fetch store inventory: ${err.status}`);
        this.loading.set(false);
      },
    });
  }

  private parseContents(data: IStoreCell[]): BinContent[] {
    const store: BinContent[] = [];
    let ix = 0;
    let d = data[ix];

    // Top row (y=0) as single double-height bin
    let topCount = 0;
    while (d && d.binY === 0) {
      topCount += d.count;
      d = data[++ix];
    }
    store.push({
      id: this.wineStore.packBinId(0, 0),
      count: topCount,
      isDouble: true,
      isRow: true,
    });

    // Main grid: rows 1-15, columns 1-6
    for (let y = 1; y <= 15; y++) {
      for (let x = 1; x <= 6; x++) {
        if (d && d.binY === y && d.binX === x) {
          store.push({
            id: this.wineStore.packBinId(x, y),
            count: d.count,
            isRow: false,
            isDouble: false,
          });
          d = data[++ix];
        } else {
          store.push({
            id: this.wineStore.packBinId(x, y),
            count: 0,
            isRow: false,
            isDouble: false,
          });
        }
      }
    }

    // Bottom row (y=16) as single double-height bin
    let bottomCount = 0;
    while (d && d.binY === 16) {
      bottomCount += d.count;
      d = data[++ix];
    }
    store.push({
      id: this.wineStore.packBinId(0, 16),
      count: bottomCount,
      isDouble: true,
      isRow: true,
    });

    return store;
  }

  private parseContentsBetter(inventory: IStoreInventory): { bins: BinContent[], outOfRange: IStoreCell[] } {
    const bins: BinContent[] = [];
    const data = inventory.cells;
    let ix = 0;
    let d = data[ix];

    if (inventory.hasTopBin) {
      let topCount = 0;
      while (d && d.binY === 0) {
        topCount += d.count;
        d = data[++ix];
      }
      bins.push({
        id: this.wineStore.packBinId(0, 0),
        count: topCount,
        isDouble: true,
        isRow: true,
      });
    }

    for (let y = 1; y <= inventory.rows; y++) {
      for (let x = 1; x <= inventory.columns; x++) {
        if (d && d.binY === y && d.binX === x) {
          bins.push({ id: this.wineStore.packBinId(x, y), count: d.count, isRow: false, isDouble: false });
          d = data[++ix];
        } else {
          bins.push({ id: this.wineStore.packBinId(x, y), count: 0, isRow: false, isDouble: false });
        }
      }
    }

    if (inventory.hasBottomBin) {
      const bottomY = inventory.rows + 1;
      let bottomCount = 0;
      while (d && d.binY === bottomY) {
        bottomCount += d.count;
        d = data[++ix];
      }
      bins.push({
        id: this.wineStore.packBinId(0, bottomY),
        count: bottomCount,
        isDouble: true,
        isRow: true,
      });
    }

    return { bins, outOfRange: data.slice(ix) };
  }
}
