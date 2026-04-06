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
