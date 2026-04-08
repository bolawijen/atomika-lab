import { Saccharide, Enzyme, type KineticSnapshot } from "@atomika-lab/biochem";
import { Environment } from "@atomika-lab/core";
import { ReactionMixture, ReactionResult, ReactionVessel } from "@atomika-lab/biochem";

/**
 * A multi-enzyme system in which multiple catalytic species act
 * simultaneously on a shared reaction mixture.
 *
 * Represents a digestive tract or fermentation vessel where enzymes
 * compete for overlapping substrates and their combined activity
 * determines the overall conversion of the reaction mixture.
 */
export class Bioreactor {
  private enzymes: Enzyme[] = [];

  /**
   * Registers an enzyme into the bioreactor system.
   */
  addEnzyme(enzyme: Enzyme): void {
    this.enzymes.push(enzyme);
  }

  /**
   * Subjects the substrate to all registered enzymes under the given
   * environmental conditions. Each time step (1 second) runs every enzyme
   * once on the current state of the reaction mixture, simulating
   * simultaneous rather than sequential action.
   *
   * @param substrate The initial saccharide substrate.
   * @param environment Reaction conditions shared by all enzymes.
   * @returns ReactionResult with full kinetic history.
   */
  digest(substrate: Saccharide, environment: Environment): ReactionResult {
    const vessel = new ReactionVessel(environment);
    let reactionMixture: Saccharide[] = [substrate];
    const totalSteps = Math.min(Math.ceil(environment.durationInSeconds), 10000);
    let currentTemp = environment.temperatureC;

    for (let step = 0; step < totalSteps; step++) {
      vessel.recordProgression(reactionMixture, this.#asMixture(reactionMixture), step, currentTemp);

      // Each enzyme acts on the current mixture simultaneously this tick
      const newProducts: Saccharide[] = [];
      const consumedIndices = new Set<number>();

      for (let i = 0; i < reactionMixture.length; i++) {
        const molecule = reactionMixture[i]!;
        for (const enzyme of this.enzymes) {
          if (!("digest" in enzyme)) continue;
          if (consumedIndices.has(i)) continue;
          if (!this.#isCompatibleSubstrate(molecule, enzyme)) continue;

          const result = (enzyme as any).digest(molecule, environment);
          if (result && result.products) {
            consumedIndices.add(i);
            for (const product of result.products.getAll()) {
              newProducts.push(product);
            }
            break;
          }
        }
      }

      // Replace consumed molecules with products
      const remaining = reactionMixture.filter((_, i) => !consumedIndices.has(i));
      reactionMixture = [...remaining, ...newProducts];

      // Steady-state check
      if (newProducts.length === 0) break;
    }

    return new ReactionResult(
      this.#asMixture(reactionMixture),
      0,
      this.#totalMass(reactionMixture),
      true,
      vessel.getReactionPath(),
    );
  }

  #asMixture(molecules: Saccharide[]): ReactionMixture {
    const mixture = new ReactionMixture();
    mixture.add(molecules);
    return mixture;
  }

  /**
   * Checks whether a molecule is a compatible substrate for the enzyme.
   */
  #isCompatibleSubstrate(molecule: Saccharide, enzyme: Enzyme): boolean {
    if ("bondType" in molecule) {
      return true;
    }
    return molecule.constructor.name.includes("Maltose")
      || molecule.constructor.name.includes("Glucose");
  }

  #totalMass(mixture: Saccharide[]): number {
    let total = 0;
    for (const molecule of mixture) {
      total += molecule.molecularMass;
    }
    return total;
  }
}
