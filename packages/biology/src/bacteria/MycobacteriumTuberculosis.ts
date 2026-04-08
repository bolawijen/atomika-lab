import { BacterialCell } from "./BacterialCell";
import { Polymerase } from "../Polymerase";
import { Rifampicin } from "@atomika-lab/pharmacology";
import { Environment, type Duration } from "@atomika-lab/core";
import { MycolicAcidLayer } from "./BacterialStructures";
import type { NutrientUptake } from "./BacterialStructures";
import { FattyAcid, Cholesterol, NutrientCategory, type Nutrient } from "@atomika-lab/biochem";

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

  /**
   * Whether the cell has entered non-replicating persistence.
   * Occurs when nutrients are depleted during latent infection.
   */
  get isPersistent(): boolean {
    return !this.energyReserves.isSufficient && this.isAlive;
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

  /**
   * Absorbs nutrient from the environment via passive diffusion through
   * the mycolic acid layer and cell membrane.
   *
   * M. tuberculosis is a lipid-dependent pathogen — lipids dissolve through
   * the mycolic acid wall naturally (like dissolves like). Non-lipid nutrients
   * have reduced permeability due to the hydrophobic barrier.
   *
   * Uptake is driven by concentration gradient — no energy cost.
   *
   * @param nutrient The nutrient molecule to absorb.
   * @param environment The environmental context.
   * @returns Record of the nutrient uptake event.
   */
  override uptakeNutrient(nutrient: Nutrient, environment: Environment): NutrientUptake {
    // Passive diffusion — requires concentration gradient
    const gradient = environment.nutrientConcentration - this.cytoplasm.nutrientConcentration;
    if (gradient <= 0) return { nutrientType: nutrient.category, amount: 0 };

    // Mycolic acid layer acts as lipophilicity filter
    // Lipids perme easily; non-lipids face reduced permeability
    const mycolicPermeability = this.mycolicAcidLayer.canPermeate(nutrient.molecule) ? 1.0 : 0.2;
    const membranePermeability = this.cellMembrane.functionalIntegrity;
    const totalPermeability = mycolicPermeability * membranePermeability;

    const amount = Math.min(gradient * totalPermeability * 0.1, 1.0);

    // Add nutrient to cytoplasm
    this.cytoplasm.addNutrient(amount);

    // Replenish energy reserves from absorbed nutrients
    this.energyReserves.replenish(amount);

    // Long-term penalty: suboptimal nutrition (non-lipid) causes gradual viability decline
    if (mycolicPermeability < 1.0) {
      this.viability = Math.max(0, this.viability - 0.001);
    }

    const uptake: NutrientUptake = { nutrientType: nutrient.category, amount };
    this.uptakeHistory.push(uptake);

    return uptake;
  }

  /**
   * Metabolizes lipids to produce thermal energy and mycolic acid precursors.
   *
   * Beta-oxidation of fatty acids produces acetyl-CoA, which enters
   * the TCA cycle for ATP production. Cholesterol catabolism provides
   * carbon skeletons for mycolic acid synthesis.
   *
   * @returns Metabolic energy produced in attomoles.
   */
  metabolizeLipids(): number {
    if (!this.isAlive) return 0;

    // Slower lipid metabolism — adapted for persistence
    const atp = this.energyReserves.produceATP() * 0.1;

    // Starvation response — slower viability decline
    if (atp === 0 && !this.energyReserves.isSufficient) {
      this.viability = Math.max(0, this.viability - 0.01);
    }

    return atp;
  }

  /**
   * Catabolic metabolism — slower ATP production due to low metabolic rate.
   *
   * M. tuberculosis has a reduced metabolic rate compared to typical bacteria,
   * reflecting its adaptation to slow growth and persistence.
   *
   * @returns Metabolic energy produced in attomoles.
   */
  override metabolize(): number {
    return this.metabolizeLipids();
  }
}
