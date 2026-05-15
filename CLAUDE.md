# Wine Angular — Claude Code Guide

## Project overview

Angular 20 SPA for managing a personal wine cellar. Tracks wines, bottles, storage locations, and varietals. Includes an admin user management section and a visual storage grid.

Backend is a separate .NET API. This repo is frontend-only.

## Commands

```bash
npm start          # dev server at http://localhost:4200 (API expected at http://localhost:5197)
npm run build      # production build (requires WINE_API_URL env var via envsubst)
npm test           # Karma + Jasmine unit tests
```

## Tech stack

- **Angular 20** — standalone components throughout, no NgModules
- **Angular Material** — primary UI component library
- **Tailwind CSS v4** — utility classes, PostCSS plugin only (no tailwind.config.js)
- **RxJS** — HTTP and async; prefer `subscribe` at the component edge, not in services
- **Angular Signals** — local component state and the auth store; no NgRx

## Architecture

```
src/app/
  core/
    auth/          # Signal-based auth store, interceptor, guards
    models/        # TypeScript interfaces only — no classes
    services/      # HTTP services + singleton state services
  features/        # One folder per route; components are route-scoped
  shared/
    components/    # Reusable UI components (no business logic)
```

**Routing:** All routes are lazy-loaded in `app.routes.ts`. Auth-protected via `authGuard`; admin routes also require `adminGuard`.

**Environments:** `environment.ts` (dev, hardcoded URL) → `environment.prod.ts` (generated at build time from `environment.template.ts` via `envsubst`).

## Conventions

### Components
- Standalone only — always add imports directly to the `@Component` decorator
- Single-file components (template, styles, and class in one `.ts` file)
- `input()` / `output()` signal-based API; avoid `@Input`/`@Output` decorators
- Local state via `signal()` and `computed()`; use `OnInit` for data fetching

### Models
- Interfaces prefixed with `I` for domain objects (e.g. `IStore`, `ISortModel`)
- Request/response shapes are plain interfaces in `core/models/`

### Services
- `providedIn: 'root'` singletons
- HTTP services return `Observable` — even hardcoded data uses `of()` so the shape is consistent when swapping to real API calls
- State-only services (e.g. `WineListStateService`) use plain properties, not signals or observables

### Styling
- Tailwind v4 important modifier syntax: `text-center!` not `!text-center`
- Material theme CSS variables preferred over hardcoded colors for theme-aware values (e.g. `var(--mat-sys-on-surface-variant)`)
- Dynamic colors that come from data use inline `[style.backgroundColor]` bindings — do not use dynamically constructed Tailwind classes (they get purged at build time)

### TypeScript
- `strict: true` — no implicit any, no implicit returns
- `noImplicitOverride`, `strictTemplates` enabled
- All schematics default to `skipTests: true`

## Key files

| File | Purpose |
|------|---------|
| `src/app/app.routes.ts` | All route definitions |
| `src/app/core/auth/auth.store.ts` | Auth state (signals), token management |
| `src/app/core/auth/auth.interceptor.ts` | Attaches Bearer token to every request |
| `src/app/core/models/wine.model.ts` | Wine, Bottle, IStore, filter/request shapes |
| `src/app/core/services/wine.service.ts` | All wine/bottle API calls |
| `src/app/core/services/storage-location.service.ts` | Hardcoded storage locations (future: API) |
| `src/app/core/services/wine-list-state.service.ts` | Persists wine list filter/sort/page across navigation |
| `src/app/shared/components/breadcrumb/breadcrumb.ts` | Reusable breadcrumb nav |
| `src/app/shared/components/storage-location-picker/storage-location-picker.ts` | Colored pill + menu for selecting storage location |
