/**
 * A simplified structural signature for molecular recognition.
 *
 * Encodes key features of a molecule's shape and chemical properties
 * into a numeric fingerprint. Used to compute the "fit" between
 * an enzyme's active site and a substrate molecule.
 */
export class StructuralFingerprint {
  /**
   * Numeric hash encoding molecular features:
   * - Monomer count
   * - Bond type
   * - Chirality
   * - Anomeric state (for saccharides)
   */
  private readonly hash: number;

  constructor(components: number[]) {
    // Simple polynomial rolling hash for feature vector
    let result = 0;
    for (let i = 0; i < components.length; i++) {
      result = result * 31 + components[i];
    }
    this.hash = result;
  }

  /**
   * Computes the structural compatibility score between this fingerprint
   * and another (e.g., enzyme active site vs. substrate).
   *
   * Returns a value between 0 (no fit) and 1 (perfect lock-and-key match).
   */
  compatibilityWith(other: StructuralFingerprint): number {
    const diff = Math.abs(this.hash - other.hash);
    // Exponential decay: small differences = high compatibility
    return Math.exp(-diff / 1000);
  }
}
