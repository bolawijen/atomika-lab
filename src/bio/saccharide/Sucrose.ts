import { Disaccharide } from "./Disaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { Glucose } from "./Glucose";
import { Fructose } from "./Fructose";

/**
 * Sucrose — a disaccharide composed of glucose and fructose
 * linked by an α-1,2-glycosidic bond. Common table sugar.
 */
export class Sucrose extends Disaccharide {
  monomers: Monosaccharide[];

  constructor() {
    super();
    this.monomers = [new Glucose(), new Fructose()];
  }

  toString(): string {
    return "Sucrose";
  }
}
