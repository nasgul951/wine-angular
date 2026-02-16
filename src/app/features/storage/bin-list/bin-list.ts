import { Component, inject, input, output, signal, computed, OnChanges } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WineService } from '../../../core/services/wine.service';
import { IStoreBottle } from '../../../core/models/wine.model';
import { WineStore, IBin } from '../../../core/models/store.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';

@Component({
  selector: 'app-bin-list',
  imports: [
    MatListModule, MatIconModule, MatButtonModule,
    MatToolbarModule, MatProgressBarModule, AlertBoxComponent,
  ],
  host: {
    'class': 'fixed top-0 right-0 bottom-0 z-50 flex',
    '[class.pointer-events-none]': '!open()',
  },
  template: `
    <!-- Backdrop -->
    @if (open()) {
      <div class="fixed inset-0 bg-black/30 pointer-events-auto" (click)="closed.emit()"></div>
    }

    <!-- Drawer panel -->
    <div class="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-xl flex flex-col
                transition-transform duration-300 pointer-events-auto"
         [class.translate-x-0]="open()"
         [class.translate-x-full]="!open()">

      <mat-toolbar color="primary" class="!h-16 !shrink-0">
        <span>Row {{ bin().y }}, Bin {{ bin().x }}</span>
      </mat-toolbar>

      <div class="flex-grow overflow-auto">
        <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

        @if (loading()) {
          <mat-progress-bar mode="indeterminate" />
        } @else {
          <mat-list>
            @if (bottles().length === 0) {
              <mat-list-item>
                <span matListItemTitle>No bottles found.</span>
              </mat-list-item>
            }
            @for (bottle of bottles(); track bottle.bottleId) {
              <mat-list-item>
                <div matListItemAvatar class="!rounded-full !bg-gray-200 !flex !items-center !justify-center !w-10 !h-10">
                  {{ bottle.depth }}
                </div>
                <span matListItemTitle>{{ bottle.vineyard }}</span>
                <span matListItemLine>
                  {{ bottle.label }} - {{ bottle.varietal }} ({{ bottle.vintage }})
                </span>
                <button matListItemMeta mat-icon-button (click)="consumeBottle(bottle.bottleId)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-list-item>
            }
          </mat-list>
        }
      </div>

      <div class="p-5">
        <button mat-flat-button color="primary" class="!w-full" (click)="closed.emit()">
          Close
        </button>
      </div>
    </div>
  `,
})
export class BinListComponent implements OnChanges {
  private readonly wineService = inject(WineService);
  private readonly wineStore = new WineStore(5);

  binId = input<number | null>(null);
  open = input(false);
  closed = output();
  bottleDeleted = output<number>();

  bottles = signal<IStoreBottle[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  bin = computed<IBin>(() => {
    const id = this.binId();
    return id !== null ? this.wineStore.unpackBinId(id) : { x: 0, y: 0 };
  });

  ngOnChanges(): void {
    const id = this.binId();
    if (id === null || !this.open()) return;

    this.loading.set(true);
    this.error.set(null);

    this.wineService.getBottlesByBinId(id).subscribe({
      next: (data) => {
        data.sort((a, b) => a.depth !== b.depth ? a.depth - b.depth : a.binX - b.binX);
        this.bottles.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(`Failed to fetch bottles: ${err.status}`);
        this.loading.set(false);
      },
    });
  }

  consumeBottle(bottleId: number): void {
    this.wineService.patchBottle(bottleId, { consumed: true }).subscribe({
      next: () => {
        this.bottles.update(list => list.filter(b => b.bottleId !== bottleId));
        this.bottleDeleted.emit(bottleId);
      },
      error: (err) => this.error.set(`Failed to consume bottle: ${err.message}`),
    });
  }
}
