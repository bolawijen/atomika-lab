import { Bacteria } from "./Bacteria";
import { Polymerase } from "./Polymerase";
import { Rifampicin } from "@atomika-lab/pharmacology";
import { Environment } from "@atomika-lab/core";

/**
 * Mycobacterium tuberculosis — the causative agent of tuberculosis.
 *
 * The mycolic acid layer creates a hydrophobic barrier that limits
 * permeability to hydrophilic compounds. Only lipophilic molecules
 * (LogP > threshold) can penetrate effectively.
 *
 * Energy → Action → Target pattern:
 * - Energy source: Environment (thermal energy drives diffusion)
 * - Action: Penetrate mycolic acid barrier (requires high LogP)
 * - Target: Bacterial RNA polymerase (β-subunit binding)
 */
export class MycobacteriumTuberculosis extends Bacteria {
  /**
   * Mycolic acid wall thickness — affects drug penetration rate.
   * Thicker walls require higher lipophilicity for permeation.
   */
  readonly mycolicAcidThickness: number;

  /**
   * Minimum LogP required for a molecule to penetrate the cell wall.
   * Typical value: ~2.0 for Mycobacterium species.
   */
  readonly minLogPForPenetration = 2.0;

  constructor(params: { mycolicAcidThickness?: number }) {
    super();
    this.mycolicAcidThickness = params.mycolicAcidThickness ?? 1.0;
  }

  /**
   * Responds to drug exposure with mycolic acid barrier consideration.
   *
   * @param drug The medicinal substance present in the environment.
   * @param environment The thermal and chemical context of exposure.
   */
  exposedTo(drug: Rifampicin, environment: Environment): void {
    // Drug must overcome mycolic acid barrier
    const canPenetrate = drug.logP >= this.minLogPForPenetration
      && environment.thermalEnergy > 0;
    if (!canPenetrate) return;

    // Target recognition — structural complementarity
    const polymerase = this.enzymes.find(e => e instanceof Polymerase) as Polymerase | undefined;
    if (!polymerase) return;

    // Reversible binding — driven by binding affinity (Kd)
    polymerase.bindLigand(drug, drug.dissociationConstant);

    this.updateViability();
  }
}
