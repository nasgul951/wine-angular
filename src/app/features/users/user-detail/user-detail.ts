import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { User, UpdateUserRequest } from '../../../core/models/user.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';
import { PasswordInputComponent, getPasswordErrors } from '../../../shared/components/password-input/password-input';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-detail',
  imports: [
    FormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule, MatSlideToggleModule,
    AlertBoxComponent, PasswordInputComponent,
  ],
  template: `
    <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

    <mat-card class="max-w-xl">
      <mat-card-content>
        <h3 class="text-lg font-semibold mb-4">{{ isCreate ? 'Create User' : 'Edit User' }}</h3>

        <mat-form-field class="w-full">
          <mat-label>Email</mat-label>
          <input matInput type="email" [(ngModel)]="username" (ngModelChange)="checkDirty()" required />
        </mat-form-field>

        <app-password-input
          [password]="password"
          [confirmPassword]="confirmPassword"
          [required]="isCreate"
          [passwordLabel]="isCreate ? 'Password' : 'New Password (leave blank to keep current)'"
          (passwordChange)="password = $event; checkDirty()"
          (confirmPasswordChange)="confirmPassword = $event; checkDirty()" />

        <mat-slide-toggle [(ngModel)]="isAdmin" [disabled]="isSelf" (change)="checkDirty()" class="mb-4">
          Administrator
        </mat-slide-toggle>
      </mat-card-content>

      <mat-card-actions class="!flex !justify-between !px-4 !pb-4">
        <div>
          @if (userId && !isSelf) {
            <button mat-stroked-button color="warn" (click)="confirmDelete()">
              <mat-icon>delete</mat-icon> Delete
            </button>
          }
        </div>
        <div>
          @if (dirty()) {
            <div class="bg-amber-600 text-white p-3 flex items-center gap-2 rounded inline-flex">
              <span>Unsaved Changes</span>
              <button mat-icon-button (click)="save()" class="!text-white">
                <mat-icon>save</mat-icon>
              </button>
            </div>
          }
        </div>
      </mat-card-actions>
    </mat-card>
  `,
})
export class UserDetailComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  error = signal<string | null>(null);
  loading = signal(true);
  dirty = signal(false);

  userId: number | null = null;
  isCreate = true;
  isSelf = false;

  username = '';
  isAdmin = false;
  password = '';
  confirmPassword = '';

  private initialState = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userId = Number(idParam);
      this.isCreate = false;
      this.isSelf = this.userId === this.authStore.user()?.userId;

      this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.username = user.username;
          this.isAdmin = user.isAdmin;
          this.initialState = JSON.stringify({ username: user.username, isAdmin: user.isAdmin });
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(`Failed to fetch user: ${err.status}`);
          this.loading.set(false);
        },
      });
    } else {
      this.loading.set(false);
      this.initialState = JSON.stringify({ username: '', isAdmin: false });
    }
  }

  checkDirty(): void {
    const current = JSON.stringify({ username: this.username, isAdmin: this.isAdmin });
    const hasPasswordChange = this.password.length > 0;
    this.dirty.set(current !== this.initialState || hasPasswordChange);
  }

  save(): void {
    const passwordError = getPasswordErrors(this.password, this.confirmPassword, this.isCreate);
    if (passwordError) {
      this.error.set(passwordError);
      return;
    }

    const request: UpdateUserRequest = {
      username: this.username,
      isAdmin: this.isAdmin,
    };
    if (this.password) {
      request.password = this.password;
    }

    if (this.userId) {
      this.userService.patchUser(this.userId, request).subscribe({
        next: (user) => {
          this.updateFromUser(user);
        },
        error: (err) => this.error.set(`Failed to save user: ${err.status}`),
      });
    } else {
      this.userService.addUser(request).subscribe({
        next: (user) => {
          this.router.navigate(['/users', user.id]);
        },
        error: (err) => this.error.set(`Failed to save user: ${err.status}`),
      });
    }
  }

  confirmDelete(): void {
    if (!this.userId || this.isSelf) return;

    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete the user "${this.username}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'warn',
      },
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.deleteUser();
    });
  }

  private deleteUser(): void {
    this.userService.deleteUser(this.userId!).subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err) => this.error.set(`Failed to delete user: ${err.status}`),
    });
  }

  private updateFromUser(user: User): void {
    this.username = user.username;
    this.isAdmin = user.isAdmin;
    this.password = '';
    this.confirmPassword = '';
    this.initialState = JSON.stringify({ username: user.username, isAdmin: user.isAdmin });
    this.dirty.set(false);
    this.error.set(null);
  }
}
