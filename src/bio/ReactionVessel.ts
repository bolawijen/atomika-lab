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
  private snapshots: KineticSnapshot[] = [];

  /**
   * Volume of the reaction vessel in liters.
   * Used to convert molecule counts to molar concentrations.
   */
  readonly volumeInLiters: number;

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
   * Records the current state of the reaction mixture for kinetic history.
   */
  recordSnapshot(mixture: Saccharide[], products: ReactionMixture, timeInSeconds: number): KineticSnapshot {
    return {
      timeInSeconds,
      remainingBonds: this.#totalCleavableBondsInMixture(mixture),
      productCount: products.speciesCount,
      temperatureC: this.currentTemperature,
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
}
