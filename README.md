# Wine Cellar — Angular

A wine inventory management app built with Angular, Angular Material, Tailwind CSS, and ng2-charts. This is a rebuild of the [Next.js Wine Cellar](../wine-nextjs) frontend, targeting the same .NET backend API.

## Tech Stack

| Concern | Library |
|---------|---------|
| Framework | Angular 20 (standalone components) |
| UI Components | Angular Material + CDK |
| Styling | Tailwind CSS v4 |
| Charts | ng2-charts (Chart.js) |
| State | Angular Signals (auth store), RxJS (HTTP/events) |
| Forms | Template-driven (ngModel) |
| Auth | HTTP Interceptor + Route Guards |

## Features

- **Dashboard** — Doughnut chart of wine varietals distribution; click a segment to browse that varietal.
- **Wines** — Server-side paginated/sorted table with filter drawer (varietal, vineyard). Full CRUD with inline bottle management (add, edit position, consume).
- **Varietals** — Card grid of all varietals with counts. Detail view shows a paginated wine list; click a wine to open a dialog with its bottles.
- **Storage** — 6x16 bin grid visualization. Click a bin to open a drawer listing its bottles with consume support.
- **Users** (admin only) — Paginated user table with debounced search. Create/edit users with password complexity validation, admin toggle, and delete confirmation.
- **Auth** — Signal-based auth store with localStorage token persistence, functional HTTP interceptor, and route guards (auth + admin).

## Project Structure

```
src/app/
  app.ts / app.html              # Root shell (sidenav + toolbar)
  app.config.ts                   # Providers (router, http, material, charts)
  app.routes.ts                   # Lazy-loaded routes

  core/
    auth/                         # AuthStore, AuthService, interceptor, guards
    models/                       # TypeScript interfaces (wine, user, auth, common, store)
    services/                     # WineService, UserService

  shared/components/              # AlertBox, ConfirmDialog, PasswordInput,
                                  # VarietalSelect, VineyardSelect, SkeletonLoader, Forbidden

  features/
    login/                        # Credentials login form
    dashboard/                    # Doughnut chart
    wines/                        # Wine list, detail, bottles, bottle row, filter drawer
    varietals/                     # Varietal list, detail, wine dialog
    users/                        # User list, detail
    storage/                      # Storage grid, bin list
```

## Getting Started

```bash
npm install
ng serve
```

The app expects the backend API running at `http://localhost:5197` (configured in `src/environments/environment.ts`).

## Routes

| Path | Component | Guards |
|------|-----------|--------|
| `/login` | LoginComponent | — |
| `/` | DashboardComponent | auth |
| `/wines` | WineListComponent | auth |
| `/wines/new` | WineDetailComponent | auth |
| `/wines/:id` | WineDetailComponent | auth |
| `/varietals` | VarietalListComponent | auth |
| `/varietals/:varietal` | VarietalDetailComponent | auth |
| `/store/:id` | StorageGridComponent | auth |
| `/users` | UserListComponent | auth + admin |
| `/users/new` | UserDetailComponent | auth + admin |
| `/users/:id` | UserDetailComponent | auth + admin |

All feature routes are lazy-loaded via `loadComponent`.

## Development

```bash
ng serve          # Dev server at http://localhost:4200
ng build          # Production build to dist/
ng test           # Run unit tests
```
