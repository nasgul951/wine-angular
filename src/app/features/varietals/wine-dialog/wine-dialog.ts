import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WineService } from '../../../core/services/wine.service';
import { Wine, Bottle } from '../../../core/models/wine.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-wine-dialog',
  imports: [
    MatDialogModule, MatListModule, MatIconModule, MatButtonModule,
    MatDividerModule, MatProgressBarModule, AlertBoxComponent, DatePipe,
  ],
  template: `
    <h2 mat-dialog-title class="!bg-blue-700 !text-white !p-4 !mb-4">
      <div>{{ data.vineyard }}</div>
      <div class="text-sm">{{ data.label }} - {{ data.varietal }} ({{ data.vintage }})</div>
      <button mat-icon-button (click)="dialogRef.close()"
              class="!absolute !right-2 !top-2 !text-white">
        <mat-icon>close</mat-icon>
      </button>
    </h2>

    <mat-dialog-content>
      <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      } @else {
        <mat-list>
          @for (bottle of bottles(); track bottle.id) {
            <mat-list-item>
              <div class="flex justify-between items-center w-full">
                <div>
                  <div>{{ bottle.storageDescription || 'No storage description' }}</div>
                  <div class="text-xs text-gray-500">
                    Row: {{ bottle.binY }} - Column: {{ bottle.binX }} - Depth: {{ bottle.depth }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-400">
                    Added: {{ bottle.createdDate | date:'M/yyyy' }}
                  </span>
                  <button mat-icon-button (click)="consumeBottle(bottle.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-list-item>
          }
        </mat-list>
      }
    </mat-dialog-content>
  `,
})
export class WineDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<WineDialogComponent>);
  readonly data: Wine = inject(MAT_DIALOG_DATA);
  private readonly wineService = inject(WineService);

  bottles = signal<Bottle[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.wineService.getBottlesByWineId(this.data.id).subscribe({
      next: (data) => {
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
        this.bottles.update(list => list.filter(b => b.id !== bottleId))
        if (this.bottles().length === 0) {
          this.dialogRef.close({ lastConsumed: true });
        }
      },
      error: (err) => this.error.set(`Failed to consume bottle: ${err.message}`),
    });
  }
}
