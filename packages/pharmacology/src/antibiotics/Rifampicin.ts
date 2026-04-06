import { BaseDrug } from "@atomika-lab/pharmacology";
import { Bacteria, Polymerase } from "@atomika-lab/biology";
import { ELEMENTS, Atom } from "@atomika-lab/core";
import { Enzyme } from "@atomika-lab/biochem";

/**
 * Enzyme with an active site that can bind ligands.
 */
interface LigandBindableEnzyme extends Enzyme {
  bindLigand(ligand: object, affinity: number): void;
}

/**
 * Type guard for enzymes that support active site ligand binding.
 */
function isLigandBindable(enzyme: Enzyme): enzyme is LigandBindableEnzyme {
  return "bindLigand" in enzyme;
}

/**
 * Rifampicin — a bactericidal antibiotic that inhibits bacterial
 * DNA-dependent RNA polymerase by blocking the exit channel for
 * the nascent RNA chain.
 *
 * Chemical formula: C₄₃H₅₈N₄O₁₂
 * Molecular weight: 822.94 Da
 *
 * Mechanism: Reversible binding to the RNA polymerase active site,
 * sterically blocking the RNA exit channel. The enzyme remains
 * structurally intact but catalytically inhibited.
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
   * Exerts antibacterial effect by inhibiting bacterial RNA polymerase.
   * Reduces bacterial viability through competitive inhibition of transcription.
   */
  inhibit(target: Bacteria): void {
    const enzymes = target.getEnzymes();

    for (const enzyme of enzymes) {
      if (isLigandBindable(enzyme)) {
        // Reversible active site binding — enzyme remains structurally intact
        enzyme.bindLigand(this, this.targetAffinity);
      }
    }

    target.updateViability();
  }

  toString(): string {
    return "Rifampicin";
  }
}
