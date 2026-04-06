import { OligoSaccharide } from "./OligoSaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { GlycosidicBondType } from "./GlycosidicBondType";

/**
 * A disaccharide — an oligosaccharide composed of exactly two
 * monosaccharide units linked by a single glycosidic bond.
 */
export abstract class Disaccharide extends OligoSaccharide {
  abstract readonly monomers: ReadonlyArray<Monosaccharide>;
  abstract readonly bondType: GlycosidicBondType;

  get count(): number {
    return 2;
  }
}
