# Issue 114: Cell.absorb() should absorb from environment, not take env as param

## Problem
`Cell` stores `environment` in constructor (autonomous design), but `absorb(molecule, environment)` still requires environment as a parameter and takes a single molecule. This contradicts the autonomous cell design.

In real biology:
- Cell lives inside an environment — it doesn't get handed one
- Diffusion happens for all available molecules simultaneously, not one at a time
- Cell doesn't "choose" which molecule to absorb — physics decides based on lipophilicity and size

## Proposal
Change signature to absorb from environment's available molecules:

```ts
class Cell {
  protected environment: Environment;

  constructor(environment: Environment) {
    this.environment = environment;
    this.live();
  }

  absorb(): AbsorptionRecord[] {
    // Uses this.environment.availableMolecules internally
    // All molecules that can physically pass through membrane enter
    // Returns record for each molecule type
  }
}
```

### Usage
```ts
const alveoli = new AlveoliEnvironment({ ... });
const tb = new MycobacteriumTuberculosis(alveoli);
// Cell autonomously absorbs: tb.absorb() uses alveoli.availableMolecules
```
