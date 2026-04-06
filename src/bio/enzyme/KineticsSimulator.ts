import { Polysaccharide } from "../saccharide/Polysaccharide";
import { ReactionMixture } from "../../core/ReactionMixture";
import { KineticSnapshot } from "../../core/ReactionResult";

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
  /** Equilibrium constant — ratio of forward to reverse reaction rates. */
  kEq: number;
  /** Enthalpy of reaction (kJ/mol) — heat released or absorbed per bond cleaved. */
  deltaH: number;
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
 * reversible reaction equilibrium, stochastic rounding of fractional bond counts,
 * and kinetic snapshot recording.
 */
export class KineticsSimulator {
  /**
   * Volume of the reaction vessel in liters.
   * Used to convert molecule counts to molar concentrations.
   */
  private readonly volumeInLiters: number;

  constructor(volumeInLiters: number = 1e-15) {
    this.volumeInLiters = volumeInLiters;
  }

  /**
   * Calculates the effective bond cleavage rate (bonds/s) using
   * Michaelis-Menten kinetics with competitive product inhibition
   * and reversible reaction equilibrium.
   *
   * When product concentration approaches the equilibrium ratio,
   * the net rate decreases and may become negative (condensation).
   */
  calculateCleavageRate(
    parameters: KineticParameters,
    mixture: Polysaccharide[],
    products: ReactionMixture,
  ): number {
    const substrateConcentration = this.#molarConcentration(this.#totalCleavableBonds(mixture));
    const productConcentration = this.#molarConcentration(products.speciesCount);

    const vmax = parameters.kCat * parameters.phActivity * parameters.tempActivity;
    const inhibitionFactor = 1 + productConcentration / parameters.kI;

    // Forward rate from Michaelis-Menten
    const forwardRate = vmax * substrateConcentration / (parameters.kM * inhibitionFactor + substrateConcentration);

    // Reverse rate (condensation) driven by equilibrium constant
    // When [P]/[S] approaches Keq, net rate approaches zero
    const reactionQuotient = substrateConcentration > 0 ? productConcentration / substrateConcentration : 0;
    const equilibriumFactor = 1 - reactionQuotient / parameters.kEq;

    return forwardRate * Math.max(0, equilibriumFactor);
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
  recordSnapshot(mixture: Polysaccharide[], products: ReactionMixture, timeInSeconds: number, temperatureC?: number): KineticSnapshot {
    return {
      timeInSeconds,
      remainingBonds: this.#totalCleavableBonds(mixture),
      productCount: products.speciesCount,
      temperatureC,
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

  /**
   * Converts a molecule count to molar concentration (M).
   */
  #molarConcentration(moleculeCount: number): number {
    return moleculeCount / (6.022e23 * this.volumeInLiters);
  }
}
