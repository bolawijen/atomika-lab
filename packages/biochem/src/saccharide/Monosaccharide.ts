import { Saccharide } from "./Saccharide";
import { Chirality } from "../../core/Chirality";
import { ELEMENTS } from "../../Element";
import { Atom } from "../../Atom";

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
 * Molecular identity of a monosaccharide.
 * Each identity corresponds to a specific stereochemical arrangement
 * of hydroxyl groups on the carbon backbone.
 */
export enum MolecularIdentity {
  GLUCOSE = "D-Glucose",
  FRUCTOSE = "D-Fructose",
  GALACTOSE = "D-Galactose",
}

/**
 * A monosaccharide (simple sugar) — the fundamental unit of carbohydrates.
 *
 * Defined by its molecular identity (glucose, fructose, galactose),
 * chirality (D/L), and anomeric state (α/β). All hexoses share the
 * formula C₆H₁₂O₆ but differ in stereochemical arrangement.
 */
export class Monosaccharide extends Saccharide {
  /**
   * The specific molecular identity of this saccharide.
   */
  readonly identity: MolecularIdentity;

  /**
   * The chirality of this saccharide. Natural sugars are D-isomers.
   */
  readonly chirality: Chirality;

  /**
   * The anomeric state of the anomeric carbon.
   * In solution, monosaccharides undergo mutarotation — spontaneous
   * interconversion between alpha and beta forms.
   */
  anomericState: AnomericState;

  constructor(
    identity: MolecularIdentity,
    chirality: Chirality = Chirality.D,
    anomericState: AnomericState = AnomericState.ALPHA,
  ) {
    super();
    this.identity = identity;
    this.chirality = chirality;
    this.anomericState = anomericState;
  }

  /**
   * Number of monomer units — a monosaccharide is a single unit.
   */
  get count(): number {
    return 1;
  }

  /**
   * Atomic composition: C₆H₁₂O₆ for all hexoses.
   * Isomers share the same formula but differ in stereochemistry.
   */
  get atomicComposition(): ReadonlyMap<Atom, number> {
    return new Map([
      [ELEMENTS.C, 6],
      [ELEMENTS.H, 12],
      [ELEMENTS.O, 6],
    ]);
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

  toString(): string {
    return this.identity;
  }
}
