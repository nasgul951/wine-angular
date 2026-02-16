import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { WineService } from '../../../core/services/wine.service';

@Component({
  selector: 'app-vineyard-select',
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field class="w-full">
      <mat-label>Vineyard</mat-label>
      <mat-select [value]="value() || 'All'" (selectionChange)="onSelectionChange($event.value)">
        <mat-option value="All">All Vineyards</mat-option>
        @for (v of vineyards(); track v) {
          <mat-option [value]="v">{{ v }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class VineyardSelectComponent implements OnInit {
  private readonly wineService = inject(WineService);

  value = input<string | undefined>();
  selectChange = output<string | undefined>();
  vineyards = signal<string[]>([]);

  ngOnInit(): void {
    this.wineService.getVineyards().subscribe({
      next: (data) => this.vineyards.set(data.map(v => v.name)),
    });
  }

  onSelectionChange(value: string): void {
    this.selectChange.emit(value === 'All' ? undefined : value);
  }
}
