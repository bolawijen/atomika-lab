import { Polysaccharide } from "./Polysaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { Glucose } from "./Glucose";
import { GlycosidicBondType } from "./GlycosidicBondType";

/**
 * Amylose — a linear polysaccharide of glucose units linked by α-1,4-glycosidic bonds.
 */
export class Amylose extends Polysaccharide {
  readonly monomers: ReadonlyArray<Monosaccharide>;
  readonly bondType = GlycosidicBondType.ALPHA_1_4;

  /**
   * @param glucoseUnitCount The number of glucose units in the chain.
   */
  constructor(glucoseUnitCount: number) {
    super(); // Amylose is linear — no branch points
    this.monomers = Object.freeze(Array.from({ length: glucoseUnitCount }, () => new Glucose()));
  }

  toString(): string {
    return `Amylose(n=${this.count})`;
  }
}
