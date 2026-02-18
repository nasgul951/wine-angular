import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { WineService } from '../../../core/services/wine.service';
import { Bottle } from '../../../core/models/wine.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';
import { WineBottleRowComponent } from '../wine-bottle-row/wine-bottle-row';
import { MatCardContent } from "@angular/material/card";

@Component({
  selector: 'app-wine-bottles',
  imports: [MatIconModule, MatButtonModule, MatDividerModule, AlertBoxComponent, WineBottleRowComponent, MatCardContent],
  template: `
    <mat-divider class="!my-4" />
    <mat-card-content>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Bottles</h3>
        <button mat-icon-button color="primary" (click)="addNewBottle.set(true)">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

      @for (bottle of bottles(); track bottle.id) {
        <app-wine-bottle-row
          [bottle]="bottle"
          (updated)="onBottleUpdate($event)"
          (consumed)="onBottleConsumed($event)"
          (errorOccurred)="error.set($event)" />
      }

      @if (addNewBottle()) {
        <app-wine-bottle-row
          [isNew]="true"
          [wineId]="wineId()"
          (inserted)="onBottleInsert($event)"
          (errorOccurred)="error.set($event)" />
      }
    </mat-card-content>
  `,
})
export class WineBottlesComponent implements OnInit {
  private readonly wineService = inject(WineService);

  wineId = input.required<number>();

  bottles = signal<Bottle[]>([]);
  addNewBottle = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.wineService.getBottlesByWineId(this.wineId()).subscribe({
      next: (data) => this.bottles.set(data),
      error: (err) => this.error.set(`Failed to fetch bottles: ${err.status}`),
    });
  }

  onBottleUpdate(updated: Bottle): void {
    this.bottles.update(list => list.map(b => b.id === updated.id ? updated : b));
  }

  onBottleConsumed(bottleId: number): void {
    this.bottles.update(list => list.filter(b => b.id !== bottleId));
  }

  onBottleInsert(newBottle: Bottle): void {
    this.bottles.update(list => [...list, newBottle]);
    this.addNewBottle.set(false);
  }
}
