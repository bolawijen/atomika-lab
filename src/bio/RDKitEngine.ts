import initRDKitModule from "@rdkit/rdkit";

/**
 * Singleton wrapper around RDKit.js.
 *
 * Initializes the RDKit WebAssembly module once and provides
 * chemical informatics functions: SMARTS matching, Morgan fingerprints,
 * and chirality verification.
 */
export class RDKitEngine {
  private static instance: RDKitEngine | null = null;
  private rdkit: any = null;
  private initialized = false;

  private constructor() {}

  /**
   * Returns the singleton RDKit engine instance.
   */
  static async getInstance(): Promise<RDKitEngine> {
    if (!RDKitEngine.instance) {
      RDKitEngine.instance = new RDKitEngine();
      await RDKitEngine.instance.initialize();
    }
    return RDKitEngine.instance;
  }

  /**
   * Initializes the RDKit WebAssembly module.
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
}
