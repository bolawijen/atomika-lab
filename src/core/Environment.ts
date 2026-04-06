import { Atom } from "../Atom";

/**
 * Reaction environment conditions that influence enzyme activity.
 * Temperature, pH, solute composition, and reaction duration collectively
 * determine whether an enzyme can maintain its native conformation
 * and catalytic function.
 *
 * Immutable — once constructed, conditions cannot change.
 * This ensures a consistent reaction context across all enzymes
 * in a multi-enzyme system.
 */
export class Environment {
  /** Temperature in degrees Celsius. */
  readonly temperatureC: number;

  /** pH level (0–14 scale). */
  readonly pH: number;

  /**
   * Reaction duration in seconds.
   * Governs the extent of hydrolysis through kinetic constraints.
   */
  readonly durationInSeconds: number;

  /**
   * Pressure in atmospheres (atm).
   * Affects phase transitions via the Clausius-Clapeyron relation.
   */
  readonly pressureAtm: number;

  /**
   * Dissolved ionic species present in the reaction medium.
   * Maps each element to its molar concentration (mM).
   * Many enzymes require specific co-factors (e.g., Ca²⁺, Cl⁻) for activity.
   */
  readonly solutes: ReadonlyMap<Atom, number>;

  constructor(
    temperatureC: number,
    pH: number,
    durationInSeconds: number = 60,
    solutes: ReadonlyMap<Atom, number> = new Map(),
    pressureAtm: number = 1.0,
  ) {
    this.temperatureC = temperatureC;
    this.pH = pH;
    this.durationInSeconds = durationInSeconds;
    this.solutes = solutes;
    this.pressureAtm = pressureAtm;
  }
}

/**
 * Standard physiological conditions for human enzymes.
 * Body temperature 37°C, neutral pH 7.0, 60-second reaction,
 * with physiological ion concentrations (Ca²⁺ 2.5 mM, Cl⁻ 100 mM).
 */
export const PHYSIOLOGICAL_CONDITIONS = new Environment(
  37,
  7.0,
  60,
  new Map([
    [new Atom({ name: "Calcium", symbol: "Ca", protonCount: 20, mass: 40.078, charge: 2, valence: 2 }), 2.5],
    [new Atom({ name: "Chlorine", symbol: "Cl", protonCount: 17, mass: 35.45, charge: -1, valence: 1 }), 100],
  ]),
);
