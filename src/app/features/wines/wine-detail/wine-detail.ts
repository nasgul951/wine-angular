import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WineService } from '../../../core/services/wine.service';
import { Wine } from '../../../core/models/wine.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';
import { WineBottlesComponent } from '../wine-bottles/wine-bottles';

@Component({
  selector: 'app-wine-detail',
  imports: [
    FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule, AlertBoxComponent, WineBottlesComponent,
  ],
  template: `
    <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

    <mat-card class="max-w-3xl">
      <mat-card-content>
        <form [formGroup]="formGroup">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field>
              <mat-label>Vineyard</mat-label>
              <input matInput formControlName="vineyard" />
              @if ( formGroup.get('vineyard')?.invalid && formGroup.get('vineyard')?.touched ) {
                <mat-error>
                  Vineyard is required.
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field>
              <mat-label>Label</mat-label>
              <input matInput formControlName="label" />
              @if ( formGroup.get('label')?.invalid && formGroup.get('label')?.touched ) {
                <mat-error>
                  Label is required.
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field>
              <mat-label>Varietal</mat-label>
              <input matInput formControlName="varietal" />
              @if ( formGroup.get('varietal')?.invalid && formGroup.get('varietal')?.touched ) {
                <mat-error>
                  Varietal is required.
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field>
              <mat-label>Vintage</mat-label>
              <input matInput type="number" formControlName="vintage" />
              @if ( formGroup.get('vintage')?.invalid && formGroup.get('vintage')?.touched ) {
                <mat-error>
                  Invalid value for Vintage.
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field class="md:col-span-2">
              <mat-label>Notes</mat-label>
              <textarea matInput rows="2" formControlName="notes"></textarea>
            </mat-form-field>
          </div>
        </form>
      </mat-card-content>

      @if ( formGroup.dirty ) {
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
  private readonly formBuilder = inject(FormBuilder);

  formGroup = this.formBuilder.group({
    vineyard: ['', [Validators.required, Validators.maxLength(50)]],
    label: ['', [Validators.required, Validators.maxLength(50)]],
    varietal: ['', [Validators.required, Validators.maxLength(30)]],
    vintage: [null as number | null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
    notes: [''],
  });

  error = signal<string | null>(null);
  loading = signal(true);
  wineId = signal<number | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.wineId.set(id);
      this.wineService.getWineById(id).subscribe({
        next: (wine) => {
          this.formGroup.patchValue({
            vineyard: wine.vineyard,
            label: wine.label,
            varietal: wine.varietal,
            vintage: wine.vintage,
            notes: wine.notes,
          });
          this.formGroup.markAsPristine();
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(`Failed to fetch wine: ${err.status}`);
          this.loading.set(false);
        },
      });
    } else {
      this.loading.set(false);
    }
  }

  save(): void {
    if (this.formGroup.invalid) {
      this.error.set('Please correct the form errors.');
      return;
    }

    if (this.wineId()) {
      this.wineService.patchWine(this.wineId()!, {
        vineyard: this.formGroup.get('vineyard')!.value ?? undefined,
        label: this.formGroup.get('label')!.value ?? undefined,
        varietal: this.formGroup.get('varietal')!.value ?? undefined,
        vintage: this.formGroup.get('vintage')!.value ?? undefined,
        notes: this.formGroup.get('notes')!.value ?? undefined,
      }).subscribe({
        next: (wine) => {
          this.updateFormFromWine(wine);
        },
        error: (err) => this.error.set(`Failed to save wine: ${err.status}`),
      });
    } else {
      this.wineService.addWine({
        vineyard: this.formGroup.get('vineyard')!.value!,
        label: this.formGroup.get('label')!.value!,
        varietal: this.formGroup.get('varietal')!.value!,
        vintage: this.formGroup.get('vintage')!.value!,
        notes: this.formGroup.get('notes')!.value!,
      }).subscribe({
        next: (wine) => {
          this.router.navigate(['/wines', wine.id]);
        },  
        error: (err) => this.error.set(`Failed to save wine: ${err.status}`),
      });
    }
  }

  private updateFormFromWine(wine: Wine): void {
    this.formGroup.patchValue({
      vineyard: wine.vineyard,
      label: wine.label,
      varietal: wine.varietal,
      vintage: wine.vintage,
      notes: wine.notes,
    });
    this.formGroup.markAsPristine();
  }
}
