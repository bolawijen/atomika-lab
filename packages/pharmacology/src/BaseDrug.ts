import { Molecule } from "@atomika-lab/core";

/**
 * Base class for therapeutic agents and drug compounds.
 *
 * Defines the fundamental properties required for pharmacological
 * simulation: target binding affinity and metabolic clearance rate.
 */
export abstract class BaseDrug extends Molecule {
  /**
   * Dissociation constant (Kd) for the drug-target complex (nM).
   * Lower values indicate stronger binding affinity.
   */
  abstract readonly targetAffinity: number;

  /**
   * First-order metabolic clearance rate constant (min⁻¹).
   * Determines how rapidly the drug is eliminated from the system.
   */
  abstract readonly metabolismRate: number;

  /**
   * Therapeutic class identifier (e.g., "antibiotic", "antiviral").
   */
  abstract readonly therapeuticClass: string;
}
