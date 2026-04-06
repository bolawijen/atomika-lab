import { Disaccharide } from "./Disaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { Glucose } from "./Glucose";

/**
 * Maltose — a disaccharide composed of two glucose units
 * linked by an α-1,4-glycosidic bond.
 */
export class Maltose extends Disaccharide {
  monomers: Monosaccharide[];

  constructor() {
    super();
    this.monomers = [new Glucose(), new Glucose()];
  }

  toString(): string {
    return "Maltose";
  }
}
