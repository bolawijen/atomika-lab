import { Polysaccharide } from "./Polysaccharide";
import { Monosaccharide } from "./Monosaccharide";
import { Glucose } from "./Glucose";
import { GlycosidicBondType, GlycosidicBond } from "./GlycosidicBondType";

/**
 * Amylopectin — a branched polysaccharide and the major component of starch.
 *
 * Consists of α-1,4-linked glucose chains with α-1,6 branch points occurring
 * approximately every 24–30 glucose units. The branching creates a tree-like
 * structure with multiple non-reducing ends for rapid enzymatic digestion.
 */
export class Amylopectin extends Polysaccharide {
  readonly monomers: ReadonlyArray<Monosaccharide>;
  readonly bondType = GlycosidicBondType.ALPHA_1_4;

  /**
   * Creates an amylopectin molecule with branch points at specified positions.
   *
   * @param glucoseUnitCount Total number of glucose units in the molecule.
   * @param branchPositions Indices where α-1,6 branch points occur.
   *   Each entry records the donor monomer index where a branch originates.
   */
  constructor(glucoseUnitCount: number, branchPositions: number[] = []) {
    const branchPoints: GlycosidicBond[] = branchPositions.map(pos => ({
      type: GlycosidicBondType.ALPHA_1_6,
      donorIndex: pos,
      acceptorIndex: pos + 1,
    }));

    super(branchPoints);
    this.monomers = Object.freeze(
      Array.from({ length: glucoseUnitCount }, () => new Glucose())
    );
  }

  toString(): string {
    return `Amylopectin(n=${this.count}, branches=${this.branchCount})`;
  }
}
