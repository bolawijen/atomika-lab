import { Molecule, Atom, ELEMENTS } from "@atomika-lab/core";

/**
 * Nitrogenous bases found in nucleic acids.
 */
export enum NitrogenousBase {
  ADENINE = "A",
  CYTOSINE = "C",
  GUANINE = "G",
  THYMINE = "T",
  URACIL = "U",
}

/**
 * The type of nucleic acid — DNA or RNA.
 */
export enum NucleicAcidType {
  DNA = "DNA",
  RNA = "RNA",
}

/**
 * A nucleotide — the monomer unit of nucleic acids (DNA and RNA).
 * Composed of a nitrogenous base, a pentose sugar, and a phosphate group.
 */
export class Nucleotide extends Molecule {
  readonly base: NitrogenousBase;
  readonly type: NucleicAcidType;

  constructor(base: NitrogenousBase, type: NucleicAcidType = NucleicAcidType.DNA) {
    super();
    this.base = base;
    this.type = type;
  }

  /**
   * The complementary base according to Watson-Crick pairing rules.
   * A pairs with T (DNA) or U (RNA); C pairs with G.
   */
  get complementaryBase(): NitrogenousBase {
    if (this.type === NucleicAcidType.DNA) {
      switch (this.base) {
        case NitrogenousBase.ADENINE: return NitrogenousBase.THYMINE;
        case NitrogenousBase.THYMINE: return NitrogenousBase.ADENINE;
        case NitrogenousBase.CYTOSINE: return NitrogenousBase.GUANINE;
        case NitrogenousBase.GUANINE: return NitrogenousBase.CYTOSINE;
        case NitrogenousBase.URACIL: return NitrogenousBase.ADENINE;
      }
    } else {
      switch (this.base) {
        case NitrogenousBase.ADENINE: return NitrogenousBase.URACIL;
        case NitrogenousBase.URACIL: return NitrogenousBase.ADENINE;
        case NitrogenousBase.CYTOSINE: return NitrogenousBase.GUANINE;
        case NitrogenousBase.GUANINE: return NitrogenousBase.CYTOSINE;
        case NitrogenousBase.THYMINE: return NitrogenousBase.ADENINE;
      }
    }
  }

  /**
   * Atomic composition of the nucleotide.
   * Standard stoichiometry for the deoxyribonucleotide (DNA) or
   * ribonucleotide (RNA) form of each nitrogenous base.
   */
  override get atomicComposition(): ReadonlyMap<Atom, number> {
    // Deoxyribose: C5H10O4, Ribose: C5H10O5, Phosphate: PO4
    // Base compositions (approximate):
    // A: C5H5N5, C: C4H5N3O, G: C5H5N5O, T: C5H6N2O2, U: C4H4N2O2
    const sugarO = this.type === NucleicAcidType.DNA ? 4 : 5;
    const baseComposition = this.#baseComposition();

    const composition = new Map<Atom, number>();
    // Sugar + phosphate backbone: C5 H10 O(sugarO) + PO4 - H2O (condensation)
    composition.set(ELEMENTS.C, 5);
    composition.set(ELEMENTS.H, 10 + baseComposition.h - 2);
    composition.set(ELEMENTS.O, sugarO + 4 + baseComposition.o - 1);
    composition.set(ELEMENTS.N, baseComposition.n);
    composition.set(ELEMENTS.P, 1);

    return composition;
  }

  #baseComposition(): { h: number; o: number; n: number } {
    switch (this.base) {
      case NitrogenousBase.ADENINE: return { h: 5, o: 0, n: 5 };
      case NitrogenousBase.CYTOSINE: return { h: 5, o: 1, n: 3 };
      case NitrogenousBase.GUANINE: return { h: 5, o: 1, n: 5 };
      case NitrogenousBase.THYMINE: return { h: 6, o: 2, n: 2 };
      case NitrogenousBase.URACIL: return { h: 4, o: 2, n: 2 };
    }
  }

  get count(): number {
    return 1;
  }

  override toString(): string {
    return this.base;
  }
}
