# Issue 109: Bioreactor substrate compatibility uses string matching

## Problem
`Bioreactor.#isCompatibleSubstrate()` uses `molecule.constructor.name.includes("Maltose")` for substrate type checking. This is fragile — renaming a class breaks the logic silently.

```ts
return molecule.constructor.name.includes("Maltose")
  || molecule.constructor.name.includes("Glucose");
```

## Proposal
Use structural type checking instead of string matching. Check for `instanceof` or a `bondType` property on the molecule:

```ts
#isCompatibleSubstrate(molecule: Saccharide, enzyme: Enzyme): boolean {
  return "cleavableBondCount" in molecule;
}
```
