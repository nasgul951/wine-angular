import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WineService } from '../../../core/services/wine.service';
import { Wine } from '../../../core/models/wine.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';
import { WineDialogComponent } from '../wine-dialog/wine-dialog';

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

function stringInitials(name: string): string {
  const parts = name.split(' ');
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name[0];
}

@Component({
  selector: 'app-varietal-detail',
  imports: [
    MatCardModule, MatListModule, MatPaginatorModule, MatDividerModule,
    MatProgressBarModule, AlertBoxComponent,
  ],
  template: `
    <mat-card class="w-full max-w-lg">
      <mat-card-header>
        <div mat-card-avatar class="!rounded-full !flex !items-center !justify-center !text-white !font-bold"
             [style.background-color]="avatarColor">
          {{ avatarInitials }}
        </div>
        <mat-card-title>{{ varietalName }}</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <mat-divider class="!my-4" />

        @if (loading()) {
          <mat-progress-bar mode="indeterminate" />
        } @else if (error()) {
          <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />
        } @else {
          <mat-nav-list>
            @for (wine of wines(); track wine.id) {
              <mat-list-item (click)="openWineDialog(wine)"
                             [activated]="selectedId() === wine.id">
                <span matListItemTitle>{{ wine.vineyard }}</span>
                <span matListItemLine>{{ wine.label }} - {{ wine.varietal }} ({{ wine.vintage }})</span>
                <span matListItemMeta>{{ wine.count }} bottles</span>
              </mat-list-item>
            }
          </mat-nav-list>

          <mat-paginator
            [length]="totalCount()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[pageSize]"
            (page)="onPageChange($event)"
            showFirstLastButtons />
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class VarietalDetailComponent implements OnInit {
  private readonly wineService = inject(WineService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  wines = signal<Wine[]>([]);
  totalCount = signal(0);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedId = signal<number | null>(null);

  varietalName = '';
  avatarColor = '';
  avatarInitials = '';
  page = 0;
  pageSize = 7;

  ngOnInit(): void {
    this.varietalName = decodeURIComponent(this.route.snapshot.paramMap.get('varietal')!);
    this.avatarColor = stringToColor(this.varietalName);
    this.avatarInitials = stringInitials(this.varietalName);
    this.fetchWines();
  }

  fetchWines(): void {
    this.wineService.getWines({
      page: this.page,
      pageSize: this.pageSize,
      filter: { varietal: this.varietalName },
    }).subscribe({
      next: (data) => {
        this.wines.set(data.items);
        this.totalCount.set(data.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(`Failed to fetch wines: ${err.message}`);
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.fetchWines();
  }

  openWineDialog(wine: Wine): void {
    this.selectedId.set(wine.id);
    this.dialog.open(WineDialogComponent, {
      data: wine,
      width: '500px',
      maxWidth: '95vw',
    }).afterClosed().subscribe((result) => {
      this.selectedId.set(null);
      if (result?.lastConsumed) {
        this.fetchWines();
      }
    });
  }
}
