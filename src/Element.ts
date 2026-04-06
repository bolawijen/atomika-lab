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
  /** Calcium — co-factor for α-amylase, signaling ion */
  Ca: new Atom({ name: "Calcium", symbol: "Ca", protonCount: 20, mass: 40.078, charge: 2, valence: 2, oxidationStates: [2], coordinationNumbers: [6, 7, 8] }),
  /** Chlorine — chloride ion activates α-amylase */
  Cl: new Atom({ name: "Chlorine", symbol: "Cl", protonCount: 17, mass: 35.45, charge: -1, valence: 1, oxidationStates: [-1, 1, 3, 5, 7], coordinationNumbers: [1] }),
  /** Iron — redox-active metal (Fe²⁺/Fe³⁺) */
  Fe: new Atom({ name: "Iron", symbol: "Fe", protonCount: 26, mass: 55.845, valence: 2, oxidationStates: [2, 3], coordinationNumbers: [4, 6] }),
  /** Copper — redox-active metal (Cu⁺/Cu²⁺) */
  Cu: new Atom({ name: "Copper", symbol: "Cu", protonCount: 29, mass: 63.546, valence: 2, oxidationStates: [1, 2], coordinationNumbers: [4, 6] }),
  /** Zinc — common enzyme co-factor */
  Zn: new Atom({ name: "Zinc", symbol: "Zn", protonCount: 30, mass: 65.38, valence: 2, oxidationStates: [2], coordinationNumbers: [4, 5, 6] }),
} as const;
