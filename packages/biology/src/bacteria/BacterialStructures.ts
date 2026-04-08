/**
 * Physical structures of bacterial cells.
 *
 * Anatomical components that affect drug interactions, permeability,
 * and cellular viability.
 */

/**
 * Peptidoglycan mesh providing structural integrity and osmotic protection.
 *
 * Target of beta-lactam antibiotics and lysozyme.
 */
export class CellWall {
  /**
   * Structural integrity fraction (0–1). 1.0 = intact, 0.0 = lysed.
   */
  private integrity = 1.0;

  /**
   * Peptidoglycan cross-linking density.
   * Higher density provides greater mechanical strength.
   */
  readonly crossLinkingDensity: number;

  constructor(params: { crossLinkingDensity?: number } = {}) {
    this.crossLinkingDensity = params.crossLinkingDensity ?? 0.8;
  }

  /**
   * Whether the cell wall remains structurally intact.
   */
  get isIntact(): boolean {
    return this.integrity > 0.5;
  }

  /**
   * Current structural integrity.
   */
  get structuralIntegrity(): number {
    return this.integrity;
  }

  /**
   * Applies damage to the peptidoglycan layer.
   *
   * @param severity Damage magnitude (0–1).
   */
  damage(severity: number): void {
    this.integrity = Math.max(0, this.integrity - severity);
  }
}

/**
 * Lipid bilayer with selective permeability and transport proteins.
 *
 * Target of polymyxins, detergents, and oxidative stress.
 */
export class CellMembrane {
  /**
   * Membrane integrity fraction (0–1). 1.0 = intact, 0.0 = compromised.
   */
  private integrity = 1.0;

  /**
   * Lipid composition affecting fluidity and permeability.
   */
  readonly lipidComposition: "gram-negative" | "gram-positive";

  constructor(params: { lipidComposition?: "gram-negative" | "gram-positive" } = {}) {
    this.lipidComposition = params.lipidComposition ?? "gram-negative";
  }

  /**
   * Whether the membrane remains functionally intact.
   */
  get isIntact(): boolean {
    return this.integrity > 0.5;
  }

  /**
   * Current membrane integrity.
   */
  get functionalIntegrity(): number {
    return this.integrity;
  }

  /**
   * Applies damage to the lipid bilayer.
   *
   * @param severity Damage magnitude (0–1).
   */
  damage(severity: number): void {
    this.integrity = Math.max(0, this.integrity - severity);
  }
}

/**
 * Aqueous intracellular fluid containing metabolites and enzymes.
 *
 * Site of glycolysis, biosynthesis, and metabolic regulation.
 */
export class Cytoplasm {
  /**
   * Metabolic activity fraction (0–1). 1.0 = fully active, 0.0 = arrested.
   */
  private metabolicActivity = 1.0;

  /**
   * Intracellular pH affecting enzyme kinetics.
   */
  private ph = 7.2;

  /**
   * Current metabolic activity level.
   */
  get activityLevel(): number {
    return this.metabolicActivity;
  }

  /**
   * Intracellular pH.
   */
  get intracellularPh(): number {
    return this.ph;
  }

  /**
   * Applies metabolic inhibition.
   *
   * @param severity Inhibition magnitude (0–1).
   */
  inhibit(severity: number): void {
    this.metabolicActivity = Math.max(0, this.metabolicActivity - severity);
  }
}

/**
 * Circular chromosomal DNA containing genetic material.
 *
 * No nuclear membrane — direct contact with cytoplasm.
 * Target of UV radiation, reactive oxygen species, and DNA-damaging agents.
 */
export class Nucleoid {
  /**
   * DNA integrity fraction (0–1). 1.0 = undamaged, 0.0 = fragmented.
   */
  private integrity = 1.0;

  /**
   * Chromosomal copy number.
   * Most bacteria have a single circular chromosome.
   */
  readonly chromosomeCount = 1;

  /**
   * Whether the genetic material remains intact for replication and transcription.
   */
  get isFunctional(): boolean {
    return this.integrity > 0.5;
  }

  /**
   * Current DNA integrity level.
   */
  get dnaIntegrity(): number {
    return this.integrity;
  }

  /**
   * Applies DNA damage.
   *
   * @param severity Damage magnitude (0–1).
   */
  damage(severity: number): void {
    this.integrity = Math.max(0, this.integrity - severity);
  }
}

/**
 * Small extrachromosomal DNA elements.
 *
 * Carry antibiotic resistance genes and enable horizontal gene transfer.
 */
export class Plasmid {
  /**
   * Plasmid copy number per cell.
   */
  readonly copyNumber: number;

  /**
   * Genetic markers carried on this plasmid.
   */
  readonly geneticMarkers: string[];

  constructor(params: { copyNumber?: number; geneticMarkers?: string[] }) {
    this.copyNumber = params.copyNumber ?? 1;
    this.geneticMarkers = params.geneticMarkers ?? [];
  }
}

/**
 * Mycolic acid layer — thick waxy coating unique to Mycobacterium species.
 *
 * Creates hydrophobic barrier limiting drug penetration.
 * Contains cord factor (trehalose dimycolate) as virulence determinant.
 */
export class MycolicAcidLayer {
  /**
   * Layer thickness in nanometers.
   * Typical range: 20–40 nm for Mycobacterium tuberculosis.
   */
  readonly thickness: number;

  /**
   * Cord factor surface density — virulence factor inhibiting phagocytosis.
   */
  readonly cordFactorDensity: number;

  /**
   * Hydrophobicity index (0–1). Higher values indicate stronger barrier.
   */
  get hydrophobicity(): number {
    return Math.min(1, this.thickness / 40);
  }

  constructor(params: { thickness?: number; cordFactorDensity?: number }) {
    this.thickness = params.thickness ?? 30;
    this.cordFactorDensity = params.cordFactorDensity ?? 0.5;
  }
}

/**
 * Energy reserves stored within the bacterial cell.
 *
 * Glycogen granules and polyhydroxybutyrate (PHB) serve as
 * carbon and energy reserves during starvation periods.
 */
export class EnergyReserves {
  /**
   * Glycogen granules — polysaccharide energy reserve.
   * Measured in arbitrary units (0 = depleted, 1 = full).
   */
  private glycogenLevel = 0.5;

  /**
   * Polyhydroxybutyrate granules — carbon reserve.
   * Measured in arbitrary units (0 = depleted, 1 = full).
   */
  private phbLevel = 0.3;

  /**
   * Total energy reserve index (0–1).
   */
  get totalReserve(): number {
    return (this.glycogenLevel + this.phbLevel) / 2;
  }

  /**
   * Whether reserves are sufficient for active metabolism.
   */
  get isSufficient(): boolean {
    return this.totalReserve > 0.1;
  }

  /**
   * Consumes energy reserves to produce ATP.
   *
   * @returns Metabolic energy produced in attomoles.
   */
  produceATP(): number {
    if (!this.isSufficient) return 0;
    const consumption = 0.01;
    this.glycogenLevel = Math.max(0, this.glycogenLevel - consumption);
    this.phbLevel = Math.max(0, this.phbLevel - consumption);
    return this.totalReserve * 10; // attomoles
  }

  /**
   * Replenishes energy reserves from absorbed nutrients.
   *
   * @param amount Nutrient quantity absorbed.
   */
  replenish(amount: number): void {
    this.glycogenLevel = Math.min(1, this.glycogenLevel + amount * 0.6);
    this.phbLevel = Math.min(1, this.phbLevel + amount * 0.4);
  }
}

/**
 * Nutrient uptake record — tracks absorbed molecules.
 */
export interface NutrientUptake {
  /** Nutrient identity. */
  readonly nutrientType: string;
  /** Amount absorbed (arbitrary units). */
  readonly amount: number;
}
