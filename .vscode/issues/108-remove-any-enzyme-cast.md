# Issue 108: EnzymeComplex and Bioreactor use `as any` type assertions

## Problem
`EnzymeComplex.digest()` and `Bioreactor.digest()` use unsafe type assertions:

```ts
const result = (enzyme as any).digest(mixture, environment);
```

This bypasses TypeScript type checking and defeats the purpose of the type system.

## Proposal
Define a common interface for digest-capable enzymes:

```ts
interface Digestible {
  digest(substrate: Saccharide, environment: Environment): ReactionResult;
}
```

Use `enzyme satisfies Digestible` or `enzyme instanceof Enzyme` guard instead of `as any`.
