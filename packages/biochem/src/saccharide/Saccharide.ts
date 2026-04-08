import { Molecule } from "@atomika-lab/core";

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

  /**
   * Octanol-water partition coefficient — saccharides are hydrophilic.
   * Multiple hydroxyl groups make them water-soluble.
   */
  override get logP(): number {
    return -3.0; // Typical for carbohydrates
  }
}
