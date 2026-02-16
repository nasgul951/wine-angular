import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { WineService } from '../../../core/services/wine.service';
import { INameCount } from '../../../core/models/common.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';

@Component({
  selector: 'app-varietal-list',
  imports: [MatCardModule, AlertBoxComponent],
  template: `
    <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      @for (varietal of varietals(); track varietal.name) {
        <mat-card class="cursor-pointer hover:shadow-lg transition-shadow"
                  (click)="gotoVarietal(varietal.name)">
          <mat-card-content>
            <h3 class="text-lg font-semibold">{{ varietal.name }}</h3>
            <p class="text-gray-500">Count: {{ varietal.count }}</p>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export class VarietalListComponent implements OnInit {
  private readonly wineService = inject(WineService);
  private readonly router = inject(Router);

  varietals = signal<INameCount[]>([]);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.wineService.getVarietals().subscribe({
      next: (data) => this.varietals.set(data),
      error: (err) => this.error.set(`Failed to fetch varietals: ${err.message}`),
    });
  }

  gotoVarietal(name: string): void {
    this.router.navigate(['/varietals', name]);
  }
}
