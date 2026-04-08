import { Saccharide, Enzyme } from "@atomika-lab/biochem";
import { Environment } from "@atomika-lab/core";
import { ReactionMixture, ReactionResult } from "@atomika-lab/biochem";

/**
 * A kinetic snapshot taken at one time step during a multi-enzyme reaction.
 */
export interface KineticSnapshot {
  /** Time elapsed since reaction start (seconds). */
  timeInSeconds: number;
  /** Total cleavable bonds remaining across all substrate molecules. */
  remainingBonds: number;
  /** Number of distinct product molecules accumulated. */
  productCount: number;
}

/**
 * A multi-enzyme system that coordinates simultaneous catalytic action
 * on a shared reaction mixture using tick-based time stepping.
 *
 * Models a bioreactor or digestive tract where multiple enzymes
 * act concurrently on the same pool of molecules.
 */
export class EnzymeComplex {
  private enzymes: Enzyme[] = [];

  /**
   * Registers an enzyme into the reaction system.
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
    const history: KineticSnapshot[] = [];
    let reactionMixture: Saccharide[] = [substrate];
    const productMixture = new ReactionMixture();
    const totalSteps = Math.min(Math.ceil(environment.durationInSeconds), 10000);

    for (let step = 0; step < totalSteps; step++) {
      const snapshot: KineticSnapshot = {
        timeInSeconds: step,
        remainingBonds: this.#countRemainingBonds(reactionMixture),
        productCount: productMixture.speciesCount,
      };
      history.push(snapshot);

      // Each enzyme acts on the current mixture simultaneously this tick
      for (const enzyme of this.enzymes) {
        if (!("digest" in enzyme)) continue;
        const result = (enzyme as any).digest(this.#combineMixture(reactionMixture), environment);
        if (result && result.products) {
          for (const product of result.products.getAll()) {
            productMixture.add([product]);
          }
          reactionMixture = result.products.getAll().length > 0
            ? [...result.products.getAll()]
            : reactionMixture;
        }
      }

      // Steady-state check: if no bonds remain, stop early
      if (this.#countRemainingBonds(reactionMixture) === 0) break;
    }

    return new ReactionResult(
      productMixture,
      0,
      this.#totalMass(reactionMixture),
      true,
      history,
    );
  }

  #combineMixture(mixture: Saccharide[]): Saccharide {
    if (mixture.length === 1) return mixture[0]!;
    return mixture[0]!;
  }

  #countRemainingBonds(mixture: Saccharide[]): number {
    let total = 0;
    for (const molecule of mixture) {
      if ("cleavableBondCount" in molecule) {
        total += (molecule as any).cleavableBondCount;
      }
    }
    return total;
  }

  #totalMass(mixture: Saccharide[]): number {
    let total = 0;
    for (const molecule of mixture) {
      total += molecule.molecularMass;
    }
    return total;
  }
}
