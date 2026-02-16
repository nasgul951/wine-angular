import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forbidden',
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
      <mat-icon class="!text-red-500 !text-[80px] !w-20 !h-20">block</mat-icon>
      <h1 class="text-3xl font-bold">403 - Forbidden</h1>
      <p class="text-gray-500">{{ message() }}</p>
      @if (showHomeButton()) {
        <button mat-flat-button color="primary" (click)="router.navigate(['/'])">
          Go to Dashboard
        </button>
      }
    </div>
  `,
})
export class ForbiddenComponent {
  readonly router = inject(Router);
  message = input('You do not have permission to access this page.');
  showHomeButton = input(true);
}
