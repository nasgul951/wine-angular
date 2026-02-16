import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
    pathMatch: 'full',
  },
  {
    path: 'wines',
    canActivate: [authGuard],
    loadComponent: () => import('./features/wines/wine-list/wine-list').then(m => m.WineListComponent),
  },
  {
    path: 'wines/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/wines/wine-detail/wine-detail').then(m => m.WineDetailComponent),
  },
  {
    path: 'wines/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/wines/wine-detail/wine-detail').then(m => m.WineDetailComponent),
  },
  {
    path: 'varietals',
    canActivate: [authGuard],
    loadComponent: () => import('./features/varietals/varietal-list/varietal-list').then(m => m.VarietalListComponent),
  },
  {
    path: 'varietals/:varietal',
    canActivate: [authGuard],
    loadComponent: () => import('./features/varietals/varietal-detail/varietal-detail').then(m => m.VarietalDetailComponent),
  },
  {
    path: 'store/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/storage/storage-grid/storage-grid').then(m => m.StorageGridComponent),
  },
  {
    path: 'users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/users/user-list/user-list').then(m => m.UserListComponent),
  },
  {
    path: 'users/new',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/users/user-detail/user-detail').then(m => m.UserDetailComponent),
  },
  {
    path: 'users/:id',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/users/user-detail/user-detail').then(m => m.UserDetailComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
