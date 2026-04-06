import { Monosaccharide, MolecularIdentity, AnomericState } from "./Monosaccharide";
import { Chirality } from "../../core/Chirality";

/**
 * Creates a D-Fructose monosaccharide.
 * Fructose is a structural isomer of glucose, found in fruits and honey.
 *
 * @param anomericState The anomeric configuration (α or β).
 * @returns A monosaccharide with D-Fructose identity.
 */
export function createFructose(anomericState: AnomericState = AnomericState.ALPHA): Monosaccharide {
  return new Monosaccharide(MolecularIdentity.FRUCTOSE, Chirality.D, anomericState);
}

/**
 * Legacy class for backward compatibility.
 * Prefer using createFructose() factory function.
 */
export class Fructose extends Monosaccharide {
  constructor(anomericState: AnomericState = AnomericState.ALPHA) {
    super(MolecularIdentity.FRUCTOSE, Chirality.D, anomericState);
  }
}
