import { Saccharide } from "./saccharide/Saccharide";

/**
 * The accumulated product mixture from an enzymatic hydrolysis reaction.
 * Tracks all species present in the reaction vessel.
 */
export class ReactionMixture {
  private products: Saccharide[] = [];

  /**
   * Adds hydrolysis products to the reaction mixture.
   */
  add(products: Saccharide[]): void {
    this.products.push(...products);
  }

  /**
   * All species present in the reaction vessel.
   */
  getAll(): ReadonlyArray<Saccharide> {
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
