import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ActiveElement, ChartEvent } from 'chart.js';
import { WineService } from '../../core/services/wine.service';
import { AlertBoxComponent } from '../../shared/components/alert-box/alert-box';
import { INameCount } from '../../core/models/common.model';

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective, AlertBoxComponent],
  template: `
    <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />
    @if (chartData()) {
      <div class="flex justify-center">
        <canvas baseChart
          type="doughnut"
          [data]="chartData()!"
          [options]="chartOptions"
          (chartClick)="onChartClick($event)"></canvas>
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly wineService = inject(WineService);
  private readonly router = inject(Router);

  error = signal<string | null>(null);
  chartData = signal<ChartData<'doughnut'> | null>(null);
  private varietals: INameCount[] = [];

  readonly chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: 'Wine Varietals Distribution' },
    },
  };

  ngOnInit(): void {
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
