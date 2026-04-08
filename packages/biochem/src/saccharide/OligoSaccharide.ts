import { Saccharide } from "./Saccharide";
import { Monosaccharide } from "./Monosaccharide";
import { ELEMENTS } from "@atomika-lab/core";
import { Atom } from "@atomika-lab/core";
import { GlycosidicBondType, type GlycosidicBond } from "./GlycosidicBondType";

/**
 * An oligosaccharide — a short chain of 2–10 monosaccharide units
 * linked by glycosidic bonds.
 *
 * Includes disaccharides (n=2), trisaccharides (n=3), and short
 * dextrins. Shorter than polysaccharides but longer than monomers.
 */
export abstract class OligoSaccharide extends Saccharide {
  /**
   * The monomer units constituting this oligosaccharide.
   * Stable structure; chemical transformation produces a new species.
   */
  abstract readonly monomers: ReadonlyArray<Monosaccharide>;

  /**
   * The predominant glycosidic bond type linking the monomers.
   */
  abstract readonly bondType: GlycosidicBondType;

  /**
   * Branch points in the oligosaccharide structure.
   * Most oligosaccharides are linear and lack branch points.
   */
  readonly branchPoints: ReadonlyArray<GlycosidicBond>;

  constructor(branchPoints: GlycosidicBond[] = []) {
    super();
    this.branchPoints = Object.freeze(branchPoints);
  }

  /**
   * Number of monomer units in the chain.
   */
  get count(): number {
    return this.monomers.length;
  }

  /**
   * Number of cleavable glycosidic bonds in the chain.
   */
  get cleavableBondCount(): number {
    return Math.max(0, this.monomers.length - 1);
  }

  /**
   * Counts the number of branch points.
   */
  get branchCount(): number {
    return this.branchPoints.filter(b => b.type === GlycosidicBondType.ALPHA_1_6).length;
  }

  /**
   * Atomic composition derived from the sum of all monomer residues,
   * minus (n − 1) H₂O molecules lost during glycosidic bond condensation.
   */
  override get atomicComposition(): ReadonlyMap<Atom, number> {
    const composition = new Map<Atom, number>();

    for (const monomer of this.monomers) {
      for (const [atom, count] of monomer.atomicComposition) {
        composition.set(atom, (composition.get(atom) || 0) + count);
      }
    }

    const glycosidicBonds = this.monomers.length - 1;
    if (glycosidicBonds > 0) {
      const hCount = composition.get(ELEMENTS.H) || 0;
      const oCount = composition.get(ELEMENTS.O) || 0;
      composition.set(ELEMENTS.H, hCount - 2 * glycosidicBonds);
      composition.set(ELEMENTS.O, oCount - glycosidicBonds);
    }

    return composition;
  }
}
