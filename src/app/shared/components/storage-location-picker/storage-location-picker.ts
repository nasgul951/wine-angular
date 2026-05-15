import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StorageLocationService } from '../../../core/services/storage-location.service';
import { IStore } from '../../../core/models/wine.model';

@Component({
  selector: 'app-storage-location-picker',
  imports: [MatButtonModule, MatMenuModule, MatTooltipModule],
  template: `
    <div class="storage-picker-wrapper">
      <span class="storage-label">Location</span>
      <button
        mat-flat-button
        class="storage-pill"
        [style.backgroundColor]="selectedLocation()?.color"
        [style.color]="'white'"
        [matTooltip]="selectedLocation()?.name ?? ''"
        [matMenuTriggerFor]="locationMenu">
        {{ selectedLocation()?.abbreviation ?? '?' }}
      </button>
    </div>

    <mat-menu #locationMenu="matMenu">
      @for (loc of locations(); track loc.id) {
        <button mat-menu-item (click)="selectLocation(loc)">
          <span class="font-mono font-bold mr-2">{{ loc.abbreviation }}</span>
          {{ loc.name }}
        </button>
      }
    </mat-menu>
  `,
  styles: [`
    .storage-picker-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .storage-label {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 0.25rem;
    }
    .storage-pill {
      min-width: 2rem;
      width: 2rem;
      height: 2rem;
      padding: 0;
      border-radius: 9999px;
      line-height: 2rem;
      font-size: 0.75rem;
      font-weight: 700;
    }
  `],
})
export class StorageLocationPickerComponent implements OnInit {
  private readonly storageLocationService = inject(StorageLocationService);

  storageId = input<number | undefined>();
  storageIdChange = output<number>();

  locations = signal<IStore[]>([]);
  selectedLocation = signal<IStore | undefined>(undefined);

  ngOnInit(): void {
    this.storageLocationService.getAll().subscribe((locs: IStore[]) => {
      this.locations.set(locs);
      const id = this.storageId();
      this.selectedLocation.set(id != null ? locs.find(l => l.id === id) : locs[0]);
    });
  }

  selectLocation(loc: IStore): void {
    this.selectedLocation.set(loc);
    this.storageIdChange.emit(loc.id);
  }
}
