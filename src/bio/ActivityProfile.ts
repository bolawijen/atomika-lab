import { Environment } from "../Environment";
import { Atom } from "../Atom";

/**
 * Encapsulates how an enzyme responds to its chemical environment.
 *
 * Computes a combined activity factor (0.0–1.0) from pH, temperature,
 * and co-factor availability. Also tracks irreversible denaturation state.
 */
export class ActivityProfile {
  /** Optimal pH for maximal catalytic rate. */
  private readonly optimalPh: number;
  /** pH tolerance width — controls the breadth of the bell-shaped curve. */
  private readonly phTolerance: number;
  /** Optimal temperature for catalytic activity (°C). */
  private readonly optimalTemp: number;
  /** Temperature threshold for irreversible thermal denaturation (°C). */
  private readonly denaturationThreshold: number;
  /** Required co-factors: maps each element to its minimum concentration (mM). */
  private readonly requiredCofactors: ReadonlyMap<Atom, number>;

  /** Permanent structural damage flag — once true, the enzyme can never recover. */
  isDenatured = false;

  constructor(
    optimalPh: number,
    phTolerance: number,
    optimalTemp: number,
    denaturationThreshold: number,
    requiredCofactors: ReadonlyMap<Atom, number> = new Map(),
  ) {
    this.optimalPh = optimalPh;
    this.phTolerance = phTolerance;
    this.optimalTemp = optimalTemp;
    this.denaturationThreshold = denaturationThreshold;
    this.requiredCofactors = requiredCofactors;
  }

  /**
   * Computes the combined activity factor (0.0–1.0) from all environmental factors.
   * Returns 0 if the enzyme is denatured or any factor completely inhibits activity.
   */
  calculateActivityFactor(environment: Environment): number {
    if (this.isDenatured) return 0;

    const phFactor = this.#calculatePhActivity(environment.pH);
    if (phFactor === 0) return 0;

    const tempFactor = this.#calculateTempActivity(environment.temperatureC);
    if (tempFactor === 0) return 0;

    const cofactorFactor = this.#calculateCofactorActivity(environment);

    return phFactor * tempFactor * cofactorFactor;
  }

  /**
   * Checks for thermal denaturation and updates the denatured state.
   * Above the threshold, denaturation is certain. Between optimal and threshold,
   * it is probabilistic with increasing likelihood.
   */
  checkThermalDenaturation(environment: Environment): void {
    if (environment.temperatureC >= this.denaturationThreshold) {
      this.isDenatured = true;
    } else if (environment.temperatureC > this.optimalTemp) {
      const stressFactor = (environment.temperatureC - this.optimalTemp)
        / (this.denaturationThreshold - this.optimalTemp);
      if (Math.random() < stressFactor * 0.1) {
        this.isDenatured = true;
      }
    }
  }

  /**
   * Bell-shaped pH activity curve centered at the optimal pH.
   */
  #calculatePhActivity(ph: number): number {
    const deviation = ph - this.optimalPh;
    const activity = Math.exp(-(deviation * deviation) / (2 * this.phTolerance * this.phTolerance));
    return activity < 0.01 ? 0 : activity;
  }

  /**
   * Temperature activity curve — zero below 5°C, zero above denaturation threshold,
   * with a linear ramp from 5°C to optimal and gradual decline to threshold.
   */
  #calculateTempActivity(temperatureC: number): number {
    if (temperatureC < 5) return 0;
    if (temperatureC >= this.denaturationThreshold) return 0;
    if (temperatureC <= this.optimalTemp) {
      return (temperatureC - 5) / (this.optimalTemp - 5);
    }
    return 1 - (temperatureC - this.optimalTemp) / (this.denaturationThreshold - this.optimalTemp);
  }

  /**
   * Co-factor activation scaling.
   * Each required co-factor must meet its minimum concentration.
   * Missing co-factors proportionally reduce activity.
   */
  #calculateCofactorActivity(environment: Environment): number {
    if (this.requiredCofactors.size === 0) return 1.0;

    let activity = 1.0;
    for (const [ion, minConcentration] of this.requiredCofactors) {
      const actualConcentration = environment.solutes.get(ion) ?? 0;
      if (actualConcentration < minConcentration) {
        activity *= Math.max(0.01, actualConcentration / minConcentration);
      }
    }
    return activity;
  }
}
