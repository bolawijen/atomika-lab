import { ProteinChain } from "../ProteinChain";
import { AminoAcid } from "../AminoAcid";
import { Saccharide } from "../saccharide/Saccharide";

/**
 * Enzymes are specialized protein chains that act as biological catalysts,
 * accelerating specific biochemical reactions through their unique tertiary structure.
 */
export abstract class Enzyme extends ProteinChain {
  /**
   * Catalytic action of the enzyme on its specific substrate.
   * @param substrate The molecule(s) that the enzyme acts upon.
   * @returns The product(s) of the enzymatic reaction.
   */
  abstract digest(substrate: Saccharide): Saccharide[] | Saccharide;

  /**
   * Creates an enzyme from a sequence of amino acids.
   * @param sequence The amino acid sequence forming the catalytic protein.
   */
  constructor(sequence: AminoAcid[] = []) {
    super(sequence);
  }
}
