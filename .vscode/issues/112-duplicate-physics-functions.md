# Issue 112: LawsOfPhysics duplicates functions from calculator modules

## Problem
`LawsOfPhysics` object in `core/src/LawsOfPhysics.ts` duplicates functions already defined in separate calculator modules:

- `calculateSahaIonization` — also in `PlasmaCalculator.ts`
- `calculateLorentzForce` — also in `PlasmaCalculator.ts`
- `calculateRadiativePowerLoss` — also in `PlasmaCalculator.ts`
- `calculatePeakEmissionWavelength` — also in `PlasmaCalculator.ts`
- `calculateGibbsFreeEnergy` — also in `RedoxCalculator.ts`
- `calculateNernstPotential` — also in `RedoxCalculator.ts`
- `calculateIdealGasVolume` — also in `PhaseCalculator.ts`
- `calculateVanDerWaalsPressure` — also in `PhaseCalculator.ts`
- `calculateBoilingPointAtPressure` — also in `PhaseCalculator.ts`

This creates two sources of truth. If one is updated and the other isn't, they diverge.

## Proposal
Pick one source of truth. Either:
1. Remove duplicates from `LawsOfPhysics` and re-export from calculator modules
2. Remove standalone calculator modules and keep everything in `LawsOfPhysics`

Option 1 is cleaner — calculator modules are the natural home for these functions.
