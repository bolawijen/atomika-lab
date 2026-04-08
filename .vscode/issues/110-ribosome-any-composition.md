# Issue 110: Ribosome GENETIC_CODE uses `Map<any, number>` for composition

## Problem
`Ribosome.GENETIC_CODE` stores amino acid compositions as `Map<any, number>` instead of `Map<Atom, number>`. This loses type safety and prevents proper atomic composition tracking.

```ts
const GENETIC_CODE: ReadonlyMap<string, {
  name: string;
  threeLetter: string;
  oneLetter: string;
  composition: Map<any, number>;  // Should be Map<Atom, number>
}> = new Map([...]);
```

## Proposal
Change `Map<any, number>` to `Map<Atom, number>` and populate with actual `ELEMENTS` references for each amino acid's stoichiometric composition.
