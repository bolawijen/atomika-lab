import { Environment } from "@atomika-lab/core";

/**
 * Record of a molecular absorption event.
 */
export interface AbsorptionRecord {
  /** Type of molecule absorbed. */
  readonly moleculeType: string;
  /** Amount absorbed (arbitrary units, 0–1). */
  readonly amount: number;
  /** Whether absorption occurred (gradient > 0 and membrane permeable). */
  readonly absorbed: boolean;
}

/**
 * A living cell — the basic structural and functional unit of life.
 *
 * Cells are autonomous entities that maintain homeostasis, respond to
 * environmental stimuli, and carry out metabolic processes. They are
 * bounded by a membrane and contain cytoplasm with genetic material.
 *
 * The cell autonomously absorbs molecules from its environment via
 * passive diffusion and metabolizes them to maintain viability.
 */
export abstract class Cell {
  /**
   * Viability fraction (0–1). 1.0 = fully viable, 0.0 = non-viable.
   */
  protected viabilityValue = 1.0;

  /**
   * The environment in which this cell lives.
   */
  protected environment: Environment;

  constructor(environment: Environment) {
    this.environment = environment;
    this.live();
  }

  /**
   * Current viability fraction.
   */
  get viability(): number {
    return this.viabilityValue;
  }

  /**
   * Whether the cell remains viable and functional.
   */
  get isAlive(): boolean {
    return this.viabilityValue > 0.1;
  }

  /**
   * Autonomous life cycle — maintains homeostasis through continuous
   * absorption and metabolism of environmental molecules.
   *
   * The cell does not "sense" or "decide" — molecules diffuse through
   * membranes based on physical properties (lipophilicity, size).
   * The cell responds to the consequences of absorption internally.
   */
  private live(): void {
    // Passive absorption driven by concentration gradient
    this.absorb();

    // Metabolize absorbed nutrients for energy
    this.metabolize();
  }

  /**
   * Absorbs available molecules from the environment via passive diffusion.
   *
   * Uses the stored environment internally — no parameters needed.
   * All molecules that can physically pass through the membrane enter
   * based on their lipophilicity and the concentration gradient.
   *
   * @returns Records for each molecule type that was absorbed.
   */
  abstract absorb(): AbsorptionRecord[];

  /**
   * Metabolizes absorbed nutrients to maintain viability.
   * Subclasses implement their specific metabolic pathways.
   */
  protected abstract metabolize(): void;
}
