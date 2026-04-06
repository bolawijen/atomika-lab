import { BaseDrug } from "@atomika-lab/pharmacology";
import { Bacteria } from "@atomika-lab/biology";
import { ELEMENTS, Atom } from "@atomika-lab/core";
import { Enzyme } from "@atomika-lab/biochem";

/**
 * Enzyme that can undergo irreversible structural unfolding.
 */
interface DenaturableEnzyme extends Enzyme {
  isDenatured: boolean;
}

/**
 * Type guard for enzymes that support denaturation.
 */
function isDenaturable(enzyme: Enzyme): enzyme is DenaturableEnzyme {
  return "isDenatured" in enzyme;
}

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

    for (const enzyme of enzymes) {
      if (isDenaturable(enzyme) && !enzyme.isDenatured) {
        // High-affinity binding effectively blocks the active site
        if (Math.random() < this.targetAffinity / (this.targetAffinity + 1)) {
          enzyme.isDenatured = true;
        }
      }
    }

    target.updateViability();
  }

  toString(): string {
    return "Rifampicin";
  }
}
