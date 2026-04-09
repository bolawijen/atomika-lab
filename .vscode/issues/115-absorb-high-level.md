# Issue 115: Cell.absorb() should be high-level, no math calculations

## Problem
Current `absorb()` implementations contain inline math calculations:

```ts
const gradient = this.environment.nutrientConcentration - this.cytoplasm.nutrientConcentration;
const amount = Math.min(gradient * permeability * membranePermeability * 0.1, 1.0);
```

This mixes physics calculations with biological behavior. The `absorb()` method should read like a biological narrative — molecules enter if they can pass through the membrane.

## Proposal
Move math calculations to a dedicated physics utility. `absorb()` should be high-level:

```ts
absorb(): AbsorptionRecord[] {
  if (!this.canDiffuse()) return this.noAbsorptionRecord();

  const lipophilicAmount = this.diffusionRate(LipophilicPermeability);
  const hydrophilicAmount = this.diffusionRate(HydrophilicPermeability);

  this.cytoplasm.addNutrient(lipophilicAmount + hydrophilicAmount);

  return [
    this.absorptionRecord("lipophilic", lipophilicAmount),
    this.absorptionRecord("hydrophilic", hydrophilicAmount),
  ];
}
```

### Rules
- No `Math.min`, `Math.max`, arithmetic in `absorb()`
- No inline constants (0.1, 1.0)
- Each line should read like a biological statement
