import { Environment } from "@atomika-lab/core";
import { Molecule } from "@atomika-lab/core";

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
 * Cells maintain homeostasis, respond to stimuli, grow, and reproduce.
 * They are bounded by a membrane and contain cytoplasm with genetic material.
 */
export abstract class Cell {
  /**
   * Viability fraction (0–1). 1.0 = fully viable, 0.0 = non-viable.
   */
  protected viabilityValue = 1.0;

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
   * Absorbs a molecule from the environment via passive diffusion.
   *
   * Driven by concentration gradient (environment → cytoplasm).
   * Depends on molecule lipophilicity (logP) and membrane permeability.
   *
   * @param molecule The molecule to absorb.
   * @param environment The environmental context.
   * @returns Record of the absorption event.
   */
  abstract absorb(molecule: Molecule, environment: Environment): AbsorptionRecord;
}
