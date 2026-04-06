import { Polysaccharide } from "./Polysaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { Glucose } from "./Glucose";

/**
 * Amylose — a linear polysaccharide of glucose units linked by α-1,4-glycosidic bonds.
 */
export class Amylose extends Polysaccharide {
  monomers: Monosaccharide[];

  /**
   * @param glucoseUnitCount The number of glucose units in the chain.
   */
  constructor(glucoseUnitCount: number) {
    super();
    this.monomers = Array.from({ length: glucoseUnitCount }, () => new Glucose());
  }

  toString(): string {
    return `Amylose(n=${this.count})`;
  }
}
