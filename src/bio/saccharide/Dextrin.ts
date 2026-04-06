import { OligoSaccharide } from "./OligoSaccharide";
import { Monosaccharide, MolecularIdentity } from "./Monosaccharide";
import { Chirality } from "../../core/Chirality";
import { AnomericState } from "./Monosaccharide";
import { GlycosidicBondType } from "./GlycosidicBondType";

/**
 * Dextrin — a short-chain oligosaccharide.
 * Intermediate product of starch hydrolysis.
 */
export class Dextrin extends OligoSaccharide {
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
