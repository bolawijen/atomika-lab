import { Polysaccharide } from "../saccharide/Polysaccharide";
import { Saccharide } from "../saccharide/Saccharide";
import { ReactionMixture } from "./ReactionMixture";
import { KineticSnapshot } from "./ReactionResult";
import { Environment } from "./Environment";

/**
 * Parameters governing the catalytic kinetics of an enzyme.
 */
export interface EnzymeKinetics {
  /** Catalytic rate constant (bonds/s per enzyme molecule at saturation). */
  kCat: number;
  /** Michaelis constant — substrate concentration at half Vmax. */
  kM: number;
  /** Product inhibition constant — product concentration at half-maximal inhibition. */
  kI: number;
}

/**
 * The physical container for an enzymatic reaction.
 *
 * Holds the environmental conditions and computes the kinetic rate
 * for each enzyme acting within the vessel. Records kinetic snapshots
 * for tracking concentration changes over time.
 */
export class ReactionVessel {
  private environment: Environment;
  private snapshots: KineticSnapshot[] = [];

  constructor(environment: Environment) {
    this.environment = environment;
  }

  /**
   * The environmental conditions governing enzyme activity within this vessel.
   */
  getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Calculates the effective bond cleavage rate (bonds/s) using
   * Michaelis-Menten kinetics with competitive product inhibition.
   */
  calculateCleavageRate(
    kinetics: EnzymeKinetics,
    phActivity: number,
    tempActivity: number,
    mixture: Polysaccharide[],
    products: ReactionMixture,
  ): number {
    const substrateConcentration = this.#totalCleavableBonds(mixture);
    const productConcentration = products.speciesCount;

    const vmax = kinetics.kCat * phActivity * tempActivity;
    const inhibitionFactor = 1 + productConcentration / kinetics.kI;
    return vmax * substrateConcentration / (kinetics.kM * inhibitionFactor + substrateConcentration);
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
   * Records the current state of the reaction mixture for kinetic history.
   */
  recordSnapshot(mixture: Saccharide[], products: ReactionMixture, timeInSeconds: number): KineticSnapshot {
    return {
      timeInSeconds,
      remainingBonds: this.#totalCleavableBondsInMixture(mixture),
      productCount: products.speciesCount,
    };
  }

  /**
   * Returns the accumulated kinetic snapshots.
   */
  getHistory(): ReadonlyArray<KineticSnapshot> {
    return this.snapshots;
  }

  /**
   * Clears the snapshot history for a new reaction.
   */
  resetHistory(): void {
    this.snapshots = [];
  }

  #totalCleavableBonds(mixture: Polysaccharide[]): number {
    let total = 0;
    for (const fragment of mixture) {
      total += fragment.cleavableBondCount;
    }
    return total;
  }

  #totalCleavableBondsInMixture(mixture: Saccharide[]): number {
    let total = 0;
    for (const molecule of mixture) {
      if ("cleavableBondCount" in molecule) {
        total += (molecule as Polysaccharide).cleavableBondCount;
      }
    }
    return total;
  }
}
