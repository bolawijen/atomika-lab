import { Monosaccharide } from "./Monosaccharide";
import { ELEMENTS } from "../../Element";
import { Atom } from "../../Atom";

/**
 * Glucose — a hexose monosaccharide with formula C₆H₁₂O₆.
 * The primary energy source for cellular respiration.
 */
export class Glucose extends Monosaccharide {
  /**
   * Atomic composition: C₆H₁₂O₆
   */
  get atomicComposition(): ReadonlyMap<Atom, number> {
    return new Map([
      [ELEMENTS.C, 6],
      [ELEMENTS.H, 12],
      [ELEMENTS.O, 6],
    ]);
  }

  /**
   * Number of monomer units — glucose is a monosaccharide.
   */
  get count(): number {
    return 1;
  }

  toString(): string {
    return "Glucose";
  }
}
