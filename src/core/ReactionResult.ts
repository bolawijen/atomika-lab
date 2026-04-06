import { Saccharide } from "../saccharide/Saccharide";
import { ReactionMixture } from "./ReactionMixture";

/**
 * A kinetic snapshot taken at one time step during the reaction.
 * Records substrate and product concentrations for plotting kinetics curves.
 */
export interface KineticSnapshot {
  /** Time elapsed since reaction start (seconds). */
  timeInSeconds: number;
  /** Total cleavable bonds remaining across all substrate molecules. */
  remainingBonds: number;
  /** Number of distinct product molecules accumulated. */
  productCount: number;
  /** Current temperature of the reaction mixture (°C). */
  temperatureC?: number;
}

/**
 * The outcome of an enzymatic hydrolysis reaction.
 * Contains the final product mixture, kinetic metadata, and
 * the chronological reaction path showing concentration changes over time.
 */
export class ReactionResult {
  /** All molecular species present after the reaction. */
  readonly products: ReactionMixture;

  /** Percentage of glycosidic bonds cleaved during the reaction. */
  readonly conversionRate: number;

  /** Mass of substrate remaining unhydrolyzed (Da). */
  readonly remainingSubstrateMass: number;

  /** Whether the enzyme retained catalytic activity at reaction end. */
  readonly isEnzymeStillActive: boolean;

  /**
   * The chronological reaction path — a time-resolved sequence of
   * concentration and temperature states throughout the reaction.
   */
  readonly reactionPath: ReadonlyArray<KineticSnapshot>;

  constructor(
    products: ReactionMixture,
    conversionRate: number,
    remainingSubstrateMass: number,
    isEnzymeStillActive: boolean,
    reactionPath: ReadonlyArray<KineticSnapshot> = [],
  ) {
    this.products = products;
    this.conversionRate = conversionRate;
    this.remainingSubstrateMass = remainingSubstrateMass;
    this.isEnzymeStillActive = isEnzymeStillActive;
    this.reactionPath = reactionPath;
  }
}
