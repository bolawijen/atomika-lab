import { Monosaccharide, MolecularIdentity, AnomericState } from "./Monosaccharide";
import { Chirality } from "@atomika-lab/core";

/**
 * Creates a D-Galactose monosaccharide.
 * Galactose is an epimer of glucose, component of lactose.
 *
 * @param anomericState The anomeric configuration (α or β).
 * @returns A monosaccharide with D-Galactose identity.
 */
export function createGalactose(anomericState: AnomericState = AnomericState.ALPHA): Monosaccharide {
  return new Monosaccharide(MolecularIdentity.GALACTOSE, Chirality.D, anomericState);
}

/**
 * Legacy class for backward compatibility.
 * Prefer using createGalactose() factory function.
 */
export class Galactose extends Monosaccharide {
  constructor(anomericState: AnomericState = AnomericState.ALPHA) {
    super(MolecularIdentity.GALACTOSE, Chirality.D, anomericState);
  }
}
