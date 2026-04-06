import { Disaccharide } from "./Disaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { Glucose } from "./Glucose";
import { Fructose } from "./Fructose";
import { GlycosidicBondType } from "./GlycosidicBondType";

/**
 * Sucrose — a disaccharide composed of glucose and fructose
 * linked by an α-1,2-glycosidic bond. Common table sugar.
 */
export class Sucrose extends Disaccharide {
  readonly monomers: ReadonlyArray<Monosaccharide>;
  readonly bondType = GlycosidicBondType.ALPHA_1_4;

  constructor() {
    super();
    this.monomers = Object.freeze([new Glucose(), new Fructose()]);
  }

  toString(): string {
    return "Sucrose";
  }
}
