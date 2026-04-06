import { Molecule } from "@atomika-lab/core";

/**
 * Medicinal chemical entity designed to interact with a biological target.
 *
 * Characterized by binding affinity to the target receptor, metabolic
 * clearance rate, and therapeutic classification.
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
