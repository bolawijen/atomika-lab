# Issue 105: Cell.absorb() General Mechanism

## Problem
Absorpsi adalah mekanisme umum — semua sel menyerap molekul dari lingkungan.

## Proposal
`Cell.absorb(molecule: Molecule, environment: Environment): AbsorptionRecord`

### Mekanisme
- Driven by concentration gradient (environment → cytoplasm)
- Depends on `isLipophilic` (molecule) + membrane permeability
- Returns `AbsorptionRecord` (molecule type, amount)

### Nutrient vs Drug
- **Nutrient** → diserap → dimetabolisme → energi
- **Drug** → diserap → bind target → inhibit proses seluler
- Mekanisme absorpsi sama, outcome beda
