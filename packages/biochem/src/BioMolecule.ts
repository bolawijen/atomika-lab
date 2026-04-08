import { Molecule } from "@atomika-lab/core";

/**
 * Metabolic role of a biomolecule in living systems.
 */
export enum MetabolicRole {
  /** Primary energy source for cellular respiration. */
  ENERGY_SOURCE = "energy-source",
  /** Structural component of cells and tissues. */
  STRUCTURAL = "structural",
  /** Catalytic — accelerates biochemical reactions. */
  CATALYTIC = "catalytic",
  /** Signaling — mediates cellular communication. */
  SIGNALING = "signaling",
  /** Genetic — stores and transmits hereditary information. */
  GENETIC = "genetic",
  /** Storage — reserves of energy or building blocks. */
  STORAGE = "storage",
}

/**
 * Typical cellular location of a biomolecule.
 */
export enum CellularLocation {
  /** Dissolved in the cytosol. */
  CYTOPLASM = "cytoplasm",
  /** Embedded in or associated with membranes. */
  MEMBRANE = "membrane",
  /** Within the nucleus or nucleoid region. */
  NUCLEUS = "nucleus",
  /** Secreted or external to the cell. */
  EXTRACELLULAR = "extracellular",
  /** Within organelles (mitochondria, chloroplasts, etc.). */
  ORGANELLE = "organelle",
}

/**
 * Classification of biomolecule types.
 */
export enum BiomoleculeCategory {
  /** Carbohydrates — sugars and their polymers. */
  CARBOHYDRATE = "carbohydrate",
  /** Proteins — polypeptide chains with biological function. */
  PROTEIN = "protein",
  /** Lipids — hydrophobic or amphiphilic biomolecules. */
  LIPID = "lipid",
  /** Amino acids — protein building blocks. */
  AMINO_ACID = "amino-acid",
  /** Nucleic acids — DNA and RNA polymers. */
  NUCLEIC_ACID = "nucleic-acid",
}

/**
 * A biomolecule — a molecule produced by living organisms.
 *
 * BioMolecule sits between Molecule (pure chemistry) and concrete
 * biomolecule types (Saccharide, ProteinChain, Lipid, AminoAcid).
 * It captures shared biological properties that don't belong on
 * the chemical Molecule base class.
 *
 * Drugs and CoordinationComplex remain outside this hierarchy —
 * they are xenobiotic or inorganic, not biological.
 */
export abstract class BioMolecule extends Molecule {
  /**
   * Biochemical classification of this biomolecule.
   */
  abstract readonly biomoleculeCategory: BiomoleculeCategory;

  /**
   * Primary metabolic role in living systems.
   */
  abstract readonly metabolicRole: MetabolicRole;

  /**
   * Typical cellular location where this biomolecule functions.
   */
  abstract readonly cellularLocation: CellularLocation;

  /**
   * Whether this biomolecule is lipophilic (logP > 0).
   *
   * Lipophilic biomolecules partition into membranes and lipid environments.
   * Hydrophilic biomolecules remain in aqueous compartments.
   */
  get isLipophilic(): boolean {
    return this.logP > 0;
  }
}
