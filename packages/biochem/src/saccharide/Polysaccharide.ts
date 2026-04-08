import { Saccharide } from "./Saccharide";
import { Monosaccharide } from "./Monosaccharide";
import { ELEMENTS } from "@atomika-lab/core";
import { Atom } from "@atomika-lab/core";
import { GlycosidicBondType, type GlycosidicBond } from "./GlycosidicBondType";

/**
 * A polysaccharide (complex carbohydrate).
 * Polymers made of many monosaccharide units linked by glycosidic bonds.
 * Supports both linear chains (α-1,4) and branched structures (α-1,6 branch points).
 */
export abstract class Polysaccharide extends Saccharide {
  /**
   * The monomer units that constitute this polysaccharide.
   * Stable structure; chemical transformation produces a new species.
   */
  abstract readonly monomers: ReadonlyArray<Monosaccharide>;

  /**
   * The predominant glycosidic bond type in this polysaccharide.
   * Determines which enzymes can hydrolyze the chain.
   */
  abstract readonly bondType: GlycosidicBondType;

  /**
   * Branch points in the polysaccharide structure.
   * Each entry records an α-1,6 linkage connecting a branch to the main chain.
   * Linear polysaccharides (e.g., amylose) lack branch points.
   */
  readonly branchPoints: ReadonlyArray<GlycosidicBond>;

  constructor(branchPoints: GlycosidicBond[] = []) {
    super();
    this.branchPoints = Object.freeze(branchPoints);
  }

  /**
   * Cached atomic composition, computed once on first access.
   * Safe because monomers are immutable.
   */
  private _cachedComposition: ReadonlyMap<Atom, number> | null = null;

  /**
   * Number of monomer units in the chain.
   */
  get count(): number {
    return this.monomers.length;
  }

  /**
   * Number of cleavable glycosidic bonds in the chain.
   * A chain of n monomers has n − 1 bonds.
   */
  get cleavableBondCount(): number {
    return Math.max(0, this.monomers.length - 1);
  }

  /**
   * Counts the number of α-1,6 branch points in this polysaccharide.
   */
  get branchCount(): number {
    return this.branchPoints.filter(b => b.type === GlycosidicBondType.ALPHA_1_6).length;
  }

  /**
   * Atomic composition derived from the sum of all monomer residues,
   * minus (n − 1) H₂O molecules lost during glycosidic bond condensation.
   * Result is computed once and cached, safe because monomers are immutable.
   */
  override get atomicComposition(): ReadonlyMap<Atom, number> {
    if (this._cachedComposition) return this._cachedComposition;

    const composition = new Map<Atom, number>();

    for (const monomer of this.monomers) {
      for (const [atom, count] of monomer.atomicComposition) {
        composition.set(atom, (composition.get(atom) || 0) + count);
      }
    }

    // Subtract (n − 1) H₂O for glycosidic bond formation
    const glycosidicBonds = this.monomers.length - 1;
    if (glycosidicBonds > 0) {
      const hCount = composition.get(ELEMENTS.H) || 0;
      const oCount = composition.get(ELEMENTS.O) || 0;
      composition.set(ELEMENTS.H, hCount - 2 * glycosidicBonds);
      composition.set(ELEMENTS.O, oCount - glycosidicBonds);
    }

    this._cachedComposition = composition;
    return composition;
  }
}
