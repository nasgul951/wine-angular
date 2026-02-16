import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { AuthStore } from '../../core/auth/auth.store';
import { AlertBoxComponent } from '../../shared/components/alert-box/alert-box';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    AlertBoxComponent,
  ],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <mat-card class="w-full max-w-sm">
        <mat-card-header>
          <mat-card-title>Wine Cellar</mat-card-title>
          <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="mt-4">
          <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

          <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="username" name="username" required />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'"
                     [(ngModel)]="password" name="password" required />
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (loading()) {
              <mat-progress-bar mode="indeterminate" />
            }

            <button mat-flat-button color="primary" type="submit"
                    [disabled]="loading() || !username || !password">
              Sign In
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  username = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);
  hidePassword = signal(true);

  constructor() {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (success) => {
        this.loading.set(false);
        if (success) {
          this.authService.getUserInfo().subscribe(() => {
            this.router.navigate(['/']);
          });
        } else {
          this.error.set('Invalid username or password');
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('An error occurred. Please try again.');
      },
    });
  }
}
