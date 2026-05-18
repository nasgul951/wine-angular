import { Component, inject, computed, OnInit, signal, ViewChild, effect, DestroyRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from './core/auth/auth.store';
import { AuthService } from './core/auth/auth.service';
import { StorageLocationService } from './core/services/storage-location.service';
import { IStore } from './core/models/wine.model';

interface NavItem {
  path?: string;
  label: string;
  icon: string;
  exact?: boolean;
  color?: string;
  children?: NavItem[];
}

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
  private readonly storageLocationService = inject(StorageLocationService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  private expirationTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      this.clearExpirationTimer();

      const expires = this.authStore.expires();
      if (!expires) return;

      const remaining = expires.getTime() - Date.now();
      if (remaining <= 0) {
        this.authService.logout();
        this.router.navigate(['/login'], { queryParams: { expired: true } });
        return;
      }

      this.expirationTimer = setTimeout(() => {
        this.authService.logout();
        this.router.navigate(['/login'], { queryParams: { expired: true } });
      }, remaining);
    });

    destroyRef.onDestroy(() => this.clearExpirationTimer());
  }

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map(r => r.matches)),
    { initialValue: false },
  );
  readonly sidenavMode = computed(() => this.isMobile() ? 'over' : 'side');
  readonly sidenavOpened = computed(() => !this.isMobile());

  private readonly stores = signal<IStore[]>([]);
  readonly expandedSections = signal<Record<string, boolean>>({});

  readonly user = this.authStore.user;
  readonly isAuthenticated = this.authStore.isAuthenticated;
  readonly isAdmin = this.authStore.isAdmin;
  readonly showShell = signal(false);

  readonly navItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [
      { path: '/', label: 'Dashboard', icon: 'dashboard', exact: true },
      { path: '/wines', label: 'All Wine', icon: 'wine_bar', exact: false },
      { path: '/varietals', label: 'All Varietals', icon: 'diversity_2', exact: false },
    ];

    if (this.stores().length > 0) {
      items.push({
        label: 'Storage',
        icon: 'warehouse',
        children: this.stores().map(s => ({
          path: `/store/${s.id}`,
          label: s.name,
          icon: 'shelves',
          color: s.color,
        })),
      });
    }

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

    this.storageLocationService.getAll().subscribe(s => this.stores.set(s));

    // Toggle shell visibility based on route
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    ).subscribe(e => {
      this.showShell.set(!e.urlAfterRedirects.startsWith('/login'));
      if (this.isMobile()) this.sidenav?.close();
    });

    // Set initial shell state
    this.showShell.set(!this.router.url.startsWith('/login'));
  }

  toggleSection(label: string): void {
    this.expandedSections.update(s => ({ ...s, [label]: !(s[label] ?? true) }));
  }

  closeSidenavIfMobile(): void {
    if (this.isMobile()) this.sidenav.close();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private clearExpirationTimer(): void {
    if (this.expirationTimer !== null) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
  }
}
