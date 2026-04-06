import { Atom } from "./Atom";

/**
 * Standard chemical elements used in biochemical modeling.
 * Predefined reference atoms for common elements in organic chemistry.
 */
export const ELEMENTS = {
  /** Carbon — backbone of organic molecules */
  C: new Atom({ name: "Carbon", symbol: "C", protonCount: 6, mass: 12.011, valence: 4 }),
  /** Hydrogen — most abundant element in organic compounds */
  H: new Atom({ name: "Hydrogen", symbol: "H", protonCount: 1, mass: 1.008, valence: 1 }),
  /** Oxygen — present in most functional groups */
  O: new Atom({ name: "Oxygen", symbol: "O", protonCount: 8, mass: 15.999, valence: 2 }),
  /** Nitrogen — key component of amino acids and nucleic acids */
  N: new Atom({ name: "Nitrogen", symbol: "N", protonCount: 7, mass: 14.007, valence: 3 }),
  /** Phosphorus — present in nucleotides and phosphorylated proteins */
  P: new Atom({ name: "Phosphorus", symbol: "P", protonCount: 15, mass: 30.974, valence: 5 }),
  /** Sulfur — present in cysteine and methionine */
  S: new Atom({ name: "Sulfur", symbol: "S", protonCount: 16, mass: 32.06, valence: 2 }),
} as const;
