import { Drug, TherapeuticCategory } from "@atomika-lab/pharmacology";
import { ELEMENTS, Atom } from "@atomika-lab/core";

/**
 * Rifampicin — a bactericidal antibiotic.
 *
 * Chemical formula: C₄₃H₅₈N₄O₁₂
 * Molecular weight: 822.94 Da
 *
 * Mechanism: Reversible binding to bacterial RNA polymerase active site,
 * sterically blocking the RNA exit channel. The enzyme remains structurally
 * intact but catalytically inhibited.
 *
 * Pharmacological data:
 * - Dissociation constant (Kd): 0.5 nM (high affinity)
 * - Clearance rate: 0.02 min⁻¹ (hepatic)
 * - LogP: 3.7 (lipophilic, crosses membranes easily)
 */
export class Rifampicin extends Drug {
  /** Octanol-water partition coefficient — measures lipophilicity. */
  override readonly logP = 3.7;

  constructor() {
    super({
      dissociationConstant: 0.5,
      clearanceRate: 0.02,
      pharmacologicalClass: TherapeuticCategory.Antibiotic,
    });
  }

  override get atomicComposition(): ReadonlyMap<Atom, number> {
    return new Map([
      [ELEMENTS.C, 43],
      [ELEMENTS.H, 58],
      [ELEMENTS.N, 4],
      [ELEMENTS.O, 12],
    ]);
  }

  get count(): number {
    return 1;
  }

  override toString(): string {
    return "Rifampicin";
  }
}
