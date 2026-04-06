import { Saccharide } from "../saccharide/Saccharide";
import { Environment } from "../Environment";
import { ReactionMixture } from "../ReactionMixture";
import { ReactionResult } from "../ReactionResult";
import { Enzyme } from "./Enzyme";

/**
 * A multi-enzyme system that coordinates simultaneous or sequential
 * catalytic action on a shared reaction mixture.
 *
 * Models a bioreactor or digestive tract where multiple enzymes
 * act on overlapping substrate pools.
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
   * environmental conditions. Each enzyme acts sequentially on the
   * remaining mixture from the previous enzyme.
   *
   * @param substrate The initial saccharide substrate.
   * @param environment Reaction conditions shared by all enzymes.
   * @returns Combined reaction result from all enzymatic actions.
   */
  digest(substrate: Saccharide, environment: Environment): ReactionResult {
    let currentMixture = new ReactionMixture();
    currentMixture.add([substrate]);
    let totalBondsCleaved = 0;
    let initialMass = substrate.molecularMass;
    let allActive = true;

    for (const enzyme of this.enzymes) {
      if (!(enzyme instanceof { digest: Function })) continue;

      const result = (enzyme as any).digest(substrate, environment);
      if (result) {
        totalBondsCleaved += result.conversionRate;
        if (result.remainingSubstrateMass > 0) {
          initialMass = result.remainingSubstrateMass;
        }
        if (!result.isEnzymeStillActive) {
          allActive = false;
        }
      }
    }

    return new ReactionResult(
      currentMixture,
      totalBondsCleaved / Math.max(this.enzymes.length, 1),
      initialMass,
      allActive,
    );
  }
}
