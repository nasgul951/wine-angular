import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User, UserFilter } from '../../../core/models/user.model';
import { ISortModel, IPagedRequest } from '../../../core/models/common.model';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';

function formatLastOn(date: Date | string | null): string {
  if (!date) return 'Never';
  const lastOn = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - lastOn.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return lastOn.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

@Component({
  selector: 'app-user-list',
  imports: [
    ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatChipsModule,
    AlertBoxComponent, SkeletonLoaderComponent,
  ],
  template: `
    <app-alert-box [message]="error()" type="error" (cleared)="error.set(null)" />

    <mat-card>
      <mat-card-actions align="end">
        <button mat-flat-button color="primary" (click)="router.navigate(['/users/new'])">
          <mat-icon>add</mat-icon> Add User
        </button>
      </mat-card-actions>

      <mat-card-content>
        @if (loading()) {
          <app-skeleton-loader />
        } @else {
          <mat-form-field class="mb-4">
            <mat-icon matPrefix>search</mat-icon>
            <mat-label>Search by email...</mat-label>
            <input matInput [formControl]="searchControl" />
          </mat-form-field>

          <table mat-table [dataSource]="users()" matSort (matSortChange)="onSortChange($event)"
                 class="w-full cursor-pointer">

            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
              <td mat-cell *matCellDef="let user">{{ user.username }}</td>
            </ng-container>

            <ng-container matColumnDef="lastOn">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Last On</th>
              <td mat-cell *matCellDef="let user">{{ formatLastOn(user.lastOn) }}</td>
            </ng-container>

            <ng-container matColumnDef="isAdmin">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let user">
                @if (user.isAdmin) {
                  <mat-chip-set>
                    <mat-chip color="primary" highlighted>
                      <mat-icon matChipAvatar>admin_panel_settings</mat-icon>
                      Admin
                    </mat-chip>
                  </mat-chip-set>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let user; columns: displayedColumns;"
                (click)="router.navigate(['/users', user.id])"
                class="hover:bg-black/5"></tr>
          </table>

          <mat-paginator
            [length]="totalCount()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 15, 20]"
            (page)="onPageChange($event)"
            showFirstLastButtons />
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class UserListComponent implements OnInit, OnDestroy {
  readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly destroy$ = new Subject<void>();

  error = signal<string | null>(null);
  loading = signal(true);
  users = signal<User[]>([]);
  totalCount = signal(0);

  searchControl = new FormControl('');
  displayedColumns = ['username', 'lastOn', 'isAdmin'];
  page = 0;
  pageSize = 10;
  sortModel: ISortModel | undefined;
  searchTerm = '';

  formatLastOn = formatLastOn;

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(value => {
      this.searchTerm = value || '';
      this.page = 0;
      this.fetchUsers();
    });

    this.fetchUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchUsers(): void {
    const filter: UserFilter | undefined = this.searchTerm
      ? { username: this.searchTerm }
      : undefined;

    const options: IPagedRequest<UserFilter> = {
      page: this.page,
      pageSize: this.pageSize,
      filter,
      sortModel: this.sortModel,
    };

    this.userService.getUsers(options).subscribe({
      next: (data) => {
        this.users.set(data.items);
        this.totalCount.set(data.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(`Failed to fetch users: ${err.status}`);
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchUsers();
  }

  onSortChange(sort: Sort): void {
    this.sortModel = sort.direction
      ? { field: sort.active, sort: sort.direction as 'asc' | 'desc' }
      : undefined;
    this.fetchUsers();
  }
}
