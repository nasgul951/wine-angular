import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string[];
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  template: `
    <nav class="flex items-center gap-1 text-sm mb-4" aria-label="Breadcrumb">
      @for (crumb of crumbs(); track crumb.label; let last = $last) {
        @if (!last) {
          <a [routerLink]="crumb.route"
             class="text-gray-500 hover:text-gray-800 transition-colors">
            {{ crumb.label }}
          </a>
          <span class="text-gray-400 select-none">›</span>
        } @else {
          <span class="text-gray-800 font-medium">{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
})
export class BreadcrumbComponent {
  crumbs = input.required<BreadcrumbItem[]>();
}
