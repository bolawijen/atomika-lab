import { Monosaccharide, MolecularIdentity, AnomericState } from "./Monosaccharide";
import { Chirality } from "../../core/Chirality";

/**
 * Creates a D-Glucose monosaccharide.
 * Glucose is the primary energy source for cellular respiration.
 *
 * @param anomericState The anomeric configuration (α or β).
 * @returns A monosaccharide with D-Glucose identity.
 */
export function createGlucose(anomericState: AnomericState = AnomericState.ALPHA): Monosaccharide {
  return new Monosaccharide(MolecularIdentity.GLUCOSE, Chirality.D, anomericState);
}

/**
 * Legacy class for backward compatibility.
 * Prefer using createGlucose() factory function.
 */
export class Glucose extends Monosaccharide {
  constructor(anomericState: AnomericState = AnomericState.ALPHA) {
    super(MolecularIdentity.GLUCOSE, Chirality.D, anomericState);
  }
}
