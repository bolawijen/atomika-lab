import { RDKitEngine } from "./RDKitEngine";

/**
 * A simplified structural signature for molecular recognition.
 *
 * Encodes key features of a molecule's shape and chemical properties
 * into a numeric fingerprint. Used to compute the "fit" between
 * an enzyme's active site and a substrate molecule.
 *
 * When RDKit is available, uses Morgan fingerprints (ECFP-like) for
 * chemically accurate similarity calculation. Falls back to a simple
 * polynomial hash otherwise.
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
      result = result * 31 + components[i];
    }
    this.hash = result;
    this.morganFp = morganFp || null;
  }

  /**
   * Computes the structural compatibility score between this fingerprint
   * and another (e.g., enzyme active site vs. substrate).
   *
   * Returns a value between 0 (no fit) and 1 (perfect lock-and-key match).
   * Uses Tanimoto similarity when Morgan fingerprints are available
   * and an RDKit engine is provided.
   *
   * @param other The fingerprint to compare against.
   * @param rdkit Optional RDKit engine for Tanimoto similarity calculation.
   */
  compatibilityWith(other: StructuralFingerprint, rdkit?: RDKitEngine): number {
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
