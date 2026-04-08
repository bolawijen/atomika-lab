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
 * Porin channel — protein pore allowing passive entry of small hydrophilic molecules.
 *
 * Porins form water-filled channels in the cell envelope, enabling
 * diffusion of molecules below a size threshold. Larger molecules
 * are excluded by steric hindrance.
 */
export class PorinChannel {
  /**
   * Pore diameter in ångströms.
   * Typical bacterial porins: 10–20 Å.
   */
  readonly poreSize: number;

  /**
   * Maximum molecular diameter that can pass through (Å).
   * Approximated from molecular mass.
   */
  private readonly MAX_MOLECULAR_DIAMETER = 15; // Å

  constructor(params: { poreSize?: number } = {}) {
    this.poreSize = params.poreSize ?? 12;
  }

  /**
   * Whether a molecule can pass through based on size exclusion.
   *
   * @param molecule The molecule attempting to pass.
   * @returns True if the molecule is small enough to fit through the pore.
   */
  canPass(molecule: { molecularMass: number }): boolean {
    // Approximate molecular diameter from mass (spherical assumption)
    const approximateDiameter = 2 * Math.pow((3 * molecule.molecularMass) / (4 * Math.PI * 1.35 * 6.022e23), 1/3) * 1e8;
    return approximateDiameter <= this.MAX_MOLECULAR_DIAMETER;
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

  /**
   * Porin channels — passive entry for small hydrophilic molecules.
   */
  readonly porins: PorinChannel[];

  constructor(params: { lipidComposition?: "gram-negative" | "gram-positive"; porins?: PorinChannel[] } = {}) {
    this.lipidComposition = params.lipidComposition ?? "gram-negative";
    this.porins = params.porins ?? [new PorinChannel()];
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
   * Current nutrient level inside the cell (arbitrary units).
   * Used for concentration gradient calculations.
   */
  private nutrientLevel = 0.5;

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
   * Current nutrient concentration inside the cell.
   */
  get nutrientConcentration(): number {
    return this.nutrientLevel;
  }

  /**
   * Adds nutrient to the cytoplasm via passive diffusion.
   *
   * @param amount Nutrient quantity absorbed.
   */
  addNutrient(amount: number): void {
    this.nutrientLevel = Math.min(1, this.nutrientLevel + amount);
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
   * Minimum LogP required for a molecule to permeate this layer.
   * Molecules below this threshold are too hydrophilic to dissolve.
   */
  readonly minLogPThreshold = 2.0;

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

  /**
   * Whether a molecule can permeate through the mycolic acid layer.
   *
   * Permeability is determined by lipophilicity — molecules with
   * sufficient LogP dissolve into the waxy layer and pass through.
   *
   * @param molecule The molecule attempting to permeate.
   * @returns True if the molecule is lipophilic enough to permeate.
   */
  canPermeate(molecule: { logP: number }): boolean {
    return molecule.logP >= this.minLogPThreshold;
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
  /** Nutrient category. */
  readonly nutrientType: string;
  /** Amount absorbed (arbitrary units). */
  readonly amount: number;
}
