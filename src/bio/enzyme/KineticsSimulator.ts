import { Polysaccharide } from "../saccharide/Polysaccharide";
import { ReactionMixture } from "../ReactionMixture";
import { KineticSnapshot } from "../ReactionResult";

/**
 * Parameters governing the catalytic kinetics of an enzyme.
 */
export interface KineticParameters {
  /** Catalytic rate constant (bonds/s per enzyme molecule at saturation). */
  kCat: number;
  /** Michaelis constant — substrate concentration at half Vmax. */
  kM: number;
  /** Product inhibition constant — product concentration at half-maximal inhibition. */
  kI: number;
  /** pH activity scaling factor (0–1). */
  phActivity: number;
  /** Temperature activity scaling factor (0–1). */
  tempActivity: number;
  /** Maximum simulation steps to prevent runaway loops. */
  maxSteps: number;
}

/**
 * The outcome of one catalytic time step.
 */
export interface CleavageOutcome {
  /** Number of glycosidic bonds cleaved during this step. */
  bondsThisStep: number;
  /** Current substrate concentration (total cleavable bonds). */
  substrateConcentration: number;
}

/**
 * Computes the time-stepped kinetics of an enzymatic hydrolysis reaction.
 *
 * Handles Michaelis-Menten rate calculation with competitive product inhibition,
 * stochastic rounding of fractional bond counts, and kinetic snapshot recording.
 */
export class KineticsSimulator {
  /**
   * Calculates the effective bond cleavage rate (bonds/s) using
   * Michaelis-Menten kinetics with competitive product inhibition.
   */
  calculateCleavageRate(
    parameters: KineticParameters,
    mixture: Polysaccharide[],
    products: ReactionMixture,
  ): number {
    const substrateConcentration = this.#totalCleavableBonds(mixture);
    const productConcentration = products.speciesCount;

    const vmax = parameters.kCat * parameters.phActivity * parameters.tempActivity;
    const inhibitionFactor = 1 + productConcentration / parameters.kI;
    return vmax * substrateConcentration / (parameters.kM * inhibitionFactor + substrateConcentration);
  }

  /**
   * Converts a fractional cleavage rate into an integer bond count
   * using stochastic rounding.
   */
  probabilisticBonds(rate: number): number {
    const base = Math.floor(rate);
    const remainder = rate - base;
    return Math.random() < remainder ? base + 1 : base;
  }

  /**
   * Records the current state of the reaction for kinetic history.
   */
  recordSnapshot(mixture: Polysaccharide[], products: ReactionMixture, timeInSeconds: number): KineticSnapshot {
    return {
      timeInSeconds,
      remainingBonds: this.#totalCleavableBonds(mixture),
      productCount: products.speciesCount,
    };
  }

  /**
   * Sums all cleavable glycosidic bonds across every molecule in the mixture.
   */
  #totalCleavableBonds(mixture: Polysaccharide[]): number {
    let total = 0;
    for (const fragment of mixture) {
      total += fragment.cleavableBondCount;
    }
    return total;
  }
}
