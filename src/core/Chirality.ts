/**
 * Chirality of a biomolecule — the spatial arrangement of atoms
 * that cannot be superimposed on its mirror image.
 *
 * Biological systems are homochiral: proteins use L-amino acids
 * and polysaccharides use D-saccharides.
 */
export enum Chirality {
  /** Left-handed configuration — found in natural amino acids. */
  L = "L",
  /** Right-handed configuration — found in natural saccharides. */
  D = "D",
}
