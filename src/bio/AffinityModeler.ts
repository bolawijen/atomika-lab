import { RDKitEngine } from "./RDKitEngine";
import { StructuralFingerprint } from "../core/StructuralFingerprint";

/**
 * Molecular recognition service that computes structural similarity
 * between enzyme active sites and substrate molecules.
 *
 * Acts as a "chemical instrument" — enzymes do not contain modeling engines;
 * they present their active site patterns to this service for affinity calculation.
 */
export class AffinityModeler {
  private rdkit: RDKitEngine | null = null;
  private initializing = false;

  /**
   * Lazily initializes the RDKit chemical library.
   */
  async ensureInitialized(): Promise<void> {
    if (this.rdkit) return;
    if (this.initializing) return;

    this.initializing = true;
    try {
      this.rdkit = await RDKitEngine.getInstance();
    } catch {
      this.rdkit = null;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Computes the Morgan fingerprint for a molecule given its SMILES string.
   *
   * @param smiles SMILES representation of the molecule.
   * @param radius Fingerprint radius (default 2 for ECFP4-like).
   * @returns Morgan fingerprint as Uint8Array, or null if RDKit unavailable.
   */
  computeFingerprint(smiles: string, radius: number = 2): Uint8Array | null {
    if (!this.rdkit) return null;

    const mol = this.rdkit.createMolecule(smiles);
    if (!mol) return null;

    try {
      return this.rdkit.getMorganFingerprint(mol, radius);
    } finally {
      mol.delete();
    }
  }

  /**
   * Calculates the structural similarity between an enzyme's active site
   * and a substrate molecule using Tanimoto coefficient.
   *
   * @param activeSiteFp Pre-computed fingerprint of the enzyme active site.
   * @param substrateFp Pre-computed fingerprint of the substrate.
   * @returns Tanimoto similarity (0–1), or fallback hash-based score if fingerprints unavailable.
   */
  calculateSimilarity(activeSiteFp: StructuralFingerprint, substrateFp: StructuralFingerprint): number {
    if (!this.rdkit) {
      return activeSiteFp.compatibilityWith(substrateFp);
    }

    // The fingerprints already contain Morgan data if RDKit was available
    // during their creation. Use direct Tanimoto calculation.
    return activeSiteFp.compatibilityWith(substrateFp, this.rdkit);
  }

  /**
   * Calculates the effective Michaelis constant based on structural fit.
   *
   * Km = (baseKm / fit) × stericFactor
   *
   * @param baseKm Base Michaelis constant for perfect substrate match.
   * @param activeSiteFp Active site fingerprint.
   * @param substrateFp Substrate fingerprint.
   * @param branchCount Number of branch points (steric hindrance factor).
   * @param stericPenaltyPerBranch Penalty multiplier per branch point (default 0.2).
   * @returns Effective Km in molar units.
   */
  calculateEffectiveKm(
    baseKm: number,
    activeSiteFp: StructuralFingerprint,
    substrateFp: StructuralFingerprint,
    branchCount: number,
    stericPenaltyPerBranch: number = 0.2,
  ): number {
    const fit = this.calculateSimilarity(activeSiteFp, substrateFp);
    const stericFactor = 1 + branchCount * stericPenaltyPerBranch;
    return (baseKm / Math.max(fit, 0.01)) * stericFactor;
  }
}
