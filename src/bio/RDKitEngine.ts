import initRDKitModule from "@rdkit/rdkit";

/**
 * Singleton wrapper around RDKit.js.
 *
 * Initializes the RDKit WebAssembly module once and provides
 * chemical informatics functions: SMARTS matching, Morgan fingerprints,
 * and chirality verification.
 *
 * Acts as the chemical library — a reference database of molecular structures,
 * properties, and transformation rules derived from standard chemistry.
 */
export class RDKitEngine {
  private static instance: RDKitEngine | null = null;
  private rdkit: any = null;
  private initialized = false;

  private constructor() {}

  /**
   * Returns the singleton chemical library instance.
   */
  static async getInstance(): Promise<RDKitEngine> {
    if (!RDKitEngine.instance) {
      RDKitEngine.instance = new RDKitEngine();
      await RDKitEngine.instance.initialize();
    }
    return RDKitEngine.instance;
  }

  /**
   * Registers atomic standards and chemical reference data.
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    this.rdkit = await initRDKitModule();
    this.initialized = true;
  }

  /**
   * Creates an RDKit molecule from a SMILES string.
   */
  createMolecule(smiles: string): any {
    if (!this.initialized) throw new Error("RDKit not initialized");
    return this.rdkit.get_mol(smiles);
  }

  /**
   * Finds all substructure matches for a SMARTS pattern in the given molecule.
   * Returns an array of atom index tuples.
   */
  matchSmarts(mol: any, smartsPattern: string): number[][] {
    if (!this.initialized) throw new Error("RDKit not initialized");
    const query = this.rdkit.get_qmol(smartsPattern);
    if (!query) return [];
    const matches = mol.get_substruct_matches(query);
    query.delete();
    return matches;
  }

  /**
   * Computes the Morgan fingerprint (ECFP-like) for a molecule.
   * Returns a binary fingerprint as a Uint8Array.
   */
  getMorganFingerprint(mol: any, radius: number = 2): Uint8Array {
    if (!this.initialized) throw new Error("RDKit not initialized");
    const fp = mol.get_morgan_fp(radius);
    return fp;
  }

  /**
   * Computes the Tanimoto similarity between two Morgan fingerprints.
   * Returns a value between 0 (no similarity) and 1 (identical).
   */
  tanimotoSimilarity(fp1: Uint8Array, fp2: Uint8Array): number {
    if (!this.initialized) throw new Error("RDKit not initialized");
    return this.rdkit.tanimoto_similarity(fp1, fp2);
  }

  /**
   * Counts the number of chiral centers in the molecule.
   */
  countChiralCenters(mol: any): number {
    if (!this.initialized) throw new Error("RDKit not initialized");
    const descriptors = mol.get_descriptors();
    return descriptors.NumChiralCenters || 0;
  }

  /**
   * Checks whether the molecule has the specified chirality at a given atom index.
   */
  getChiralTag(mol: any, atomIndex: number): string {
    if (!this.initialized) throw new Error("RDKit not initialized");
    const atom = mol.get_atom_with_idx(atomIndex);
    if (!atom) return "";
    return atom.get_chiral_tag() || "";
  }

  /**
   * Parses a SMILES string and returns the atomic composition as a map.
   * Uses RDKit's formula descriptor for accurate atom counting.
   */
  getAtomicCompositionFromSmiles(smiles: string): Map<any, number> {
    if (!this.initialized) throw new Error("RDKit not initialized");
    const mol = this.rdkit.get_mol(smiles);
    if (!mol) return new Map();

    const descriptors = mol.get_descriptors();
    const formula = descriptors.formula || "";
    mol.delete();

    return this.#parseFormula(formula);
  }

  /**
   * Returns the accurate molecular weight from RDKit.
   */
  getMolecularWeight(smiles: string): number {
    if (!this.initialized) throw new Error("RDKit not initialized");
    const mol = this.rdkit.get_mol(smiles);
    if (!mol) return 0;
    const descriptors = mol.get_descriptors();
    const weight = descriptors.amw || 0;
    mol.delete();
    return weight;
  }

  /**
   * Calculates the LogP (octanol-water partition coefficient) for a molecule.
   * High LogP indicates hydrophobicity (low aqueous solubility).
   */
  getLogP(smiles: string): number {
    if (!this.initialized) throw new Error("RDKit not initialized");
    const mol = this.rdkit.get_mol(smiles);
    if (!mol) return 0;
    const descriptors = mol.get_descriptors();
    const logP = descriptors.MolLogP || 0;
    mol.delete();
    return logP;
  }

  /**
   * Parses a chemical formula into an atom count map.
   * E.g., "C6H12O6" → Map{C: 6, H: 12, O: 6}
   */
  #parseFormula(formula: string): Map<any, number> {
    const { ELEMENTS } = require("../../Element");
    const counts = new Map<any, number>();

    // Match element symbols followed by optional numbers
    const regex = /([A-Z][a-z]?)(\d*)/g;
    let match;

    while ((match = regex.exec(formula)) !== null) {
      const symbol = match[1];
      const count = match[2] ? parseInt(match[2], 10) : 1;

      // Find matching element in our registry
      for (const [, atom] of Object.entries(ELEMENTS)) {
        if ((atom as any).symbol === symbol) {
          counts.set(atom, (counts.get(atom) || 0) + count);
          break;
        }
      }
    }

    return counts;
  }
}
