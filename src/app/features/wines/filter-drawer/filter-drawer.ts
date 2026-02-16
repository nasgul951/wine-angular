import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { WineFilter } from '../../../core/models/wine.model';
import { VarietalSelectComponent } from '../../../shared/components/varietal-select/varietal-select';
import { VineyardSelectComponent } from '../../../shared/components/vineyard-select/vineyard-select';

@Component({
  selector: 'app-filter-drawer',
  imports: [MatButtonModule, VarietalSelectComponent, VineyardSelectComponent],
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
    <div class="fixed top-0 right-0 bottom-0 w-[300px] bg-white shadow-xl p-5 overflow-y-auto
                transition-transform duration-300 pointer-events-auto"
         [class.translate-x-0]="open()"
         [class.translate-x-full]="!open()">
      <h3 class="text-lg font-semibold mb-4">Filter Wines</h3>

      <app-vineyard-select
        [value]="filter()?.vineyard"
        (selectChange)="onFilterChange('vineyard', $event)" />

      <app-varietal-select
        [value]="filter()?.varietal"
        (selectChange)="onFilterChange('varietal', $event)" />

      <button mat-flat-button color="primary" class="!w-full !mt-5" (click)="resetFilters.emit()">
        Reset Filters
      </button>
    </div>
  `,
})
export class FilterDrawerComponent {
  open = input(false);
  filter = input<WineFilter | undefined>();
  closed = output();
  filterChange = output<{ name: keyof WineFilter; value: WineFilter[keyof WineFilter] }>();
  resetFilters = output();

  onFilterChange(name: keyof WineFilter, value: WineFilter[keyof WineFilter]): void {
    this.filterChange.emit({ name, value });
  }
}
