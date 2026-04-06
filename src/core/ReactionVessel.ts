import { Polysaccharide } from "../bio/saccharide/Polysaccharide";
import { Saccharide } from "../bio/saccharide/Saccharide";
import { Monosaccharide } from "../bio/saccharide/Monosaccharide";
import { ReactionMixture } from "./ReactionMixture";
import { KineticSnapshot } from "./ReactionResult";
import { Environment } from "./Environment";
import { Atom } from "../Atom";

/**
 * Thrown when atomic mass balance is violated during a simulation step.
 */
export class StoichiometricError extends Error {
  constructor(element: string, expected: number, actual: number) {
    super(`Stoichiometric imbalance: ${element} expected ${expected}, got ${actual}`);
    this.name = "StoichiometricError";
  }
}

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
  /** Equilibrium constant — ratio of forward to reverse reaction rates. */
  kEq: number;
  /** Enthalpy of reaction (kJ/mol) — heat released or absorbed per bond cleaved. */
  deltaH: number;
}

/**
 * The physical container for an enzymatic reaction.
 *
 * Holds the environmental conditions, vessel volume, and current temperature.
 * Computes kinetic rates using molar concentrations rather than raw counts.
 * Records kinetic snapshots and allows temperature to drift based on
 * the enthalpy of reaction.
 */
export class ReactionVessel {
  private environment: Environment;
  private currentTemperature: number;
  private reactionPath: KineticSnapshot[] = [];
  private initialAtomCounts: Map<Atom, number> | null = null;

  /**
   * Volume of the reaction vessel in liters.
   * Used to convert molecule counts to molar concentrations.
   */
  readonly volumeInLiters: number;

  /**
   * Threshold below which Gillespie stochastic simulation is used
   * instead of deterministic Michaelis-Menten kinetics.
   */
  private readonly GILLESPIE_THRESHOLD = 10;

  /**
   * Maximum fraction of substrate that can be consumed in a single step.
   * Controls adaptive time-step sizing.
   */
  private readonly MAX_FRACTION_PER_STEP = 0.05;

  constructor(environment: Environment, volumeInLiters: number = 1e-15) {
    this.environment = environment;
    this.currentTemperature = environment.temperatureC;
    this.volumeInLiters = volumeInLiters;
  }

  /**
   * The current temperature of the reaction mixture (°C).
   * May drift from the initial set point due to reaction enthalpy.
   */
  getCurrentTemperature(): number {
    return this.currentTemperature;
  }

  /**
   * The environmental conditions governing enzyme activity within this vessel.
   */
  getEnvironment(): Environment {
    return this.environment;
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
    kinetics: EnzymeKinetics,
    phActivity: number,
    tempActivity: number,
    mixture: Polysaccharide[],
    products: ReactionMixture,
  ): number {
    const substrateConcentration = this.#molarConcentration(this.#totalCleavableBonds(mixture));
    const productConcentration = this.#molarConcentration(products.speciesCount);

    const vmax = kinetics.kCat * phActivity * tempActivity;
    const inhibitionFactor = 1 + productConcentration / kinetics.kI;

    // Forward rate from Michaelis-Menten
    const forwardRate = vmax * substrateConcentration / (kinetics.kM * inhibitionFactor + substrateConcentration);

    // Reverse rate (condensation) driven by equilibrium constant
    // When [P]/[S] approaches Keq, net rate approaches zero
    const reactionQuotient = substrateConcentration > 0 ? productConcentration / substrateConcentration : 0;
    const equilibriumFactor = 1 - reactionQuotient / kinetics.kEq;

    return forwardRate * Math.max(0, equilibriumFactor);
  }

  /**
   * Updates the vessel temperature based on the enthalpy of reaction.
   * Each bond cleaved releases or absorbs heat, shifting the temperature
   * according to the specific heat capacity of water.
   */
  applyThermalDrift(bondsCleaved: number, deltaH: number): void {
    if (bondsCleaved === 0) return;

    // Specific heat capacity of water: 4.184 J/(g·°C)
    // Mass of water in vessel ≈ volumeInLiters × 1000 g/L
    const waterMass = this.volumeInLiters * 1000;
    const specificHeat = 4.184;

    // Energy released: bondsCleaved × |ΔH| (converted from kJ/mol to J)
    // Assuming 1 molecule ≈ 1/NA mol, scale to simulation units
    const energyJoules = bondsCleaved * Math.abs(deltaH) * 1000 / 6.022e23;
    const temperatureChange = energyJoules / (waterMass * specificHeat);

    // Exothermic (ΔH < 0) raises temperature; endothermic lowers it
    if (deltaH < 0) {
      this.currentTemperature += temperatureChange;
    } else {
      this.currentTemperature -= temperatureChange;
    }
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
   * Records the current state of the reaction mixture along the reaction path.
   */
  recordProgression(mixture: Saccharide[], products: ReactionMixture, timeInSeconds: number): KineticSnapshot {
    const snapshot = {
      timeInSeconds,
      remainingBonds: this.#totalCleavableBondsInMixture(mixture),
      productCount: products.speciesCount,
      temperatureC: this.currentTemperature,
    };
    this.registerState(snapshot);
    return snapshot;
  }

  /**
   * Registers a kinetic state along the reaction path.
   */
  registerState(snapshot: KineticSnapshot): void {
    this.reactionPath.push(snapshot);
  }

  /**
   * Returns the chronological reaction path.
   */
  getReactionPath(): ReadonlyArray<KineticSnapshot> {
    return this.reactionPath;
  }

  /**
   * Clears the reaction path for a new reaction.
   */
  resetPath(): void {
    this.reactionPath = [];
  }

  /**
   * Performs mutarotation on all free monosaccharides in the mixture.
   * In aqueous solution, monosaccharides spontaneously interconvert
   * between alpha and beta anomeric forms, approaching an equilibrium
   * ratio (typically ~36% alpha, ~64% beta for glucose at 25°C).
   */
  performMutarotation(mixture: Saccharide[]): void {
    for (const molecule of mixture) {
      if (molecule instanceof Monosaccharide) {
        // Stochastic mutarotation — each monosaccharide has a probability
        // of flipping its anomeric state each second
        if (Math.random() < 0.1) {
          molecule.mutarotate();
        }
      }
    }
  }

  /**
   * Converts a molecule count to molar concentration (M).
   */
  #molarConcentration(moleculeCount: number): number {
    return moleculeCount / (6.022e23 * this.volumeInLiters);
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

  // ── Scientific Integrity ─────────────────────────────────────────

  /**
   * Records the initial atomic composition of the reaction mixture.
   * Must be called before the simulation starts to establish the mass balance baseline.
   */
  recordInitialComposition(mixture: Saccharide[]): void {
    this.initialAtomCounts = this.#countAllAtoms(mixture);
  }

  /**
   * Verifies that atomic mass is conserved between the initial composition
   * and the current reaction mixture. Throws StoichiometricError if any
   * element shows a discrepancy.
   *
   * This check catches mass loss from logic gaps, rounding errors,
   * or incomplete product tracking in multi-enzyme systems.
   */
  verifyMassBalance(mixture: Saccharide[]): void {
    if (!this.initialAtomCounts) return;

    const currentCounts = this.#countAllAtoms(mixture);

    for (const [atom, expected] of this.initialAtomCounts) {
      const actual = currentCounts.get(atom) || 0;
      if (actual !== expected) {
        throw new StoichiometricError(atom.symbol, expected, actual);
      }
    }
  }

  /**
   * Counts all atoms across every molecule in the mixture.
   * Uses atomicComposition from each molecule and sums them.
   */
  #countAllAtoms(mixture: Saccharide[]): Map<Atom, number> {
    const counts = new Map<Atom, number>();

    for (const molecule of mixture) {
      for (const [atom, count] of molecule.atomicComposition) {
        counts.set(atom, (counts.get(atom) || 0) + count);
      }
    }

    return counts;
  }

  /**
   * Calculates an adaptive time-step size based on the current reaction rate.
   *
   * When the reaction rate is high, the step size is reduced to ensure
   * that no more than MAX_FRACTION_PER_STEP (5%) of substrate is consumed
   * in a single iteration, preventing numerical overshoot.
   *
   * @param reactionRate Bonds cleaved per second at current conditions.
   * @param availableBonds Total cleavable bonds remaining.
   * @returns Time-step duration in seconds, clamped to [0.001, 1.0].
   */
  calculateAdaptiveStepSize(reactionRate: number, availableBonds: number): number {
    if (reactionRate <= 0 || availableBonds <= 0) return 1.0;

    // Limit consumption to MAX_FRACTION_PER_STEP of available bonds per step
    const maxBondsPerStep = availableBonds * this.MAX_FRACTION_PER_STEP;
    const constrainedStep = maxBondsPerStep / reactionRate;

    // Clamp to reasonable bounds
    return Math.max(0.001, Math.min(1.0, constrainedStep));
  }

  /**
   * Determines whether the system is in the low-concentration regime
   * where stochastic (Gillespie) simulation should be used instead
   * of deterministic Michaelis-Menten kinetics.
   *
   * @param substrateCount Number of substrate molecules present.
   * @returns True if substrate count is below the Gillespie threshold.
   */
  isLowConcentrationRegime(substrateCount: number): boolean {
    return substrateCount < this.GILLESPIE_THRESHOLD;
  }

  /**
   * Gillespie stochastic simulation step — determines the number of
   * reaction events in the next time interval using the direct method.
   *
   * At low concentrations, reactions occur as discrete stochastic events
   * rather than continuous rates. This method samples from an exponential
   * distribution to determine when the next reaction occurs.
   *
   * @param reactionRate The propensity (probability per unit time) of the reaction.
   * @param timeInterval The duration to simulate.
   * @returns Number of reaction events that occurred (0 or 1 for low rates).
   */
  gillespieStep(reactionRate: number, timeInterval: number): number {
    if (reactionRate <= 0) return 0;

    // Time to next reaction event: exponential distribution
    const timeToNextReaction = -Math.log(Math.random()) / reactionRate;

    // If the next reaction occurs within our time interval, count it
    return timeToNextReaction < timeInterval ? 1 : 0;
  }
}
