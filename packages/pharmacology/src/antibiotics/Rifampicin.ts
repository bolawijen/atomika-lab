import { BaseDrug } from "@atomika-lab/pharmacology";
import { Bacteria } from "@atomika-lab/biology";
import { ELEMENTS } from "@atomika-lab/core";
import { Atom } from "@atomika-lab/core";

/**
 * Rifampicin — a bactericidal antibiotic that inhibits bacterial
 * DNA-dependent RNA polymerase by blocking the exit channel for
 * the nascent RNA chain.
 *
 * Chemical formula: C₄₃H₅₈N₄O₁₂
 * Molecular weight: 822.94 Da
 */
export class Rifampicin extends BaseDrug {
  readonly targetAffinity = 0.5; // nM (high affinity for bacterial RNAP)
  readonly metabolismRate = 0.02; // min⁻¹ (hepatic clearance)
  readonly therapeuticClass = "antibiotic";

  get atomicComposition(): ReadonlyMap<Atom, number> {
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

  /**
   * Attacks the bacterial cell by inhibiting RNA polymerase.
   * Reduces bacterial viability proportional to drug concentration
   * and binding affinity.
   */
  attack(target: Bacteria): void {
    const enzymes = target.getEnzymes();
    let inhibitedCount = 0;

    for (const enzyme of enzymes) {
      // Simulate competitive inhibition of RNA polymerase
      if ("isDenatured" in enzyme && !enzyme.isDenatured) {
        // High-affinity binding effectively blocks the active site
        if (Math.random() < this.targetAffinity / (this.targetAffinity + 1)) {
          (enzyme as any).isDenatured = true;
          inhibitedCount++;
        }
      }
    }

    target.updateViability();
  }

  toString(): string {
    return "Rifampicin";
  }
}
