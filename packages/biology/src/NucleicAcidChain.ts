import { Molecule } from "@atomika-lab/core";
import { Atom } from "@atomika-lab/core";
import { Nucleotide, NitrogenousBase, NucleicAcidType } from "./Nucleotide";

/**
 * A polynucleotide chain — a sequence of nucleotides linked by phosphodiester bonds.
 * Forms the structural basis of genetic material.
 */
export class NucleicAcidChain extends Molecule {
  readonly sequence: Nucleotide[];
  readonly type: NucleicAcidType;

  constructor(sequence: Nucleotide[]) {
    super();
    this.sequence = sequence;
    this.type = sequence.length > 0 ? sequence[0].type : NucleicAcidType.DNA;
  }

  /**
   * Number of nucleotides in the chain.
   */
  get count(): number {
    return this.sequence.length;
  }

  /**
   * Atomic composition of the polynucleotide, accounting for water molecules
   * released during phosphodiester bond formation.
   */
  get atomicComposition(): ReadonlyMap<Atom, number> {
    const composition = new Map<Atom, number>();

    for (const nucleotide of this.sequence) {
      for (const [atom, count] of nucleotide.atomicComposition) {
        composition.set(atom, (composition.get(atom) || 0) + count);
      }
    }

    // Subtract (n − 1) H₂O for phosphodiester bond formation
    const bonds = this.sequence.length - 1;
    if (bonds > 0) {
      const hCount = composition.get(this.#getAtomBySymbol("H")) || 0;
      const oCount = composition.get(this.#getAtomBySymbol("O")) || 0;
      composition.set(this.#getAtomBySymbol("H"), hCount - 2 * bonds);
      composition.set(this.#getAtomBySymbol("O"), oCount - bonds);
    }

    return composition;
  }

  /**
   * Returns the sequence as a string of base letters (e.g., "ATCG").
   */
  toString(): string {
    return this.sequence.map(n => n.base).join("");
  }

  #getAtomBySymbol(symbol: string): Atom {
    const elements = new Map<string, Atom>();
    for (const [atom] of this.sequence[0]?.atomicComposition || new Map()) {
      elements.set(atom.symbol, atom);
    }
    return elements.get(symbol) || new Atom({ name: symbol, symbol, protonCount: 0, mass: 0 });
  }
}
