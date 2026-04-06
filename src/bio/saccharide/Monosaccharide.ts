import { Saccharide } from "./Saccharide";
import { Chirality } from "../../core/Chirality";

/**
 * Anomeric configuration — the stereochemistry at C1 of a cyclic saccharide.
 * Determines the orientation of the hydroxyl group and the type of glycosidic bond formed.
 */
export enum AnomericState {
  /** Hydroxyl at C1 below the ring plane — forms α-glycosidic bonds. */
  ALPHA = "α",
  /** Hydroxyl at C1 above the ring plane — forms β-glycosidic bonds. */
  BETA = "β",
}

/**
 * A monosaccharide (simple sugar).
 * Base type for molecules like Glucose, Fructose, and Galactose.
 */
export abstract class Monosaccharide extends Saccharide {
  /**
   * The chirality of this saccharide. Natural sugars are D-isomers.
   */
  abstract readonly chirality: Chirality;

  /**
   * The anomeric state of the anomeric carbon.
   * In solution, monosaccharides undergo mutarotation — spontaneous
   * interconversion between alpha and beta forms.
   */
  anomericState: AnomericState;

  constructor(anomericState: AnomericState = AnomericState.ALPHA) {
    super();
    this.anomericState = anomericState;
  }

  /**
   * Performs mutarotation — spontaneous interconversion between
   * alpha and beta anomeric forms in aqueous solution.
   */
  mutarotate(): void {
    this.anomericState = this.anomericState === AnomericState.ALPHA
      ? AnomericState.BETA
      : AnomericState.ALPHA;
  }
}
