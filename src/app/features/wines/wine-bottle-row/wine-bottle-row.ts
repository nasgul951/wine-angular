import { Component, inject, input, output, signal, computed, OnInit, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WineService } from '../../../core/services/wine.service';
import { WineListStateService } from '../../../core/services/wine-list-state.service';
import { Bottle } from '../../../core/models/wine.model';
import { StorageLocationPickerComponent } from '../../../shared/components/storage-location-picker/storage-location-picker';

@Component({
  selector: 'app-wine-bottle-row',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, StorageLocationPickerComponent],
  template: `
    <div class="grid grid-cols-5 gap-2 items-start">
      <div class="flex justify-center">
        <app-storage-location-picker
          [storageId]="selectedStorageId()"
          (storageIdChange)="onStorageChange($event)" />
      </div>

      <mat-form-field>
        <mat-label>Row</mat-label>
        <input matInput type="number" [(ngModel)]="binY" (ngModelChange)="markDirty()" #rowInput />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Position</mat-label>
        <input matInput type="number" [(ngModel)]="binX" (ngModelChange)="markDirty()" />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Depth</mat-label>
        <input matInput type="number" [(ngModel)]="depth" (ngModelChange)="markDirty()" />
      </mat-form-field>

      <div class="flex justify-center items-center pt-2">
        @if (dirty()) {
          <button mat-icon-button color="primary" (click)="save()">
            <mat-icon>save</mat-icon>
          </button>
        }
        @if (!isNew()) {
          <button mat-icon-button color="warn" (click)="consume()">
            <mat-icon>delete</mat-icon>
          </button>
        }
      </div>
    </div>
  `,
})
export class WineBottleRowComponent implements OnInit, AfterViewInit {
  private readonly wineService = inject(WineService);
  private readonly wineListState = inject(WineListStateService);
  private readonly rowInput = viewChild<ElementRef<HTMLInputElement>>('rowInput');

  bottle = input<Bottle | undefined>();
  isNew = input(false);
  wineId = input<number>(0);

  selectedStorageId = signal<number>(this.wineListState.lastUsedStoreId ?? 5);

  updated = output<Bottle>();
  inserted = output<Bottle>();
  consumed = output<number>();
  errorOccurred = output<string>();

  binX: number | null = null;
  binY: number | null = null;
  depth: number | null = null;
  dirty = signal(false);

  private initialState = '';

  ngAfterViewInit(): void {
    if (this.isNew()) {
      this.rowInput()?.nativeElement.focus();
    }
  }

  ngOnInit(): void {
    const b = this.bottle();
    if (b) {
      this.binX = b.binX;
      this.binY = b.binY;
      this.depth = b.depth;
      this.selectedStorageId.set(b.storageId);
    }
    this.initialState = JSON.stringify({ binX: this.binX, binY: this.binY, depth: this.depth, storageId: this.selectedStorageId() });
  }

  onStorageChange(id: number): void {
    this.selectedStorageId.set(id);
    this.markDirty();
  }

  markDirty(): void {
    const current = JSON.stringify({ binX: this.binX, binY: this.binY, depth: this.depth, storageId: this.selectedStorageId() });
    this.dirty.set(current !== this.initialState);
  }

  save(): void {
    if (this.binX == null || this.binY == null || this.depth == null) return;

    if (this.isNew()) {
      this.wineService.addBottle({
        wineId: this.wineId(),
        storageId: this.selectedStorageId(),
        binX: this.binX,
        binY: this.binY,
        depth: this.depth,
      }).subscribe({
        next: (b) => {
          this.wineListState.lastUsedStoreId = this.selectedStorageId();
          this.inserted.emit(b);
        },
        error: (err) => this.errorOccurred.emit(`Failed to add bottle: ${err.message}`),
      });
    } else {
      const b = this.bottle()!;
      this.wineService.patchBottle(b.id, {
        storageId: this.selectedStorageId(),
        binX: this.binX,
        binY: this.binY,
        depth: this.depth,
      }).subscribe({
        next: (updated) => {
          this.updated.emit(updated);
          this.initialState = JSON.stringify({ binX: this.binX, binY: this.binY, depth: this.depth, storageId: this.selectedStorageId() });
          this.dirty.set(false);
        },
        error: (err) => this.errorOccurred.emit(`Failed to update bottle: ${err.message}`),
      });
    }
  }

  consume(): void {
    const b = this.bottle();
    if (!b) return;
    this.wineService.patchBottle(b.id, { consumed: true }).subscribe({
      next: () => this.consumed.emit(b.id),
      error: (err) => this.errorOccurred.emit(`Failed to consume bottle: ${err.message}`),
    });
  }
}
