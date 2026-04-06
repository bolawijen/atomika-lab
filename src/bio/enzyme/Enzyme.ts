import { ProteinChain } from "../ProteinChain";
import { AminoAcid } from "../AminoAcid";
import { Saccharide } from "../saccharide/Saccharide";
import { Molecule } from "../../Molecule";

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
