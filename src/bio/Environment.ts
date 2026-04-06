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

  /**
   * Reaction duration in seconds.
   * Governs the extent of hydrolysis through kinetic constraints.
   */
  durationInSeconds: number;

  constructor(temperatureC: number, pH: number, durationInSeconds: number = 60) {
    this.temperatureC = temperatureC;
    this.pH = pH;
    this.durationInSeconds = durationInSeconds;
  }
}

/**
 * Standard physiological conditions for human enzymes.
 * Body temperature 37°C, neutral pH 7.0, 60-second reaction.
 */
export const PHYSIOLOGICAL_CONDITIONS = new Environment(37, 7.0, 60);
