import { Saccharide } from "./Saccharide";
import { Monosaccharide } from "./Monosaccharide";
import { ELEMENTS } from "../../Element";
import { Atom } from "../../Atom";

/**
 * A polysaccharide (complex carbohydrate).
 * Polymers made of many monosaccharide units linked by glycosidic bonds.
 */
export abstract class Polysaccharide extends Saccharide {
  /**
   * The monomer units that constitute this polysaccharide.
   */
  abstract monomers: Monosaccharide[];

  /**
   * Cached atomic composition to avoid O(n) recalculation on repeated access.
   */
  private _cachedComposition: ReadonlyMap<Atom, number> | null = null;

  /**
   * Number of monomer units in the chain.
   */
  get count(): number {
    return this.monomers.length;
  }

  /**
   * Atomic composition derived from the sum of all monomer residues,
   * minus (n − 1) H₂O molecules lost during glycosidic bond condensation.
   * Result is memoized to avoid repeated O(n) computation.
   */
  get atomicComposition(): ReadonlyMap<Atom, number> {
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
