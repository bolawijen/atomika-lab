/**
 * Reaction environment conditions that influence enzyme activity.
 * Temperature and pH determine whether an enzyme can maintain its
 * native conformation and catalytic function.
 */
export class Environment {
  /** Temperature in degrees Celsius. */
  temperatureC: number;

  /** pH level (0–14 scale). */
  pH: number;

  constructor(temperatureC: number, pH: number) {
    this.temperatureC = temperatureC;
    this.pH = pH;
  }
}

/**
 * Standard physiological conditions for human enzymes.
 * Body temperature 37°C, neutral pH 7.0.
 */
export const PHYSIOLOGICAL_CONDITIONS = new Environment(37, 7.0);
