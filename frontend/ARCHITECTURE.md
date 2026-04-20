# Frontend Architecture Philosophy

The frontend follows a strict **3-layer architecture** so screens stay easy to reason about while features scale.

## Layer 1 — Pages (`src/app/**/page.tsx`)

Pages only assemble the screen for a route.

- `src/app/page.tsx` → renders `LandingExperience`
- `src/app/audit/page.tsx` → renders `AuditWorkspace`
- `src/app/results/page.tsx` → renders `ResultsExperience`

✅ Pages stay simple.

## Layer 2 — Feature Components (`src/features/**`)

Features own domain workflows and domain-specific UI blocks.

- `src/features/landing/LandingExperience.tsx`
- `src/features/audit/AuditWorkspace.tsx`
- `src/features/results/ResultsExperience.tsx`

Each feature keeps its blocks close to the workflow:

- `src/features/audit/components/*` (domain selector, profile fields, threshold control)
- `src/features/results/components/*` (**threshold analysis**, **variation comparison**, **appeal**)
- `src/features/landing/components/*` (hero, highlights, CTA)

✅ Features stay modular.

## Layer 3 — Shared UI (`src/components/shared/**`)

Shared UI provides reusable visual primitives used across features.

- `Card`, `Badge`, `StatPill`
- `LoadingState`, `ErrorState`, `EmptyState`
- `CopyButton`

✅ Design stays consistent.

## Guardrails

- **Pages** should import feature entry points, not feature internals.
- **Feature files** may import local `./components/*` and shared UI.
- **Shared UI** must stay domain-agnostic (no audit/results business logic).

## Why this separation saves time

- **Pages stay simple** → route files remain clean.
- **Features stay modular** → easier iteration on threshold/variation/appeal flows.
- **Design stays consistent** → one shared UI system across the app.
