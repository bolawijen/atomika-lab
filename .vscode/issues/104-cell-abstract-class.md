# Issue 104: Cell Abstract Class

## Problem
`BacterialCell` dan `MycobacteriumTuberculosis` tidak punya parent class bersama. Tidak ada konsep `Cell` yang umum.

## Proposal
Buat `Cell` abstract class di `biology`.

### Hierarchy
```
Cell (biology) — abstract
├── BacterialCell
│   └── MycobacteriumTuberculosis
├── HumanCell (future)
└── PlantCell (future)
```

### Shared Properties
- `isAlive: boolean`
- `viability: number` (0–1)
- `cytoplasm` — interior sel
