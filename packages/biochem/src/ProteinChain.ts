import { AminoAcid } from "./AminoAcid";
import { BioMolecule, BiomoleculeCategory, MetabolicRole, CellularLocation } from "./BioMolecule";
import { Atom } from "@atomika-lab/core";
import { ELEMENTS } from "@atomika-lab/core";

/**
 * A polypeptide chain — a sequence of amino acids linked by peptide bonds.
 * Each peptide bond forms via condensation, releasing one H₂O molecule.
 */
export class ProteinChain extends BioMolecule {
  /**
   * Biochemical classification — always protein.
   */
  readonly biomoleculeCategory = BiomoleculeCategory.PROTEIN;

  /**
   * Primary metabolic role — catalytic and structural functions.
   */
  readonly metabolicRole = MetabolicRole.CATALYTIC;

  /**
   * Typical cellular location — dissolved in cytoplasm.
   */
  readonly cellularLocation = CellularLocation.CYTOPLASM;
  sequence: AminoAcid[];

  constructor(sequence: AminoAcid[] = []) {
    super();
    this.sequence = sequence;
  }

  add(aminoAcid: AminoAcid) {
    this.sequence.push(aminoAcid);
  }

  /**
   * Number of amino acids in the chain.
   */
  get count(): number {
    return this.sequence.length;
  }

  /**
   * Atomic composition of the polypeptide, accounting for water molecules
   * released during peptide bond formation.
   */
  override get atomicComposition(): ReadonlyMap<Atom, number> {
    const composition = new Map<Atom, number>();

    // Sum all amino acid compositions
    for (const aa of this.sequence) {
      for (const [atom, count] of aa.atomicComposition) {
        composition.set(atom, (composition.get(atom) || 0) + count);
      }
    }

    // Subtract (n − 1) H₂O for peptide bond formation
    const peptideBonds = this.sequence.length - 1;
    if (peptideBonds > 0) {
      const hCount = composition.get(ELEMENTS.H) || 0;
      const oCount = composition.get(ELEMENTS.O) || 0;
      composition.set(ELEMENTS.H, hCount - 2 * peptideBonds);
      composition.set(ELEMENTS.O, oCount - peptideBonds);
    }

    return composition;
  }

  /**
   * One-letter code sequence of the polypeptide.
   */
  override toString(): string {
    return this.sequence.map(aa => aa.oneLetterCode).join('');
  }

  /**
   * Octanol-water partition coefficient — proteins vary widely.
   * Large proteins are generally hydrophilic due to surface residues.
   */
  override get logP(): number {
    return -1.0; // Average for proteins
  }
}
