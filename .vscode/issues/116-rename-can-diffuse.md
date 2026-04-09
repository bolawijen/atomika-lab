# Issue 116: Rename canDiffuse()/canTBDiffuse() to high-level membrane check

## Problem
Current method names `canDiffuse()` and `canTBDiffuse()` are technical and abstract. They don't read like a biological narrative.

```ts
if (!this.canTBDiffuse()) return this.tbNoAbsorptionRecords();
```

## Proposal
Use a more natural, high-level check that reads like a biological statement:

```ts
if (!this.cellMembrane.isIntact) return this.tbNoAbsorptionRecords();
// or
if (this.cellMembrane.isDamaged) return this.tbNoAbsorptionRecords();
```

Remove the wrapper methods `canDiffuse()` and `canTBDiffuse()`. Access the membrane state directly — it's clearer and more concise.

### Rules
- Method names should read like biological statements
- Avoid wrapper methods that just return a property
- "Can I absorb?" → "Is my membrane okay?"
