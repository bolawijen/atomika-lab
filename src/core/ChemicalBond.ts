/**
 * A chemical bond — a physical entity linking two atoms or molecular fragments.
 *
 * Bonds are characterized by their energy, length, and type. The bond energy
 * determines how much energy is required to cleave the bond, while the bond
 * length defines the equilibrium distance between the bonded centers.
 */
export class ChemicalBond {
  /** Bond dissociation energy (kJ/mol) — energy required to break the bond. */
  readonly bondEnergy: number;

  /** Equilibrium bond length (Ångströms). */
  readonly bondLength: number;

  /**
   * Creates a chemical bond.
   *
   * @param bondEnergy Bond dissociation energy (kJ/mol). Typical values:
   *   C–C single bond: ~347 kJ/mol, C=C double bond: ~614 kJ/mol,
   *   α-1,4-glycosidic: ~300 kJ/mol, peptide bond: ~360 kJ/mol.
   * @param bondLength Equilibrium bond length (Å). Typical values:
   *   C–C: 1.54 Å, C=C: 1.34 Å, C–O: 1.43 Å.
   */
  constructor(bondEnergy: number, bondLength: number) {
    this.bondEnergy = bondEnergy;
    this.bondLength = bondLength;
  }

  /**
   * Determines whether this bond can be cleaved given the available energy.
   *
   * @param availableEnergy Energy available for bond cleavage (kJ/mol).
   * @returns True if the available energy exceeds the bond dissociation energy.
   */
  isCleavable(availableEnergy: number): boolean {
    return availableEnergy >= this.bondEnergy;
  }
}

/**
 * Common bond energies and lengths for reference.
 */
export const BondReference = {
  /** C–C single bond. */
  C_C_SINGLE: { energy: 347, length: 1.54 },
  /** C=C double bond. */
  C_C_DOUBLE: { energy: 614, length: 1.34 },
  /** C–O single bond. */
  C_O_SINGLE: { energy: 358, length: 1.43 },
  /** α-1,4-glycosidic bond (approximate). */
  ALPHA_1_4_GLYCOSIDIC: { energy: 300, length: 1.41 },
  /** α-1,6-glycosidic bond (branch point, approximate). */
  ALPHA_1_6_GLYCOSIDIC: { energy: 280, length: 1.43 },
  /** β-1,4-glycosidic bond (cellulose, approximate). */
  BETA_1_4_GLYCOSIDIC: { energy: 310, length: 1.41 },
  /** Peptide bond (approximate). */
  PEPTIDE: { energy: 360, length: 1.33 },
  /** Phosphodiester bond (nucleic acids, approximate). */
  PHOSPHODIESTER: { energy: 340, length: 1.60 },
  /** O–H bond. */
  O_H: { energy: 463, length: 0.96 },
  /** N–H bond. */
  N_H: { energy: 391, length: 1.01 },
} as const;
