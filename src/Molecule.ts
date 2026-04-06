import { Atom } from "./Atom";

/**
 * A molecule — a group of atoms chemically bonded together.
 * Provides molecular formula and mass derived from atomic composition.
 */
export abstract class Molecule {
  /**
   * Atomic composition of the molecule.
   * Each element is associated with its stoichiometric count.
   */
  abstract get atomicComposition(): ReadonlyMap<Atom, number>;

  /**
   * Molecular formula in Hill notation (C first, then H, then alphabetical).
   * E.g., "C₆H₁₂O₆" for glucose.
   */
  get molecularFormula(): string {
    const composition = this.atomicComposition;
    if (composition.size === 0) return "";

    const entries = Array.from(composition.entries());

    // Hill system: C first, H second, then alphabetical by symbol
    entries.sort((a, b) => {
      const aIsC = a[0].symbol === "C";
      const bIsC = b[0].symbol === "C";
      const aIsH = a[0].symbol === "H";
      const bIsH = b[0].symbol === "H";

      if (aIsC && !bIsC) return -1;
      if (!aIsC && bIsC) return 1;
      if (aIsH && !bIsH) return -1;
      if (!aIsH && bIsH) return 1;
      return a[0].symbol.localeCompare(b[0].symbol);
    });

    return entries
      .map(([atom, count]) => atom.symbol + (count > 1 ? subscript(count) : ""))
      .join("");
  }

  /**
   * Total molecular mass in atomic mass units (u/Da).
   */
  get molecularMass(): number {
    let mass = 0;
    for (const [atom, count] of this.atomicComposition) {
      mass += atom.mass * count;
    }
    return mass;
  }
}

/**
 * Converts a number to Unicode subscript characters for chemical formulas.
 */
function subscript(n: number): string {
  const digits: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  };
  return String(n).split("").map(d => digits[d]).join("");
}
