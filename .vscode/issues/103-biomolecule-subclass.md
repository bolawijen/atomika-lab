# Issue 103: BioMolecule Abstract Subclass

## Problem
Currently `Saccharide`, `ProteinChain`, `Lipid`, and `AminoAcid` all extend `Molecule` directly from `core`. The `Molecule` class is a pure chemistry concept — it has no biological semantics. There is no intermediate layer to capture shared biological properties.

## Proposal
Introduce `BioMolecule` as an abstract class between `Molecule` and concrete biomolecule types.

### New Hierarchy
```
Molecule (core) — pure chemistry
├── BioMolecule (biochem) — produced by living organisms
│   ├── Saccharide
│   ├── ProteinChain
│   ├── Lipid
│   └── AminoAcid
├── Drug (pharmacology) — xenobiotic, foreign compound
└── CoordinationComplex (core) — inorganic
```

### BioMolecule Properties
- `biomoleculeCategory` — classification: carbohydrate, protein, lipid, amino-acid
- `metabolicRole` — primary biological function (energy-source, structural, catalytic, signaling)
- `cellularLocation` — typical location in cell (cytoplasm, membrane, nucleus, extracellular)

> `isLipophilic` bukan di BioMolecule — itu di `Molecule` (core) sebagai derived getter dari `logP > 0`. Biar semua bisa pakai: Drug, BioMolecule, dll.

### Rationale
1. Unifies saccharide/protein/lipid/amino-acid under one biological concept
2. Enables polymorphic queries: "is this a biomolecule?" without checking each subclass
3. Provides shared biological properties that don't belong on pure chemical `Molecule`
4. `Drug` and `CoordinationComplex` remain outside — they are synthetic/inorganic, not biological
