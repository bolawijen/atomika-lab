import { BioMolecule } from "./BioMolecule";

/**
 * The accumulated product mixture from an enzymatic hydrolysis reaction.
 * Tracks all species present in the reaction vessel.
 */
export class ReactionMixture {
  private products: BioMolecule[] = [];

  /**
   * Adds hydrolysis products to the reaction mixture.
   */
  add(products: BioMolecule[]): void {
    this.products.push(...products);
  }

  /**
   * All species present in the reaction vessel.
   */
  getAll(): ReadonlyArray<BioMolecule> {
    return this.products;
  }

  /**
   * Total molecular mass of all products in the mixture (Da).
   */
  get totalMass(): number {
    let mass = 0;
    for (const product of this.products) {
      mass += product.molecularMass;
    }
    return mass;
  }

  /**
   * Number of distinct molecular species in the mixture.
   */
  get speciesCount(): number {
    return this.products.length;
  }
}
