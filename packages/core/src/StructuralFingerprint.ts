/**
 * A simplified structural signature for molecular recognition.
 *
 * Encodes key features of a molecule's shape and chemical properties
 * into a numeric fingerprint. Used to compute the "fit" between
 * an enzyme's active site and a substrate molecule.
 *
 * When an RDKit-compatible engine is provided, uses Morgan fingerprints
 * (ECFP-like) for chemically accurate similarity calculation. Falls back
 * to a simple polynomial hash otherwise.
 */
export class StructuralFingerprint {
  /** Simple hash for fallback mode. */
  private readonly hash: number;
  /** RDKit Morgan fingerprint (if available). */
  private readonly morganFp: Uint8Array | null;

  constructor(components: number[], morganFp?: Uint8Array) {
    // Simple polynomial rolling hash for feature vector
    let result = 0;
    for (let i = 0; i < components.length; i++) {
      result = result * 31 + components[i]!;
    }
    this.hash = result;
    this.morganFp = morganFp || null;
  }

  /**
   * Degree of structural similarity between two molecular fingerprints.
   *
   * A score of 1 indicates identical structural features; 0 indicates
   * no shared features. Based on exponential decay of hash distance.
   *
   * @param other The fingerprint to compare against.
   * @param rdkit Optional RDKit engine for Tanimoto similarity calculation.
   * Similarity score reflecting molecular fit (0–1).
   */
  compatibilityWith(other: StructuralFingerprint, rdkit?: { tanimotoSimilarity(a: Uint8Array, b: Uint8Array): number }): number {
    // Use RDKit Morgan fingerprint Tanimoto similarity if available
    if (this.morganFp && other.morganFp && rdkit) {
      try {
        return rdkit.tanimotoSimilarity(this.morganFp, other.morganFp);
      } catch {
        // Fall back to hash-based if RDKit fails
      }
    }
    return this.fallbackCompatibility(other);
  }

  /**
   * Synchronous fallback compatibility using simple hash distance.
   */
  private fallbackCompatibility(other: StructuralFingerprint): number {
    const diff = Math.abs(this.hash - other.hash);
    return Math.exp(-diff / 1000);
  }
}
