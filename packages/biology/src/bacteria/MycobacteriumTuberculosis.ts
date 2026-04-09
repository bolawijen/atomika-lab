import { BacterialCell } from "./BacterialCell";
import { Polymerase } from "../Polymerase";
import { ProteinChain } from "@atomika-lab/biochem";
import { Rifampicin } from "@atomika-lab/pharmacology";
import { Environment, type Duration } from "@atomika-lab/core";
import { MycolicAcidLayer } from "./BacterialStructures";
import { Cell, type AbsorptionRecord } from "../Cell";
import {
  concentrationGradient,
  diffusionRate,
  mycolicAcidLipidPermeability,
  porinPermeability,
} from "./DiffusionPhysics";

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
   * RNA Polymerase — core transcriptional machinery.
   *
   * Essential for DNA → mRNA transcription. Permanent resident of the cell,
   * not a transient enzyme. Primary target of Rifampicin antibiotic.
   */
  readonly rnaPolymerase: Polymerase;

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

  constructor(environment: Environment, params: { mycolicAcidThickness?: number; cordFactorDensity?: number }) {
    super(environment, {
      generationTime: 86400 as Duration, // ~24 hours (much slower than typical bacteria)
    });
    this.mycolicAcidLayer = new MycolicAcidLayer({
      thickness: params.mycolicAcidThickness ?? 30,
      cordFactorDensity: params.cordFactorDensity ?? 0.5,
    });
    this.rnaPolymerase = new Polymerase(new ProteinChain());
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
    const daughter = new MycobacteriumTuberculosis(this.environment, {
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
   * Absorbs molecules from the environment via passive diffusion through
   * the mycolic acid layer and cell membrane.
   *
   * Uses the stored environment internally — no parameters needed.
   * Lipids dissolve through the mycolic acid wall naturally (like dissolves like).
   * Non-lipid nutrients must pass through porin channels by size exclusion.
   *
   * Uptake is driven by concentration gradient — no energy cost.
   *
   * @returns Records for each molecule type that was absorbed.
   */
  override absorb(): AbsorptionRecord[] {
    if (!this.cellMembrane.isIntact) return this.tbNoAbsorptionRecords();

    const gradient = this.tbConcentrationGradient();
    const membraneIntegrity = this.cellMembrane.functionalIntegrity;

    const lipidAmount = this.tbDiffusionRate(gradient, this.tbLipidPermeability(), membraneIntegrity);
    const nonLipidAmount = this.tbDiffusionRate(gradient, this.tbNonLipidPermeability(), membraneIntegrity);

    this.cytoplasm.addNutrient(lipidAmount + nonLipidAmount);
    this.energyReserves.replenish(lipidAmount);

    if (this.tbNonLipidDominant(lipidAmount, nonLipidAmount)) {
      this.viabilityValue = Math.max(0, this.viabilityValue - 0.001);
    }

    return [
      this.tbAbsorptionRecord("lipids", lipidAmount),
      this.tbAbsorptionRecord("non-lipids", nonLipidAmount),
    ];
  }

  /**
   * Concentration gradient driving diffusion from environment into cytoplasm.
   */
  private tbConcentrationGradient(): number {
    return concentrationGradient(
      this.environment.nutrientConcentration,
      this.cytoplasm.nutrientConcentration,
    );
  }

  /**
   * Permeability of lipids through the mycolic acid layer.
   *
   * Lipids dissolve readily in the waxy mycolic acid barrier.
   */
  private tbLipidPermeability(): number {
    return mycolicAcidLipidPermeability(this.mycolicAcidLayer.hydrophobicity);
  }

  /**
   * Permeability of non-lipid molecules through porin channels.
   *
   * Non-lipids cannot dissolve in the mycolic acid layer and must
   * pass through protein pores by size exclusion.
   */
  private tbNonLipidPermeability(): number {
    const porin = this.cellMembrane.porins.find(p => p.poreSize >= 12);
    return porin ? porinPermeability(porin.poreSize) : 0;
  }

  /**
   * Calculates diffusion rate for a given permeability and membrane integrity.
   */
  private tbDiffusionRate(gradient: number, permeability: number, membraneIntegrity: number): number {
    return diffusionRate(gradient, permeability * membraneIntegrity);
  }

  /**
   * Whether non-lipid absorption exceeds lipid absorption.
   *
   * M. tuberculosis is adapted to lipid nutrition — relying on non-lipids
   * indicates suboptimal conditions and causes gradual viability decline.
   */
  private tbNonLipidDominant(lipidAmount: number, nonLipidAmount: number): boolean {
    return nonLipidAmount > lipidAmount;
  }

  /**
   * Creates an absorption record for a molecule type.
   */
  private tbAbsorptionRecord(moleculeType: string, amount: number): AbsorptionRecord {
    return { moleculeType, amount, absorbed: amount > 0 };
  }

  /**
   * Returns absorption records when no diffusion can occur.
   */
  private tbNoAbsorptionRecords(): AbsorptionRecord[] {
    return [
      { moleculeType: "lipids", amount: 0, absorbed: false },
      { moleculeType: "non-lipids", amount: 0, absorbed: false },
    ];
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
      this.viabilityValue = Math.max(0, this.viabilityValue - 0.01);
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
