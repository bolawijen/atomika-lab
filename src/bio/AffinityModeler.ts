import { Polysaccharide } from "./saccharide/Polysaccharide";
import { StructuralFingerprint } from "../core/StructuralFingerprint";
import { GlycosidicBondType } from "./saccharide/GlycosidicBondType";
import { Chirality } from "../core/Chirality";

/**
 * Calculates the effective Michaelis constant (Km) based on the structural
 * "lock-and-key" fit between an enzyme's active site and a substrate molecule.
 *
 * When the substrate perfectly matches the enzyme's specificity, Km equals
 * the base value. Poorer fits increase Km (lower affinity). Branch points
 * further increase Km due to steric hindrance.
 */
export class AffinityModeler {
  /** Structural fingerprint of the enzyme's active site. */
  private readonly activeSiteFingerprint: StructuralFingerprint;
  /** Base Michaelis constant — the Km when substrate perfectly matches. */
  private readonly baseKm: number;
  /** Steric penalty per branch point — each increases Km by this fraction. */
  private readonly stericPenaltyPerBranch: number;

  constructor(
    activeSiteFingerprint: StructuralFingerprint,
    baseKm: number,
    stericPenaltyPerBranch: number = 0.2,
  ) {
    this.activeSiteFingerprint = activeSiteFingerprint;
    this.baseKm = baseKm;
    this.stericPenaltyPerBranch = stericPenaltyPerBranch;
  }

  /**
   * Calculates the effective Km for a given substrate.
   *
   * Km = (baseKm / fit) × (1 + branchCount × stericPenalty)
   *
   * @param substrate The polysaccharide substrate to evaluate.
   * @returns The effective Michaelis constant in molar units.
   */
  calculateEffectiveKm(substrate: Polysaccharide): number {
    const fit = this.#calculateFit(substrate);
    const stericFactor = 1 + substrate.branchCount * this.stericPenaltyPerBranch;
    return (this.baseKm / Math.max(fit, 0.01)) * stericFactor;
  }

  /**
   * Computes the structural compatibility between the active site
   * and the substrate using the enzyme's fingerprint.
   */
  #calculateFit(substrate: Polysaccharide): number {
    const substrateFingerprint = new StructuralFingerprint([
      substrate.bondType,
      Chirality.D,
      Math.min(substrate.count, 10),
    ]);

    return this.activeSiteFingerprint.compatibilityWith(substrateFingerprint);
  }
}
