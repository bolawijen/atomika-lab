import { ProteinChain } from "../ProteinChain";
import { Saccharide } from "../saccharide/Saccharide";

/**
 * Enzymes are biological catalysts, typically proteins, that accelerate specific biochemical reactions.
 */
export abstract class Enzyme {
  /**
   * The primary structure of the enzyme, represented as a protein chain.
   */
  protein: ProteinChain;

  /**
   * @param protein The protein chain constituting this enzyme.
   */
  constructor(protein: ProteinChain) {
    this.protein = protein;
  }

  /**
   * Catalytic action of the enzyme on its specific substrate.
   * @param substrate The molecule(s) that the enzyme acts upon.
   * @returns The product(s) of the enzymatic reaction.
   */
  abstract digest(substrate: Saccharide): Saccharide[] | Saccharide;
}
