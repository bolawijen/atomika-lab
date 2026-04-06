import { Disaccharide } from "./Disaccharide";
import { Monosaccharide, MolecularIdentity, AnomericState } from "./Monosaccharide";
import { Chirality } from "../../core/Chirality";
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
    this.monomers = Object.freeze([
      new Monosaccharide(MolecularIdentity.GALACTOSE, Chirality.D, AnomericState.ALPHA),
      new Monosaccharide(MolecularIdentity.GLUCOSE, Chirality.D, AnomericState.ALPHA),
    ]);
  }

  toString(): string {
    return "Lactose";
  }
}
