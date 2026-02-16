import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WineService } from '../../../core/services/wine.service';
import { Wine } from '../../../core/models/wine.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';
import { WineBottlesComponent } from '../wine-bottles/wine-bottles';

interface WineForm {
  vineyard: string;
  label: string;
  varietal: string;
  vintage: number | null;
  notes: string;
}

@Component({
  selector: 'app-wine-detail',
  imports: [
    FormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule, AlertBoxComponent, WineBottlesComponent,
  ],
  template: `
    <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

    <mat-card class="max-w-3xl">
      <mat-card-content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field>
            <mat-label>Vineyard</mat-label>
            <input matInput [(ngModel)]="form.vineyard" (ngModelChange)="checkDirty()" />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Label</mat-label>
            <input matInput [(ngModel)]="form.label" (ngModelChange)="checkDirty()" />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Varietal</mat-label>
            <input matInput [(ngModel)]="form.varietal" (ngModelChange)="checkDirty()" />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Vintage</mat-label>
            <input matInput type="number" [(ngModel)]="form.vintage" (ngModelChange)="checkDirty()" />
          </mat-form-field>

          <mat-form-field class="md:col-span-2">
            <mat-label>Notes</mat-label>
            <textarea matInput rows="2" [(ngModel)]="form.notes" (ngModelChange)="checkDirty()"></textarea>
          </mat-form-field>
        </div>
      </mat-card-content>

      @if (dirty()) {
        <div class="bg-amber-600 text-white p-3 flex items-center justify-between rounded-b">
          <span>Unsaved Changes</span>
          <button mat-icon-button (click)="save()" class="!text-white">
            <mat-icon>save</mat-icon>
          </button>
        </div>
      }

      @if (wineId()) {
        <app-wine-bottles [wineId]="wineId()!" />
      }
    </mat-card>
  `,
})
export class WineDetailComponent implements OnInit {
  private readonly wineService = inject(WineService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  error = signal<string | null>(null);
  loading = signal(true);
  wineId = signal<number | null>(null);
  dirty = signal(false);

  form: WineForm = { vineyard: '', label: '', varietal: '', vintage: null, notes: '' };
  private initialFormState = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.wineId.set(id);
      this.wineService.getWineById(id).subscribe({
        next: (wine) => {
          this.form = {
            vineyard: wine.vineyard,
            label: wine.label,
            varietal: wine.varietal,
            vintage: wine.vintage,
            notes: wine.notes,
          };
          this.initialFormState = JSON.stringify(this.form);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(`Failed to fetch wine: ${err.status}`);
          this.loading.set(false);
        },
      });
    } else {
      this.loading.set(false);
      this.initialFormState = JSON.stringify(this.form);
    }
  }

  checkDirty(): void {
    this.dirty.set(JSON.stringify(this.form) !== this.initialFormState);
  }

  save(): void {
    if (this.wineId()) {
      this.wineService.patchWine(this.wineId()!, {
        vineyard: this.form.vineyard,
        label: this.form.label,
        varietal: this.form.varietal,
        vintage: this.form.vintage!,
        notes: this.form.notes,
      }).subscribe({
        next: (wine) => {
          this.updateFormFromWine(wine);
        },
        error: (err) => this.error.set(`Failed to save wine: ${err.status}`),
      });
    } else {
      this.wineService.addWine({
        vineyard: this.form.vineyard,
        label: this.form.label,
        varietal: this.form.varietal,
        vintage: this.form.vintage!,
        notes: this.form.notes,
      }).subscribe({
        next: (wine) => {
          this.router.navigate(['/wines', wine.id]);
        },
        error: (err) => this.error.set(`Failed to save wine: ${err.status}`),
      });
    }
  }

  private updateFormFromWine(wine: Wine): void {
    this.form = {
      vineyard: wine.vineyard,
      label: wine.label,
      varietal: wine.varietal,
      vintage: wine.vintage,
      notes: wine.notes,
    };
    this.initialFormState = JSON.stringify(this.form);
    this.dirty.set(false);
  }
}
