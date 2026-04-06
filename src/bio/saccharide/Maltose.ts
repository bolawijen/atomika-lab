import { Disaccharide } from "./Disaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { Glucose } from "./Glucose";
import { GlycosidicBondType } from "./GlycosidicBondType";

/**
 * Maltose — a disaccharide composed of two glucose units
 * linked by an α-1,4-glycosidic bond.
 */
export class Maltose extends Disaccharide {
  readonly monomers: ReadonlyArray<Monosaccharide>;
  readonly bondType = GlycosidicBondType.ALPHA_1_4;

  constructor() {
    super();
    this.monomers = Object.freeze([new Glucose(), new Glucose()]);
  }

  toString(): string {
    return "Maltose";
  }
}
