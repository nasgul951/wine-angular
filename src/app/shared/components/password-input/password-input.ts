import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

function isPasswordValid(v: PasswordValidation): boolean {
  return v.minLength && v.hasUppercase && v.hasLowercase && v.hasNumber && v.hasSpecial;
}

export function getPasswordErrors(password: string, confirmPassword: string, required = true): string | null {
  if (!password && !required) return null;
  if (!password && required) return 'Password is required';
  const v = validatePassword(password);
  if (!isPasswordValid(v)) return 'Password does not meet complexity requirements';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
}

@Component({
  selector: 'app-password-input',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  template: `
    <mat-form-field class="w-full">
      <mat-label>{{ passwordLabel() }}</mat-label>
      <input matInput [type]="showPassword() ? 'text' : 'password'"
             [ngModel]="password()" (ngModelChange)="passwordChange.emit($event); onPasswordChange($event)" />
      <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())">
        <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
      </button>
    </mat-form-field>

    @if (showValidation()) {
      <div class="text-sm mb-2">
        <div [class]="validation().minLength ? 'text-green-600' : 'text-red-600'">
          {{ validation().minLength ? '\u2713' : '\u2717' }} At least 8 characters
        </div>
        <div [class]="validation().hasUppercase ? 'text-green-600' : 'text-red-600'">
          {{ validation().hasUppercase ? '\u2713' : '\u2717' }} At least one uppercase letter
        </div>
        <div [class]="validation().hasLowercase ? 'text-green-600' : 'text-red-600'">
          {{ validation().hasLowercase ? '\u2713' : '\u2717' }} At least one lowercase letter
        </div>
        <div [class]="validation().hasNumber ? 'text-green-600' : 'text-red-600'">
          {{ validation().hasNumber ? '\u2713' : '\u2717' }} At least one number
        </div>
        <div [class]="validation().hasSpecial ? 'text-green-600' : 'text-red-600'">
          {{ validation().hasSpecial ? '\u2713' : '\u2717' }} At least one special character
        </div>
      </div>
    }

    <mat-form-field class="w-full">
      <mat-label>{{ confirmLabel() }}</mat-label>
      <input matInput [type]="showConfirmPassword() ? 'text' : 'password'"
             [ngModel]="confirmPassword()" (ngModelChange)="confirmPasswordChange.emit($event)"
             [class.text-red-600]="showMatchError()" />
      <button mat-icon-button matSuffix type="button" (click)="showConfirmPassword.set(!showConfirmPassword())">
        <mat-icon>{{ showConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
      </button>
      @if (showMatchError()) {
        <mat-error>Passwords do not match</mat-error>
      }
    </mat-form-field>
  `,
})
export class PasswordInputComponent {
  password = input('');
  confirmPassword = input('');
  required = input(true);
  passwordLabel = input('Password');
  confirmLabel = input('Confirm Password');

  passwordChange = output<string>();
  confirmPasswordChange = output<string>();

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  validation = signal<PasswordValidation>({ minLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecial: false });
  showValidation = signal(false);
  showMatchError = signal(false);

  onPasswordChange(value: string): void {
    const v = validatePassword(value);
    this.validation.set(v);
    this.showValidation.set(value.length > 0 && !isPasswordValid(v));
    this.showMatchError.set(this.confirmPassword().length > 0 && value !== this.confirmPassword());
  }
}
