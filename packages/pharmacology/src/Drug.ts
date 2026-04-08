import { Molecule, Atom } from "@atomika-lab/core";

/**
 * Pharmacological classification of medicinal substances.
 */
export enum TherapeuticCategory {
  Antibiotic = "antibiotic",
  Antiviral = "antiviral",
  Antifungal = "antifungal",
  Analgesic = "analgesic",
  Antihypertensive = "antihypertensive",
  Antineoplastic = "antineoplastic",
}

/**
 * Medicinal substance with defined pharmacological properties.
 * Base class for all therapeutic agents — provides common ADME behavior.
 */
export abstract class Drug extends Molecule {
  /** Dissociation constant Kd (nM) for the drug-target complex. */
  readonly dissociationConstant: number;

  /** First-order metabolic clearance rate (min⁻¹). */
  readonly clearanceRate: number;

  /** Pharmacological classification. */
  readonly pharmacologicalClass: TherapeuticCategory;

  /**
   * Octanol-water partition coefficient — measures lipophilicity.
   */
  abstract override get logP(): number;

  constructor(params: {
    dissociationConstant: number;
    clearanceRate: number;
    pharmacologicalClass: TherapeuticCategory;
  }) {
    super();
    this.dissociationConstant = params.dissociationConstant;
    this.clearanceRate = params.clearanceRate;
    this.pharmacologicalClass = params.pharmacologicalClass;
  }
}
