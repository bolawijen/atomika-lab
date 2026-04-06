import { StructuralFingerprint } from "@atomika-lab/core";

/**
 * Molecular recognition service that computes structural similarity
 * between enzyme active sites and substrate molecules.
 *
 * Acts as a "chemical instrument" — enzymes do not contain modeling engines;
 * they present their active site patterns to this service for affinity calculation.
 */
export class AffinityModeler {
  /**
   * Calculates the structural similarity between an enzyme's active site
   * and a substrate molecule using hash-based fingerprint comparison.
   *
   * @param activeSiteFp Pre-computed fingerprint of the enzyme active site.
   * @param substrateFp Pre-computed fingerprint of the substrate.
   * @returns Similarity score (0–1).
   */
  calculateSimilarity(activeSiteFp: StructuralFingerprint, substrateFp: StructuralFingerprint): number {
    return activeSiteFp.compatibilityWith(substrateFp);
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
