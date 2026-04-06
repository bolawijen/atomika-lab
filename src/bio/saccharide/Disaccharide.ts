import { Polysaccharide } from "./Polysaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { GlycosidicBondType } from "./GlycosidicBondType";

/**
 * A disaccharide.
 * Composed of two monosaccharide units linked by a glycosidic bond.
 */
export abstract class Disaccharide extends Polysaccharide {
  abstract readonly monomers: ReadonlyArray<Monosaccharide>;
  abstract readonly bondType: GlycosidicBondType;

  get count(): number {
    return 2;
  }
}
