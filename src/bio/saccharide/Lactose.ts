import { Disaccharide } from "./Disaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { Galactose } from "./Galactose";
import { Glucose } from "./Glucose";
import { GlycosidicBondType } from "./GlycosidicBondType";

/**
 * Lactose — a disaccharide composed of galactose and glucose
 * linked by a β-1,4-glycosidic bond. Milk sugar.
 */
export class Lactose extends Disaccharide {
  readonly monomers: ReadonlyArray<Monosaccharide>;
  readonly bondType = GlycosidicBondType.BETA_1_4;

  constructor() {
    super();
    this.monomers = Object.freeze([new Galactose(), new Glucose()]);
  }

  toString(): string {
    return "Lactose";
  }
}
