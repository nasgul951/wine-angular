import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { WineService } from '../../../core/services/wine.service';
import { WineListStateService } from '../../../core/services/wine-list-state.service';
import { Wine, WineFilter, GetWinesOptions } from '../../../core/models/wine.model';
import { ISortModel } from '../../../core/models/common.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { FilterDrawerComponent } from '../filter-drawer/filter-drawer';

@Component({
  selector: 'app-wine-list',
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatSlideToggleModule, FormsModule,
    AlertBoxComponent, SkeletonLoaderComponent, FilterDrawerComponent,
  ],
  template: `
    <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

    <mat-card>
      <mat-card-actions align="end">
        <button mat-flat-button color="primary" (click)="router.navigate(['/wines/new'])">
          <mat-icon>add</mat-icon> Add Wine
        </button>
      </mat-card-actions>

      <mat-card-content>
        @if (loading()) {
          <app-skeleton-loader />
        } @else {
          <div class="flex justify-between items-center mb-4">
            <mat-slide-toggle [(ngModel)]="showAll" (change)="onShowAllChange()">
              Show All
            </mat-slide-toggle>
            <button mat-stroked-button (click)="drawerOpen.set(true)">
              <mat-icon>filter_list</mat-icon> Filters
            </button>
          </div>

          <table mat-table [dataSource]="wines()" matSort (matSortChange)="onSortChange($event)"
                 class="w-full cursor-pointer">

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let wine">{{ wine.id }}</td>
            </ng-container>

            <ng-container matColumnDef="vintage">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-center!">Vintage</th>
              <td mat-cell *matCellDef="let wine" class="text-center!">{{ wine.vintage }}</td>
            </ng-container>

            <ng-container matColumnDef="vineyard">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Vineyard</th>
              <td mat-cell *matCellDef="let wine">{{ wine.vineyard }}</td>
            </ng-container>

            <ng-container matColumnDef="label">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Label</th>
              <td mat-cell *matCellDef="let wine">{{ wine.label }}</td>
            </ng-container>

            <ng-container matColumnDef="varietal">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Varietal</th>
              <td mat-cell *matCellDef="let wine">{{ wine.varietal }}</td>
            </ng-container>

            <ng-container matColumnDef="count">
              <th mat-header-cell *matHeaderCellDef class="text-right!">Bottles</th>
              <td mat-cell *matCellDef="let wine" class="text-right!">{{ wine.count }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let wine; columns: displayedColumns;"
                (click)="router.navigate(['/wines', wine.id])"
                class="hover:bg-black/5"></tr>
          </table>

          <mat-paginator
            [length]="totalCount()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 15, 20]"
            (page)="onPageChange($event)"
            showFirstLastButtons />
        }
      </mat-card-content>
    </mat-card>

    <app-filter-drawer
      [open]="drawerOpen()"
      [filter]="filter()"
      (closed)="drawerOpen.set(false)"
      (filterChange)="onFilterChange($event.name, $event.value)"
      (resetFilters)="resetFilters()" />
  `,
})
export class WineListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly wineService = inject(WineService);
  private readonly wineListState = inject(WineListStateService);

  error = signal<string | null>(null);
  loading = signal(true);
  wines = signal<Wine[]>([]);
  totalCount = signal(0);
  drawerOpen = signal(false);
  filter = signal<WineFilter | undefined>(undefined);

  displayedColumns = ['id', 'vintage', 'vineyard', 'label', 'varietal', 'count'];
  page = 0;
  pageSize = 10;
  sortModel: ISortModel | undefined;
  showAll = false;

  ngOnInit(): void {
    this.filter.set(this.wineListState.filter);
    this.page = this.wineListState.page;
    this.pageSize = this.wineListState.pageSize;
    this.sortModel = this.wineListState.sortModel;
    this.showAll = this.wineListState.filter?.showAll ?? false;
    this.fetchWines();
  }

  fetchWines(): void {
    this.saveState();
    const options: GetWinesOptions = {
      page: this.page,
      pageSize: this.pageSize,
      sortModel: this.sortModel,
      filter: this.filter(),
    };

    this.wineService.getWines(options).subscribe({
      next: (data) => {
        this.wines.set(data.items);
        this.totalCount.set(data.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(`Failed to fetch wines: ${err.status}`);
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchWines();
  }

  onSortChange(sort: Sort): void {
    this.sortModel = sort.direction
      ? { field: sort.active, sort: sort.direction as 'asc' | 'desc' }
      : undefined;
    this.fetchWines();
  }

  onShowAllChange(): void {
    this.filter.update(f => ({ ...f, showAll: this.showAll }));
    this.page = 0;
    this.fetchWines();
  }

  onFilterChange(name: keyof WineFilter, value: WineFilter[keyof WineFilter]): void {
    this.filter.update(f => ({ ...f, [name]: value }));
    this.page = 0;
    this.fetchWines();
  }

  resetFilters(): void {
    this.filter.set({});
    this.showAll = false;
    this.page = 0;
    this.fetchWines();
  }

  private saveState(): void {
    this.wineListState.filter = this.filter();
    this.wineListState.page = this.page;
    this.wineListState.pageSize = this.pageSize;
    this.wineListState.sortModel = this.sortModel;
  }
}
