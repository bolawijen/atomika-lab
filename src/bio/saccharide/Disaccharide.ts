import { Polysaccharide } from "./Polysaccharide";
import { Monosaccharide } from "./Monosaccharide";

/**
 * A disaccharide.
 * Composed of two monosaccharide units linked by a glycosidic bond.
 */
export abstract class Disaccharide extends Polysaccharide {
  abstract monomers: Monosaccharide[];

  get count(): number {
    return 2;
  }
}
