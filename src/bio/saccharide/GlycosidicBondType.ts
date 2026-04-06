/**
 * Glycosidic bond types found in saccharides.
 * α-Amylase specifically targets α-1,4 linkages in starch.
 */
export enum GlycosidicBondType {
  /** α-1,4 linkage — found in amylose, amylopectin, glycogen */
  ALPHA_1_4 = "α-1,4",
  /** α-1,6 linkage — branch point in amylopectin and glycogen */
  ALPHA_1_6 = "α-1,6",
  /** β-1,4 linkage — found in cellulose, chitin */
  BETA_1_4 = "β-1,4",
}

/**
 * A glycosidic bond connecting two monosaccharide units within a polysaccharide.
 * Records both the bond type and the positions of the connected monomers.
 */
export interface GlycosidicBond {
  /** The type of glycosidic linkage (α-1,4, α-1,6, or β-1,4). */
  type: GlycosidicBondType;
  /** Index of the donor monomer in the chain. */
  donorIndex: number;
  /** Index of the acceptor monomer in the chain. */
  acceptorIndex: number;
}
