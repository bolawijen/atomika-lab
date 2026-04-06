import { Molecule } from "../../Molecule";

/**
 * A carbohydrate (saccharide).
 * Sugars and their polymers, composed of carbon, hydrogen, and oxygen.
 */
export abstract class Saccharide extends Molecule {
  /**
   * Number of monomer units in the saccharide.
   * Monosaccharides have count 1, disaccharides 2, polysaccharides ≥ 3.
   */
  abstract get count(): number;
}
