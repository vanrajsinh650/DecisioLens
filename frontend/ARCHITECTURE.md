# Frontend Architecture Philosophy

The frontend is organized into **3 layers** so the product can scale without turning pages into monoliths.

## Layer 1 — Pages (`src/app/**/page.tsx`)

Pages should only assemble a screen and route-level concerns.

- `src/app/page.tsx` → renders `LandingExperience`
- `src/app/audit/page.tsx` → renders `AuditWorkspace`
- `src/app/results/page.tsx` → renders `ResultsExperience`

✅ Goal: Keep pages simple and easy to scan.

## Layer 2 — Feature Components (`src/features/**`)

Feature components orchestrate domain workflows and compose domain-specific blocks.

- `src/features/landing/LandingExperience.tsx`
- `src/features/audit/AuditWorkspace.tsx`
- `src/features/results/ResultsExperience.tsx`

These are the right place for feature state, routing transitions, and business-flow composition.

✅ Goal: Keep feature logic modular and reusable across routes.

## Layer 3 — Shared UI (`src/components/shared/**`)

Shared UI holds reusable primitives and visual patterns used across features.

- `Card`, `Badge`, `StatPill`
- `LoadingState`, `ErrorState`, `EmptyState`
- `CopyButton`

✅ Goal: Keep design and interaction patterns consistent.

## Why this helps

- **Pages stay simple** → easier route maintenance.
- **Features stay modular** → easier to add/replace domain workflows.
- **Design stays consistent** → shared building blocks prevent visual drift.

## Practical rule of thumb

- If it represents a route assembly → put it in **Page layer**.
- If it represents domain behavior/workflow → put it in **Feature layer**.
- If it is generic/reusable UI → put it in **Shared UI layer**.
