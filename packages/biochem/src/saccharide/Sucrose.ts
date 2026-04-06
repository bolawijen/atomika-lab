import { Disaccharide } from "./Disaccharide";
import { Monosaccharide, MolecularIdentity, AnomericState } from "./Monosaccharide";
import { Chirality } from "@atomika-lab/core";
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
    this.monomers = Object.freeze([
      new Monosaccharide(MolecularIdentity.GLUCOSE, Chirality.D, AnomericState.ALPHA),
      new Monosaccharide(MolecularIdentity.FRUCTOSE, Chirality.D, AnomericState.ALPHA),
    ]);
  }

  toString(): string {
    return "Sucrose";
  }
}
