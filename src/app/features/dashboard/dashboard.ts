import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ActiveElement, ChartEvent } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { WineService } from '../../core/services/wine.service';
import { AlertBoxComponent } from '../../shared/components/alert-box/alert-box';
import { INameCount } from '../../core/models/common.model';
import { IWineSummary } from '../../core/models/wine.model';

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective, AlertBoxComponent, MatCardModule, DatePipe],
  template: `
    <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

    @if (summary(); as s) {
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        @for (stat of [
          { label: 'Total Bottles', value: s.totalBottles },
          { label: 'Wines',         value: s.uniqueWines },
          { label: 'Varietals',     value: s.uniqueVarietals },
          { label: 'Vineyards',     value: s.uniqueVineyards }
        ]; track stat.label) {
          <mat-card class="text-center!">
            <mat-card-content class="pt-4! pb-3!">
              <div class="text-4xl font-bold" style="color: var(--mat-sys-primary)">{{ stat.value }}</div>
              <div class="text-sm mt-1" style="color: var(--mat-sys-on-surface-variant)">{{ stat.label }}</div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      @if (s.lastConsumed; as lc) {
        <mat-card class="mb-4!">
          <mat-card-content class="pt-4! pb-3!">
            <div class="text-xs font-medium uppercase tracking-wider mb-2"
                 style="color: var(--mat-sys-on-surface-variant)">Last Consumed</div>
            <div class="flex items-baseline justify-between gap-4 flex-wrap">
              <span class="text-base font-semibold">{{ lc.vineyard }} · {{ lc.label }}</span>
              <span class="text-sm" style="color: var(--mat-sys-on-surface-variant)">
                {{ lc.varietal }} · {{ lc.vintage }} · {{ lc.consumedDate | date:'mediumDate' }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>
      }
    }

    @if (chartData()) {
      <mat-card>
        <mat-card-header>
          <mat-card-title style="color: var(--mat-sys-on-surface-variant)">Varietals Distribution</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-2!">
          <div class="w-full max-w-lg mx-auto">
            <canvas baseChart
              type="doughnut"
              [data]="chartData()!"
              [options]="chartOptions"
              (chartClick)="onChartClick($event)"></canvas>
          </div>
        </mat-card-content>
      </mat-card>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly wineService = inject(WineService);
  private readonly router = inject(Router);

  error = signal<string | null>(null);
  summary = signal<IWineSummary | null>(null);
  chartData = signal<ChartData<'doughnut'> | null>(null);
  private varietals: INameCount[] = [];

  readonly chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    aspectRatio: 1.5,
    plugins: {
      legend: { position: 'right' },
    },
  };

  ngOnInit(): void {
    this.wineService.getSummary().subscribe({
      next: (data) => this.summary.set(data),
      error: (err) => this.error.set(`Failed to fetch summary: ${err.status}`),
    });

    this.wineService.getVarietals().subscribe({
      next: (data) => {
        this.varietals = data;
        this.chartData.set({
          labels: data.map(v => v.name),
          datasets: [{
            data: data.map(v => v.count),
          }],
        });
      },
      error: (err) => {
        this.error.set(`Failed to fetch varietals: ${err.status}`);
      },
    });
  }

  onChartClick(event: { active?: object[]; event?: ChartEvent }): void {
    const active = event.active as ActiveElement[] | undefined;
    if (active && active.length > 0) {
      const index = active[0].index;
      const label = this.varietals[index]?.name;
      if (label) {
        this.router.navigate(['/varietals', encodeURIComponent(label)]);
      }
    }
  }
}
