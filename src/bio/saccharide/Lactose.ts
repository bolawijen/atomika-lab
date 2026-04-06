import { Disaccharide } from "./Disaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { Galactose } from "./Galactose";
import { Glucose } from "./Glucose";

/**
 * Lactose — a disaccharide composed of galactose and glucose
 * linked by a β-1,4-glycosidic bond. Milk sugar.
 */
export class Lactose extends Disaccharide {
  monomers: Monosaccharide[];

  constructor() {
    super();
    this.monomers = [new Galactose(), new Glucose()];
  }

  toString(): string {
    return "Lactose";
  }
}
