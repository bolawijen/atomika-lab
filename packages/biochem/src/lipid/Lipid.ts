import { BioMolecule, BiomoleculeCategory, MetabolicRole, CellularLocation } from "../BioMolecule";
import { Molecule } from "@atomika-lab/core";
import { Atom } from "@atomika-lab/core";
import { ELEMENTS } from "@atomika-lab/core";

/**
 * Nutrient category — classifies the biochemical type of a nutrient molecule.
 */
export enum NutrientCategory {
  FATTY_ACID = "fatty-acid",
  CHOLESTEROL = "cholesterol",
  AMINO_ACID = "amino-acid",
  GLUCOSE = "glucose",
  GLYCEROL = "glycerol",
}

/**
 * Nutrient molecule — any molecule that can be metabolized for energy.
 */
export interface Nutrient {
  /** Biochemical classification of the nutrient. */
  readonly category: NutrientCategory;
  /** Molecular representation. */
  readonly molecule: Molecule;
}

/**
 * Lipid molecule — hydrophobic or amphiphilic biomolecule.
 *
 * Lipids serve as energy reserves, structural membrane components,
 * and signaling molecules. They are insoluble in water but soluble
 * in organic solvents.
 */
export abstract class Lipid extends BioMolecule {
  /**
   * Biochemical classification — always lipid.
   */
  readonly biomoleculeCategory = BiomoleculeCategory.LIPID;

  /**
   * Primary metabolic role — energy storage and membrane structure.
   */
  readonly metabolicRole = MetabolicRole.STORAGE;

  /**
   * Typical cellular location — embedded in membranes.
   */
  readonly cellularLocation = CellularLocation.MEMBRANE;

  /**
   * Number of carbon atoms in the hydrocarbon backbone.
   */
  abstract readonly carbonCount: number;
}

/**
 * Degree of unsaturation in fatty acid hydrocarbon chains.
 */
export enum SaturationLevel {
  /** No double bonds — maximum hydrogen saturation. */
  SATURATED = "saturated",
  /** One double bond in the hydrocarbon chain. */
  MONOUNSATURATED = "monounsaturated",
  /** Two or more double bonds in the hydrocarbon chain. */
  POLYUNSATURATED = "polyunsaturated",
}

/**
 * Fatty acid — carboxylic acid with a long hydrocarbon chain.
 *
 * Primary carbon and energy source for lipid-dependent pathogens
 * such as Mycobacterium tuberculosis. Fatty acids are obtained
 * from host cell membranes during infection.
 */
export class FattyAcid extends Lipid implements Nutrient {
  /**
   * Biochemical category — always fatty acid.
   */
  readonly category = NutrientCategory.FATTY_ACID;

  /**
   * Molecular representation — this instance.
   */
  get molecule(): Molecule {
    return this;
  }

  /**
   * Number of carbon atoms in the hydrocarbon chain.
   * Typical range: 12–24 for biological fatty acids.
   */
  readonly carbonCount: number;

  /**
   * Degree of unsaturation — affects membrane fluidity and energy yield.
   */
  readonly saturationLevel: SaturationLevel;

  /**
   * Number of carbon-carbon double bonds.
   */
  readonly doubleBondCount: number;

  /**
   * Octanol-water partition coefficient — fatty acids are lipophilic.
   * Long-chain fatty acids have LogP 4–8 depending on chain length.
   */
  override get logP(): number {
    return 3.5 + this.carbonCount * 0.25 - this.doubleBondCount * 0.3;
  }

  constructor(params: {
    carbonCount: number;
    saturationLevel: SaturationLevel;
    doubleBondCount?: number;
  }) {
    super();
    this.carbonCount = params.carbonCount;
    this.saturationLevel = params.saturationLevel;
    this.doubleBondCount = params.doubleBondCount ?? 0;
  }

  /**
   * Molecular formula: C(n)H(2n+1-2d)COOH where d = double bond count.
   * General formula for saturated fatty acid: C(n+1)H(2n+2)O2
   */
  override get atomicComposition(): ReadonlyMap<Atom, number> {
    const n = this.carbonCount;
    const d = this.doubleBondCount;
    const hCount = 2 * n + 1 - 2 * d + 1; // +1 for carboxyl H
    return new Map([
      [ELEMENTS.C, n + 1], // +1 for carboxyl carbon
      [ELEMENTS.H, hCount],
      [ELEMENTS.O, 2],
    ]);
  }

  /**
   * Energy yield from complete beta-oxidation (ATP equivalents).
   * Saturated fatty acids yield ~14 ATP per carbon atom.
   */
  get atpYield(): number {
    const baseYield = this.carbonCount * 14;
    const unsaturationPenalty = this.doubleBondCount * 2; // fewer FADH2 from double bonds
    return baseYield - unsaturationPenalty;
  }

  override toString(): string {
    const prefix = this.saturationLevel === SaturationLevel.SATURATED ? "" :
                   this.saturationLevel === SaturationLevel.MONOUNSATURATED ? "MUFA" : "PUFA";
    return `${prefix}C${this.carbonCount}:${this.doubleBondCount}`;
  }

  get count(): number {
    return 1;
  }
}

/**
 * Cholesterol — sterol lipid found in host cell membranes.
 *
 * Carbon source for Mycobacterium tuberculosis during latent infection.
 * M. tuberculosis catabolizes cholesterol to obtain carbon and energy
 * while residing within host macrophages.
 *
 * Molecular formula: C₂₇H₄₆O
 * Molecular weight: 386.65 Da
 */
export class Cholesterol extends Lipid implements Nutrient {
  /**
   * Biochemical category — always cholesterol.
   */
  readonly category = NutrientCategory.CHOLESTEROL;

  /**
   * Molecular representation — this instance.
   */
  get molecule(): Molecule {
    return this;
  }

  /**
   * Number of carbon atoms in the sterol backbone.
   */
  readonly carbonCount = 27;

  /**
   * Octanol-water partition coefficient — cholesterol is highly lipophilic.
   */
  override get logP(): number {
    return 8.7; // Cholesterol is extremely lipophilic
  }

  /**
   * Molecular formula: C₂₇H₄₆O
   */
  override get atomicComposition(): ReadonlyMap<Atom, number> {
    return new Map([
      [ELEMENTS.C, 27],
      [ELEMENTS.H, 46],
      [ELEMENTS.O, 1],
    ]);
  }

  /**
   * Energy yield from cholesterol catabolism (ATP equivalents).
   * Lower than fatty acids due to the complex sterol ring structure.
   */
  get atpYield(): number {
    return 120; // approximate ATP from complete cholesterol catabolism
  }

  override toString(): string {
    return "Cholesterol";
  }

  get count(): number {
    return 1;
  }
}
