# Issue 111: RDKitEngine uses `any` throughout

## Problem
`RDKitEngine` class uses `any` type extensively:

- `private rdkit: any = null`
- `createMolecule(smiles: string): any`
- `matchSmarts(mol: any, smartsPattern: string): number[][]`
- `getMorganFingerprint(mol: any, radius: number): Uint8Array`
- `countChiralCenters(mol: any): number`
- `getChiralTag(mol: any, atomIndex: number): string`
- `getAtomicCompositionFromSmiles(smiles: string): Map<any, number>`
- `#parseFormula(formula: string): Map<any, number>`

This defeats TypeScript type safety and makes the API unclear.

## Proposal
Define interfaces for RDKit types:

```ts
interface RDKitMol {
  // Methods available on RDKit molecule objects
}

interface RDKitEngine {
  rdkit: RDKitModule | null;
  createMolecule(smiles: string): RDKitMol;
  // etc.
}
```

Change `Map<any, number>` to `Map<Atom, number>` where appropriate.
