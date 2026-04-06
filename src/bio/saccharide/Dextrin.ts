import { Polysaccharide } from "./Polysaccharide";
import { Monosaccharide } from "./Monosaccharide";

/**
 * Dextrin — a short-chain polysaccharide.
 * Intermediate product of starch hydrolysis.
 */
export class Dextrin extends Polysaccharide {
  monomers: Monosaccharide[];

  /**
   * @param monomers The monomer units constituting this dextrin fragment.
   */
  constructor(monomers: Monosaccharide[]) {
    super();
    this.monomers = monomers;
  }

  toString(): string {
    return `Dextrin(n=${this.count})`;
  }
}
