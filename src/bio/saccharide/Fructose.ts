import { Monosaccharide } from "./Monosaccharide";
import { ELEMENTS } from "../../Element";
import { Atom } from "../../Atom";

/**
 * Fructose — a hexose monosaccharide with formula C₆H₁₂O₆.
 * A structural isomer of glucose, found in fruits and honey.
 */
export class Fructose extends Monosaccharide {
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
