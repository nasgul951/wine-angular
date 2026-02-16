import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  template: `
    <div class="grid grid-cols-4 gap-4">
      @for (item of items; track item) {
        <div class="p-4 border border-gray-300 rounded-lg">
          <div class="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
        </div>
      }
    </div>
  `,
})
export class SkeletonLoaderComponent {
  items = Array.from({ length: 12 });
}
