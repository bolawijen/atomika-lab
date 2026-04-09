# Issue 117: Rename cellMembrane to membrane

## Problem
`this.cellMembrane` is redundant — `this` is the cell, so `this.membrane` is clear enough.

```ts
if (!this.cellMembrane.isIntact) return ...
```

## Proposal
Rename `cellMembrane` property to `membrane` across all cell classes.

```ts
if (!this.membrane.isIntact) return ...
```
