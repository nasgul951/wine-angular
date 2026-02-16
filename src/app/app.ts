import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from './core/auth/auth.store';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authStore.user;
  readonly isAuthenticated = this.authStore.isAuthenticated;
  readonly isAdmin = this.authStore.isAdmin;
  readonly showShell = signal(false);

  readonly navItems = computed(() => {
    const items = [
      { path: '/', label: 'Dashboard', icon: 'dashboard', exact: true },
      { path: '/wines', label: 'All Wine', icon: 'wine_bar', exact: false },
      { path: '/varietals', label: 'All Varietals', icon: 'diversity_2', exact: false },
      { path: '/store/5', label: 'Storage', icon: 'warehouse', exact: false },
    ];
    if (this.isAdmin()) {
      items.push({ path: '/users', label: 'Users', icon: 'people', exact: false });
    }
    return items;
  });

  ngOnInit(): void {
    // Load user info if token exists
    if (this.authStore.token()) {
      this.authService.getUserInfo().subscribe();
    }

    // Toggle shell visibility based on route
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    ).subscribe(e => {
      this.showShell.set(!e.urlAfterRedirects.startsWith('/login'));
    });

    // Set initial shell state
    this.showShell.set(!this.router.url.startsWith('/login'));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
