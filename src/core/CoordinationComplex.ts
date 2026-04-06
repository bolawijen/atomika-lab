import { Molecule } from "../Molecule";
import { Atom } from "../Atom";

/**
 * Denticity — the number of donor atoms a ligand uses to bind a metal center.
 */
export enum Denticity {
  /** Binds through a single donor atom (e.g., H₂O, NH₃, Cl⁻). */
  MONODENTATE = 1,
  /** Binds through two donor atoms (e.g., ethylenediamine, oxalate). */
  BIDENTATE = 2,
  /** Binds through three donor atoms (e.g., terpyridine). */
  TRIDENTATE = 3,
  /** Binds through four or more donor atoms (e.g., EDTA = hexadentate). */
  POLYDENTATE = 4,
}

/**
 * A ligand — a molecule or ion that forms a coordinate covalent bond
 * with a central metal ion by donating a lone pair of electrons.
 */
export interface Ligand {
  /** The molecular entity that acts as the ligand. */
  molecule: Molecule;
  /** Number of donor atoms used to bind the metal center. */
  denticity: Denticity;
  /** Number of this ligand in the coordination sphere. */
  count: number;
}

/**
 * A coordination complex — a central metal ion surrounded by ligands
 * bound through coordinate covalent bonds.
 *
 * Examples: [Fe(CN)₆]⁴⁻, [Cu(NH₃)₄]²⁺, [Co(en)₃]³⁺
 */
export class CoordinationComplex extends Molecule {
  /** The central metal ion. */
  readonly metalIon: Atom;
  /** The oxidation state of the metal in this complex. */
  readonly oxidationState: number;
  /** Ligands coordinated to the metal center. */
  readonly ligands: ReadonlyArray<Ligand>;
  /** Overall charge of the complex ion. */
  readonly overallCharge: number;

  constructor(
    metalIon: Atom,
    oxidationState: number,
    ligands: Ligand[],
    overallCharge: number,
  ) {
    super();
    this.metalIon = metalIon;
    this.oxidationState = oxidationState;
    this.ligands = Object.freeze(ligands);
    this.overallCharge = overallCharge;
  }

  /**
   * Total coordination number — sum of donor atoms bound to the metal.
   */
  get coordinationNumber(): number {
    return this.ligands.reduce((sum, ligand) => sum + ligand.denticity * ligand.count, 0);
  }

  /**
   * Atomic composition of the entire coordination complex,
   * including the metal ion and all ligand molecules.
   */
  get atomicComposition(): ReadonlyMap<Atom, number> {
    const composition = new Map<Atom, number>();

    // Add metal ion
    composition.set(this.metalIon, 1);

    // Add all ligands
    for (const ligand of this.ligands) {
      for (const [atom, count] of ligand.molecule.atomicComposition) {
        composition.set(atom, (composition.get(atom) || 0) + count * ligand.count);
      }
    }

    return composition;
  }

  /**
   * Number of monomer units — a coordination complex is a single entity.
   */
  get count(): number {
    return 1;
  }

  /**
   * Chemical formula in standard notation.
   * E.g., "[Fe(CN)₆]⁴⁻"
   */
  toString(): string {
    const ligandStr = this.ligands
      .map(l => {
        const name = l.molecule.toString();
        return l.count > 1 ? `(${name})${l.count}` : name;
      })
      .join("");

    const chargeStr = this.overallCharge !== 0
      ? this.overallCharge > 0
        ? this.overallCharge === 1 ? "+" : `${this.overallCharge}+`
        : this.overallCharge === -1 ? "-" : `${Math.abs(this.overallCharge)}-`
      : "";

    return `[${this.metalIon.symbol}${ligandStr}]${chargeStr}`;
  }
}
