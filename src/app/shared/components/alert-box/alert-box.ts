import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-alert-box',
  imports: [MatIconButton, MatIcon],
  template: `
    @if (message()) {
      <div class="mb-5 p-3 rounded flex items-center justify-between"
           [class]="type() === 'error' ? 'bg-red-600 text-white' :
                    type() === 'success' ? 'bg-green-600 text-white' :
                    type() === 'warning' ? 'bg-amber-600 text-white' :
                    'bg-blue-600 text-white'">
        <span>{{ message() }}</span>
        <button mat-icon-button (click)="cleared.emit()" class="!text-white">
          <mat-icon>clear</mat-icon>
        </button>
      </div>
    }
  `,
})
export class AlertBoxComponent {
  message = input<string | null>(null);
  type = input<'success' | 'error' | 'info' | 'warning'>('error');
  cleared = output();
}
