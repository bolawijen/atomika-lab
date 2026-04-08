# Issue 113: Cell as Autonomous Living Entity

## Problem
Current design treats `Cell` as a passive object waiting for external calls (`tick()`, `absorb()`). In real biology, a cell is an autonomous living entity that maintains homeostasis and responds to its environment actively.

## Proposal
Refactor `Cell` to be an autonomous agent.

### Design
```ts
class Cell {
  constructor(environment: Environment) {
    this.live(); // Starts autonomous life cycle
  }

  private live(): void {
    // Continuous homeostasis loop
    // 1. Respond to environmental stimuli (heat, pH, osmotic pressure)
    // 2. Absorb available molecules
    this.absorb(environment.availableMolecules);
    // 3. Metabolize, repair, or divide based on internal state
  }

  absorb(molecules: Molecule[]): AbsorptionRecord[] {
    // Physics: passive diffusion based on molecule properties (logP, size)
    // No "detection" — molecules enter if physical conditions allow
  }
}
```

### Scientific Rationale
- **Physics (Automatic):** Molecules diffuse through membranes based on physical properties (lipophilicity, size). No "sensing" required.
- **Biology (Internal Response):** Cell responds to the *consequences* of absorption (energy increase, membrane damage, transcription inhibition).
- **Terminology:** Use biological terms (stimulus, response, homeostasis), not programming terms (event, subscriber, listener).

### Usage
```ts
const alveoli = new AlveoliEnvironment({ ... });
const tb = new MycobacteriumTuberculosis(alveoli);
// Cell lives autonomously: absorbs nutrients, metabolizes, responds to drugs
```
