import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { WineService } from '../../../core/services/wine.service';

@Component({
  selector: 'app-varietal-select',
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field class="w-full">
      <mat-label>Varietal</mat-label>
      <mat-select [value]="value() || 'All'" (selectionChange)="onSelectionChange($event.value)">
        <mat-option value="All">All Varietals</mat-option>
        @for (v of varietals(); track v) {
          <mat-option [value]="v">{{ v }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class VarietalSelectComponent implements OnInit {
  private readonly wineService = inject(WineService);

  value = input<string | undefined>();
  selectChange = output<string | undefined>();
  varietals = signal<string[]>([]);

  ngOnInit(): void {
    this.wineService.getVarietals().subscribe({
      next: (data) => this.varietals.set(data.map(v => v.name)),
    });
  }

  onSelectionChange(value: string): void {
    this.selectChange.emit(value === 'All' ? undefined : value);
  }
}
