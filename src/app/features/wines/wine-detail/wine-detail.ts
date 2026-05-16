import { Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WineService } from '../../../core/services/wine.service';
import { INameCount } from '../../../core/models/common.model';
import { Wine } from '../../../core/models/wine.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';
import { WineBottlesComponent } from '../wine-bottles/wine-bottles';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-wine-detail',
  imports: [
    FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatButtonModule, AlertBoxComponent, WineBottlesComponent,
    BreadcrumbComponent,
  ],
  template: `
    <app-breadcrumb [crumbs]="breadcrumbs()" />
    <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

    <mat-card class="max-w-3xl">
      <mat-card-content>
        <form [formGroup]="formGroup">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field>
              <mat-label>Vineyard</mat-label>
              <input matInput formControlName="vineyard" [matAutocomplete]="vineyardAuto" />
              <mat-autocomplete #vineyardAuto="matAutocomplete">
                @for (opt of vineyardOptions(); track opt) {
                  <mat-option [value]="opt">{{ opt }}</mat-option>
                }
              </mat-autocomplete>
              @if ( formGroup.get('vineyard')?.invalid && formGroup.get('vineyard')?.touched ) {
                <mat-error>
                  Vineyard is required.
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field>
              <mat-label>Label</mat-label>
              <input matInput formControlName="label" [matAutocomplete]="labelAuto" />
              <mat-autocomplete #labelAuto="matAutocomplete">
                @for (opt of labelOptions(); track opt) {
                  <mat-option [value]="opt">{{ opt }}</mat-option>
                }
              </mat-autocomplete>
              @if ( formGroup.get('label')?.invalid && formGroup.get('label')?.touched ) {
                <mat-error>
                  Label is required.
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field>
              <mat-label>Varietal</mat-label>
              <input matInput formControlName="varietal" [matAutocomplete]="varietalAuto" />
              <mat-autocomplete #varietalAuto="matAutocomplete">
                @for (opt of varietalOptions(); track opt) {
                  <mat-option [value]="opt">{{ opt }}</mat-option>
                }
              </mat-autocomplete>
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
          <button mat-icon-button (click)="save()" class="text-white!">
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
  wineId = signal<number | null>(null);
  wine = signal<Wine | null>(null);

  vineyardOptions = signal<string[]>([]);
  labelOptions = signal<string[]>([]);
  varietalOptions = signal<string[]>([]);

  private readonly destroyRef = inject(DestroyRef);

  breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const w = this.wine();
    const label = this.wineId()
      ? (w ? `${w.vineyard} · ${w.label}` : '…')
      : 'New Wine';
    return [
      { label: 'Wines', route: ['/wines'] },
      { label },
    ];
  });

  ngOnInit(): void {
    this.setupAutocomplete(
      'vineyard',
      (v) => this.wineService.getVineyards(v, 3),
      this.vineyardOptions,
    );
    this.setupAutocomplete(
      'label',
      (v) => this.wineService.getLabels(v, 3),
      this.labelOptions,
    );
    this.setupAutocomplete(
      'varietal',
      (v) => this.wineService.getVarietals(v, 3),
      this.varietalOptions,
    );

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.wineId.set(id);
      this.wineService.getWineById(id).subscribe({
        next: (wine) => {
          this.wine.set(wine);
          this.formGroup.patchValue({
            vineyard: wine.vineyard,
            label: wine.label,
            varietal: wine.varietal,
            vintage: wine.vintage,
            notes: wine.notes,
          });
          this.formGroup.markAsPristine();
        },
        error: (err) => this.error.set(`Failed to fetch wine: ${err.status}`),
      });
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
        next: (wine) => this.updateFormFromWine(wine),
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
        next: (wine) => this.router.navigate(['/wines', wine.id]),
        error: (err) => this.error.set(`Failed to save wine: ${err.status}`),
      });
    }
  }

  private setupAutocomplete(
    field: string,
    fetch: (v: string) => Observable<INameCount[]>,
    options: ReturnType<typeof signal<string[]>>,
  ): void {
    this.formGroup.get(field)!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((v) => {
      if (v && v.length >= 3) {
        fetch(v).subscribe((results) => options.set(results.map((r) => r.name)));
      } else {
        options.set([]);
      }
    });
  }

  private updateFormFromWine(wine: Wine): void {
    this.wine.set(wine);
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
