import { Saccharide } from "../saccharide/Saccharide";
import { ReactionMixture } from "./ReactionMixture";

/**
 * The outcome of an enzymatic hydrolysis reaction.
 * Contains both the product mixture and kinetic metadata.
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

  constructor(
    products: ReactionMixture,
    conversionRate: number,
    remainingSubstrateMass: number,
    isEnzymeStillActive: boolean,
  ) {
    this.products = products;
    this.conversionRate = conversionRate;
    this.remainingSubstrateMass = remainingSubstrateMass;
    this.isEnzymeStillActive = isEnzymeStillActive;
  }
}
