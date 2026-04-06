import { Atom } from "./Atom";

/**
 * Boltzmann constant (J/K) — relates thermal energy to temperature.
 */
const BOLTZMANN_CONSTANT = 1.381e-23;

/**
 * Reaction conditions that influence enzyme activity.
 *
 * Temperature, pH, solute composition, pressure, and electromagnetic fields
 * collectively determine whether an enzyme can maintain its native conformation
 * and catalytic function. Reaction duration governs the extent of conversion.
 *
 * The Environment is the energy source that drives all molecular motion through
 * thermal energy (Brownian motion). Without it, molecules are inert.
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
   * Magnetic field strength in Tesla.
   * Affects plasma dynamics via the Lorentz force.
   */
  readonly magneticFieldTesla: number;

  /**
   * Electric field strength in volts per meter.
   * Drives charged particle motion in plasma.
   */
  readonly electricFieldVoltsPerMeter: number;

  /**
   * Dissolved ionic species present in the reaction medium.
   * Maps each element to its molar concentration (mM).
   * Many enzymes require specific co-factors (e.g., Ca²⁺, Cl⁻) for activity.
   */
  readonly solutes: ReadonlyMap<Atom, number>;

  constructor(params: {
    temperatureC: number;
    pH: number;
    durationInSeconds?: number;
    solutes?: ReadonlyMap<Atom, number>;
    pressureAtm?: number;
    magneticFieldTesla?: number;
    electricFieldVoltsPerMeter?: number;
  }) {
    this.temperatureC = params.temperatureC;
    this.pH = params.pH;
    this.durationInSeconds = params.durationInSeconds ?? 60;
    this.solutes = params.solutes ?? new Map();
    this.pressureAtm = params.pressureAtm ?? 1.0;
    this.magneticFieldTesla = params.magneticFieldTesla ?? 0;
    this.electricFieldVoltsPerMeter = params.electricFieldVoltsPerMeter ?? 0;
  }

  /**
   * Thermal energy available for molecular motion (Joules).
   *
   * E = (3/2)kT — the average kinetic energy of a particle
   * in thermal equilibrium at temperature T.
   *
   * This energy drives Brownian motion, diffusion, and molecular collisions.
   * At absolute zero, all molecular motion ceases.
   */
  get thermalEnergy(): number {
    const temperatureK = this.temperatureC + 273.15;
    return (3 / 2) * BOLTZMANN_CONSTANT * temperatureK;
  }
}

/**
 * Standard physiological conditions for human enzymes.
 * Body temperature 37°C, neutral pH 7.0, 60-second reaction,
 * with physiological ion concentrations (Ca²⁺ 2.5 mM, Cl⁻ 100 mM).
 */
export const PHYSIOLOGICAL_CONDITIONS = new Environment({
  temperatureC: 37,
  pH: 7.0,
  durationInSeconds: 60,
  solutes: new Map([
    [new Atom({ name: "Calcium", symbol: "Ca", protonCount: 20, mass: 40.078, charge: 2, valence: 2 }), 2.5],
    [new Atom({ name: "Chlorine", symbol: "Cl", protonCount: 17, mass: 35.45, charge: -1, valence: 1 }), 100],
  ]),
});
