import { Enzyme } from "@atomika-lab/biochem";
import { Polymerase } from "../Polymerase";
import { Rifampicin } from "@atomika-lab/pharmacology";
import { Environment, type Duration } from "@atomika-lab/core";
import {
  CellWall,
  CellMembrane,
  Cytoplasm,
  Nucleoid,
  Plasmid,
} from "./BacterialStructures";
import type {
  EnvironmentalEvent,
  CellWallDamageEvent,
  MembraneDamageEvent,
  DnaDamageEvent,
  ProteinDenaturationEvent,
  RibosomeInhibitionEvent,
  MetabolicInhibitionEvent,
  EnvironmentalChangeEvent,
} from "./BacterialStimuli";
import { Ribosome } from "../Ribosome";

/**
 * A prokaryotic cell containing enzymatic machinery.
 *
 * Bacterial cells express enzymes that catalyze metabolic reactions
 * and maintain viability under pharmacological stress.
 */
export class BacterialCell {
  /**
   * Peptidoglycan cell wall providing structural integrity.
   */
  readonly cellWall: CellWall;

  /**
   * Lipid bilayer membrane with selective permeability.
   */
  readonly cellMembrane: CellMembrane;

  /**
   * Aqueous cytoplasm containing metabolites and enzymes.
   */
  readonly cytoplasm: Cytoplasm;

  /**
   * Circular chromosomal DNA containing genetic material.
   */
  readonly nucleoid: Nucleoid;

  /**
   * 70S ribosomes for protein synthesis.
   */
  readonly ribosomes: Ribosome[];

  /**
   * Extrachromosomal plasmids carrying accessory genes.
   */
  readonly plasmids: Plasmid[];

  /**
   * Generation time — species-specific doubling time.
   */
  readonly generationTime: Duration;

  /**
   * Current growth phase of the bacterial population.
   */
  growthPhase: "lag" | "log" | "stationary" | "death" = "lag";

  /**
   * Enzymatic machinery available within the cell.
   */
  protected enzymes: Enzyme[] = [];

  /**
   * Viability fraction (0–1). 1.0 = fully viable, 0.0 = non-viable.
   */
  private viability = 1.0;

  /**
   * Elapsed time since inoculation.
   */
  protected elapsedDuration = 0;

  constructor(params: { generationTime?: Duration } = {}) {
    this.cellWall = new CellWall();
    this.cellMembrane = new CellMembrane();
    this.cytoplasm = new Cytoplasm();
    this.nucleoid = new Nucleoid();
    this.ribosomes = [];
    this.plasmids = [];
    this.generationTime = params.generationTime ?? (1200 as Duration);
  }

  /**
   * Registers an enzyme within the bacterial cell.
   */
  addEnzyme(enzyme: Enzyme): void {
    this.enzymes.push(enzyme);
  }

  /**
   * Returns all enzymes currently expressed by the bacterium.
   */
  getEnzymes(): ReadonlyArray<Enzyme> {
    return this.enzymes;
  }

  /**
   * Updates viability based on cumulative enzymatic inhibition.
   */
  updateViability(): void {
    const activeFraction = this.enzymes.filter(e => !("isDenatured" in e && e.isDenatured)).length /
      Math.max(this.enzymes.length, 1);
    this.viability = activeFraction;
  }

  /**
   * Current viability fraction.
   */
  getViability(): number {
    return this.viability;
  }

  /**
   * Whether the bacterium remains viable.
   *
   * Viability threshold based on minimum metabolic activity
   * required for colony formation.
   */
  get isAlive(): boolean {
    return this.viability > 0.1;
  }

  /**
   * Responds to environmental changes through regulatory pathways.
   *
   * Bacteria sense and respond to their environment — nutrients, temperature,
   * pH, oxygen, drugs, and population density. Each stimulus triggers
   * a regulatory response pathway.
   *
   * @param event The environmental stimulus.
   */
  onEnvironmentalChange(event: EnvironmentalEvent): void {
    switch (event.type) {
      case "cellWallDamage":
        this.onCellWallDamage(event as CellWallDamageEvent);
        break;
      case "membraneDamage":
        this.onMembraneDamage(event as MembraneDamageEvent);
        break;
      case "dnaDamage":
        this.onDnaDamage(event as DnaDamageEvent);
        break;
      case "proteinDenaturation":
        this.onProteinDenaturation(event as ProteinDenaturationEvent);
        break;
      case "ribosomeInhibition":
        this.onRibosomeInhibition(event as RibosomeInhibitionEvent);
        break;
      case "metabolicInhibition":
        this.onMetabolicInhibition(event as MetabolicInhibitionEvent);
        break;
      case "environmentalChange":
        this.adaptToEnvironment(event as EnvironmentalChangeEvent);
        break;
    }
  }

  /**
   * Applies cell wall damage — triggers death if irreversible.
   *
   * @param event Cell wall damage event.
   */
  onCellWallDamage(event: CellWallDamageEvent): void {
    this.cellWall.damage(event.severity);
    if (event.isIrreversible || !this.cellWall.isIntact) {
      this.die();
    }
  }

  /**
   * Applies membrane damage — triggers death if irreversible.
   *
   * @param event Membrane damage event.
   */
  onMembraneDamage(event: MembraneDamageEvent): void {
    this.cellMembrane.damage(event.severity);
    if (event.isIrreversible || !this.cellMembrane.isIntact) {
      this.die();
    }
  }

  /**
   * Applies DNA damage — triggers death if irreversible.
   *
   * @param event DNA damage event.
   */
  onDnaDamage(event: DnaDamageEvent): void {
    this.nucleoid.damage(event.severity);
    if (event.isIrreversible || !this.nucleoid.isFunctional) {
      this.die();
    }
  }

  /**
   * Applies protein denaturation — triggers death if irreversible.
   *
   * @param event Protein denaturation event.
   */
  onProteinDenaturation(event: ProteinDenaturationEvent): void {
    if (event.isIrreversible) {
      this.die();
    }
  }

  /**
   * Applies ribosome inhibition — triggers death if irreversible.
   *
   * @param event Ribosome inhibition event.
   */
  onRibosomeInhibition(event: RibosomeInhibitionEvent): void {
    if (event.isIrreversible) {
      this.die();
    }
  }

  /**
   * Applies metabolic inhibition — triggers death if irreversible.
   *
   * @param event Metabolic inhibition event.
   */
  onMetabolicInhibition(event: MetabolicInhibitionEvent): void {
    this.cytoplasm.inhibit(event.severity);
    if (event.isIrreversible) {
      this.die();
    }
  }

  /**
   * Adapts to environmental condition changes.
   *
   * @param event Environmental change event.
   */
  private adaptToEnvironment(event: EnvironmentalEvent & { type: "environmentalChange" }): void {
    // Update growth phase based on elapsed time and generation time
    this.elapsedDuration += 1; // assume 1 second per call
    const generationSeconds = this.generationTime;

    if (this.elapsedDuration < generationSeconds * 0.1) {
      this.growthPhase = "lag";
    } else if (this.elapsedDuration < generationSeconds * 0.5) {
      this.growthPhase = "log";
    } else if (this.elapsedDuration < generationSeconds * 0.8) {
      this.growthPhase = "stationary";
    } else {
      this.growthPhase = "death";
    }
  }

  /**
   * Binary fission — asexual reproduction producing two daughter cells.
   *
   * DNA replication → cell elongation → septum formation → cytokinesis → 2 daughter cells.
   * Returns a daughter cell if conditions are met, null otherwise.
   *
   * @param environment The environmental context for division.
   * @returns A new BacterialCell instance (daughter cell), or null if conditions prevent division.
   */
  divide(environment: Environment): BacterialCell | null {
    // Check if parent is viable for division
    if (!this.isAlive) return null;

    // Check if generation time has elapsed
    if (this.elapsedDuration < this.generationTime) return null;

    // Environmental dependency — requires adequate thermal energy
    if (environment.thermalEnergy <= 0) return null;

    // Reset parent timer for next division cycle
    this.elapsedDuration = 0;

    // Produce daughter cell with inherited properties
    const daughter = new BacterialCell({
      generationTime: this.generationTime,
    });

    // Inherit enzymes
    for (const enzyme of this.enzymes) {
      daughter.addEnzyme(enzyme);
    }

    return daughter;
  }

  /**
   * Terminates cellular viability.
   */
  private die(): void {
    this.viability = 0;
    this.growthPhase = "death";
  }

  /**
   * Responds to drug exposure through thermodynamically-driven processes.
   *
   * The Environment provides thermal energy (Brownian motion) that drives
   * passive diffusion. The drug molecule is a passive participant with
   * physicochemical properties; the biological system responds to those
   * properties through thermodynamic interactions.
   *
   * Energy → Action → Target pattern:
   * - Energy source: Environment (thermal energy at body temperature)
   * - Action: Passive diffusion driven by Brownian motion
   * - Target: Bacterial RNA polymerase (structural complementarity)
   *
   * @param drug The medicinal substance present in the environment.
   * @param environment The thermal and chemical context of exposure.
   */
  exposedTo(drug: Rifampicin, environment: Environment): void {
    // Thermal energy drives passive diffusion (Brownian motion)
    // Membrane permeability requires lipophilicity (LogP > 0)
    // and sufficient thermal energy for molecular motion
    const canPenetrate = drug.logP > 0 && environment.thermalEnergy > 0;
    if (!canPenetrate) return;

    // Target recognition — structural complementarity
    const polymerase = this.enzymes.find(e => e instanceof Polymerase) as Polymerase | undefined;
    if (!polymerase) return;

    // Reversible binding — driven by binding affinity (Kd) and thermal context
    polymerase.bindLigand(drug, drug.dissociationConstant);

    this.updateViability();
  }
}
