# Issue 107: Remove uptakeNutrient() — Redundant with absorb()

## Problem
`Cell.absorb()` has been implemented in `Cell` and `BacterialCell`. However, `uptakeNutrient()` still exists alongside it, creating duplication:

- `BacterialCell.uptakeNutrient()` (line 339) — duplicate of `absorb()`
- `MycobacteriumTuberculosis.uptakeNutrient()` (line 131) — not yet migrated to `absorb()`

## Proposal
1. Remove `BacterialCell.uptakeNutrient()` — already covered by `absorb()`
2. Migrate `MycobacteriumTuberculosis.uptakeNutrient()` to `override absorb()` with mycolic acid layer logic:
   - Lipids → dissolve through mycolic acid layer (like dissolves like)
   - Non-lipids → must pass through porin channels (size exclusion)
   - Non-lipid nutrition → gradual viability decline
3. Remove `NutrientUptake` interface — replace with `AbsorptionRecord`
