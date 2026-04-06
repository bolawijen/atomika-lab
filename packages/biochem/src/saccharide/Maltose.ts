import { Disaccharide } from "./Disaccharide";
import { Monosaccharide, MolecularIdentity, AnomericState } from "./Monosaccharide";
import { Chirality } from "@atomika-lab/core";
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
    this.monomers = Object.freeze([
      new Monosaccharide(MolecularIdentity.GLUCOSE, Chirality.D, AnomericState.ALPHA),
      new Monosaccharide(MolecularIdentity.GLUCOSE, Chirality.D, AnomericState.ALPHA),
    ]);
  }

  toString(): string {
    return "Maltose";
  }
}
