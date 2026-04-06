import { Monosaccharide, AnomericState } from "./Monosaccharide";
import { ELEMENTS } from "../../Element";
import { Atom } from "../../Atom";
import { Chirality } from "../Chirality";

/**
 * Fructose — a hexose monosaccharide with formula C₆H₁₂O₆.
 * A structural isomer of glucose, found in fruits and honey.
 * Natural fructose is the D-isomer.
 */
export class Fructose extends Monosaccharide {
  readonly chirality = Chirality.D;

  constructor(anomericState: AnomericState = AnomericState.ALPHA) {
    super(anomericState);
  }

  get atomicComposition(): ReadonlyMap<Atom, number> {
    return new Map([
      [ELEMENTS.C, 6],
      [ELEMENTS.H, 12],
      [ELEMENTS.O, 6],
    ]);
  }

  get count(): number {
    return 1;
  }

  toString(): string {
    return "Fructose";
  }
}
