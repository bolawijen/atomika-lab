import { OligoSaccharide } from "./OligoSaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { GlycosidicBondType } from "./GlycosidicBondType";

/**
 * A disaccharide — an oligosaccharide composed of exactly two
 * monosaccharide units linked by a single glycosidic bond.
 */
export abstract class Disaccharide extends OligoSaccharide {
  abstract override readonly monomers: ReadonlyArray<Monosaccharide>;
  abstract override readonly bondType: GlycosidicBondType;

  override get count(): number {
    return 2;
  }
}
