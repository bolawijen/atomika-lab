import { BioMolecule, BiomoleculeCategory, MetabolicRole, CellularLocation } from "./BioMolecule";
import { Atom } from "@atomika-lab/core";
import { Chirality } from "@atomika-lab/core";

/**
 * A single amino acid, the building block of proteins.
 * Each amino acid has a characteristic atomic composition.
 * Natural amino acids in proteins are L-isomers.
 */
export class AminoAcid extends BioMolecule {
  /**
   * Biochemical classification — always amino acid.
   */
  readonly biomoleculeCategory = BiomoleculeCategory.AMINO_ACID;

  /**
   * Primary metabolic role — building block for protein synthesis.
   */
  readonly metabolicRole = MetabolicRole.STRUCTURAL;

  /**
   * Typical cellular location — dissolved in cytoplasm.
   */
  readonly cellularLocation = CellularLocation.CYTOPLASM;
  name: string;
  threeLetterCode: string;
  oneLetterCode: string;
  readonly chirality = Chirality.L;

  private _atomicComposition: ReadonlyMap<Atom, number>;

  /**
   * @param name IUPAC name of the amino acid.
   * @param threeLetterCode Standard three-letter code used in protein sequence notation.
   * @param oneLetterCode Standard one-letter code used in protein sequence notation.
   * @param atomicComposition Stoichiometric composition of this amino acid.
   */
  constructor(
    name: string,
    threeLetterCode: string,
    oneLetterCode: string,
    atomicComposition: ReadonlyMap<Atom, number>,
  ) {
    super();
    this.name = name;
    this.threeLetterCode = threeLetterCode;
    this.oneLetterCode = oneLetterCode;
    this._atomicComposition = atomicComposition;
  }

  override get atomicComposition(): ReadonlyMap<Atom, number> {
    return this._atomicComposition;
  }

  /**
   * Octanol-water partition coefficient — amino acids are generally hydrophilic.
   * Varies by side chain: hydrophobic amino acids have higher LogP.
   */
  override get logP(): number {
    return -2.0; // Average for amino acids
  }

  override toString(): string {
    return this.threeLetterCode;
  }
}
