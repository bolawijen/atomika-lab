/**
 * Chirality of a biomolecule — the spatial arrangement of atoms
 * that cannot be superimposed on its mirror image.
 *
 * Biological systems are homochiral: proteins use L-amino acids
 * and polysaccharides use D-saccharides.
 *
 * Numeric codes are used for structural fingerprinting to avoid
 * fragile string-to-int conversions.
 */
export enum Chirality {
  /** Left-handed configuration — found in natural amino acids. */
  L = -1,
  /** Right-handed configuration — found in natural saccharides. */
  D = 1,
}
