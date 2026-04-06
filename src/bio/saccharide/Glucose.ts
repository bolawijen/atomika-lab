import { Monosaccharide, AnomericState } from "./Monosaccharide";
import { ELEMENTS } from "../../Element";
import { Atom } from "../../Atom";
import { Chirality } from "../../core/Chirality";

/**
 * Glucose — a hexose monosaccharide with formula C₆H₁₂O₆.
 * The primary energy source for cellular respiration.
 * Natural glucose is the D-isomer.
 */
export class Glucose extends Monosaccharide {
  readonly chirality = Chirality.D;

  constructor(anomericState: AnomericState = AnomericState.ALPHA) {
    super(anomericState);
  }

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
