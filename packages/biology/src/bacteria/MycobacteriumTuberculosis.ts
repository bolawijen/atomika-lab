import { BacterialCell } from "./BacterialCell";
import { Polymerase } from "../Polymerase";
import { Rifampicin } from "@atomika-lab/pharmacology";
import { Environment, type Duration } from "@atomika-lab/core";
import { MycolicAcidLayer } from "./BacterialStructures";

/**
 * Mycobacterium tuberculosis — the causative agent of tuberculosis.
 *
 * An acid-fast bacillus with a unique cell envelope containing mycolic acids.
 * Exhibits snapping division, cording behavior, and asymmetric cell division.
 */
export class MycobacteriumTuberculosis extends BacterialCell {
  /**
   * Mycolic acid layer — thick waxy coating unique to this species.
   */
  readonly mycolicAcidLayer: MycolicAcidLayer;

  /**
   * Minimum LogP required for a molecule to penetrate the cell wall.
   * Typical value: ~2.0 for Mycobacterium species.
   */
  readonly minLogPForPenetration = 2.0;

  /**
   * Cord factor surface density — virulence factor inhibiting phagocytosis.
   * Trehalose dimycolate on cell surface.
   */
  get cordFactorDensity(): number {
    return this.mycolicAcidLayer.cordFactorDensity;
  }

  /**
   * Whether cells form serpentine cords (trehalose dimycolate / cord factor).
   * A virulence factor that inhibits macrophage phagocytosis.
   */
  get isCording(): boolean {
    return this.cordFactorDensity > 0.3;
  }

  constructor(params: { mycolicAcidThickness?: number; cordFactorDensity?: number }) {
    super({
      generationTime: 86400 as Duration, // ~24 hours (much slower than typical bacteria)
    });
    this.mycolicAcidLayer = new MycolicAcidLayer({
      thickness: params.mycolicAcidThickness ?? 30,
      cordFactorDensity: params.cordFactorDensity ?? 0.5,
    });
  }

  /**
   * Snapping division — rigid mycolic acid wall prevents clean separation.
   *
   * Daughter cells remain attached at V-angle due to the thick, waxy
   * mycolic acid layer. Unlike symmetric binary fission in typical bacteria,
   * M. tuberculosis exhibits asymmetric division where daughter cells
   * may differ in size.
   *
   * Multi-dimensional growth plane — can grow in multiple orientations,
   * not just single axis.
   *
   * @param environment The environmental context for division.
   * @returns A new daughter cell, or null if conditions prevent division.
   */
  override divide(environment: Environment): MycobacteriumTuberculosis | null {
    // Check if parent is viable for division
    if (!this.isAlive) return null;

    // Check if generation time has elapsed (~24 hours for M. tuberculosis)
    if (this.elapsedDuration < this.generationTime) return null;

    // Environmental dependency — requires aerobic environment
    // M. tuberculosis is an obligate aerobe
    if (environment.thermalEnergy <= 0) return null;

    // Requires lipid-rich nutrients for mycolic acid synthesis
    // (simplified: check thermal energy as proxy for metabolic activity)
    if (environment.thermalEnergy < 0.1) return null;

    // Reset parent timer for next division cycle
    this.elapsedDuration = 0;

    // Produce daughter cell with inherited properties
    // Asymmetric division — daughter may differ in size
    const daughter = new MycobacteriumTuberculosis({
      mycolicAcidThickness: this.mycolicAcidLayer.thickness * (0.9 + Math.random() * 0.2), // ±10% variation
      cordFactorDensity: this.mycolicAcidLayer.cordFactorDensity,
    });

    // Inherit enzymes
    for (const enzyme of this.enzymes) {
      daughter.addEnzyme(enzyme);
    }

    return daughter;
  }
}
