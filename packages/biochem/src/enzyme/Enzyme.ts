import { ProteinChain } from "@atomika-lab/biochem";
import { AminoAcid } from "@atomika-lab/biochem";
import { Saccharide } from "../saccharide/Saccharide";
import { Molecule } from "@atomika-lab/core";
import { ReactionResult } from "../ReactionResult";
import { Environment } from "@atomika-lab/core";

/**
 * Enzymes are specialized protein chains that act as biological catalysts,
 * accelerating specific biochemical reactions through their unique tertiary structure.
 */
export abstract class Enzyme extends ProteinChain {
  /**
   * Catalytic transformation of the substrate into reaction products.
   *
   * @param substrate The molecule(s) that the enzyme acts upon.
   * @param environment Reaction conditions affecting catalytic rate.
   * Complete reaction outcome including products and kinetic metadata.
   */
  abstract digest(substrate: Saccharide, environment?: Environment): ReactionResult;

  /**
   * Creates an enzyme from a sequence of amino acids.
   * @param sequence The amino acid sequence forming the catalytic protein.
   */
  constructor(sequence: AminoAcid[] = []) {
    super(sequence);
  }

  /**
   * Reduces catalytic activity when an inhibitor molecule binds to the active site.
   *
   * @param inhibitor The molecule competing for the active site.
   * @param bindingConstant Dissociation constant Ki (nM) for the enzyme-inhibitor complex.
   */
  inhibit(inhibitor: Molecule, bindingConstant: number): void {
    // Default implementation: subclasses override for specific inhibition mechanisms
    // Competitive inhibition increases apparent Km: Km_app = Km × (1 + [I]/Ki)
  }
}
