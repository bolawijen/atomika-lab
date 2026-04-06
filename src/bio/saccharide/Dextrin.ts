import { Polysaccharide } from "./Polysaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { GlycosidicBondType } from "./GlycosidicBondType";

/**
 * Dextrin — a short-chain polysaccharide.
 * Intermediate product of starch hydrolysis.
 */
export class Dextrin extends Polysaccharide {
  readonly monomers: ReadonlyArray<Monosaccharide>;
  readonly bondType = GlycosidicBondType.ALPHA_1_4;

  /**
   * @param monomers The monomer units constituting this dextrin fragment.
   */
  constructor(monomers: Monosaccharide[]) {
    super();
    this.monomers = Object.freeze(monomers);
  }

  toString(): string {
    return `Dextrin(n=${this.count})`;
  }
}
