import { Maltose } from "../saccharide/Maltose";
import { Dextrin } from "../saccharide/Dextrin";
import { Monosaccharide } from "../saccharide/Monosaccharide";
import { Polysaccharide } from "../saccharide/Polysaccharide";
import { Saccharide } from "../saccharide/Saccharide";

/**
 * The result of hydrolyzing a set of oligosaccharide molecules.
 */
export interface HydrolysisResult {
  /** Fragments that still contain cleavable bonds. */
  unhydrolyzedFragments: Saccharide[];
  /** Disaccharide products released from hydrolysis. */
  maltose: Maltose[];
  /** Free monosaccharide units released from hydrolysis. */
  freeMonosaccharides: Monosaccharide[];
  /** Number of glycosidic bonds actually cleaved. */
  bondsCleaved: number;
}

/**
 * Glycosidic bond hydrolysis by nucleophilic attack of water.
 *
 * Cleaves glycosidic linkages at random positions along the saccharide chain,
 * yielding maltose (disaccharide), dextrin fragments (short oligosaccharides),
 * and free monosaccharide units. The distribution of products depends on
 * the chain length and the number of bonds cleaved.
 */
export class HydrolysisMechanism {
  /**
   * Minimum monomer count for a fragment to contain a cleavable bond.
   */
  private readonly MIN_HYDROLYZABLE_COUNT = 2;

  /**
   * Hydrolyzes up to the specified number of glycosidic bonds
   * across the given oligosaccharide mixture.
   */
  execute(mixture: Polysaccharide[], budget: number): HydrolysisResult {
    const unhydrolyzedFragments: Saccharide[] = [];
    const maltose: Maltose[] = [];
    const freeMonosaccharides: Monosaccharide[] = [];
    let bondsCleaved = 0;

    for (const oligomer of mixture) {
      if (bondsCleaved >= budget) {
        unhydrolyzedFragments.push(oligomer);
        continue;
      }

      const result = this.#processOligomer(oligomer);
      unhydrolyzedFragments.push(...result.remainingOligomers);
      maltose.push(...result.maltose);
      freeMonosaccharides.push(...result.freeMonosaccharides);
      bondsCleaved += result.bondsCleaved;
    }

    return { unhydrolyzedFragments, maltose, freeMonosaccharides, bondsCleaved };
  }

  /**
   * Processes a single oligosaccharide during hydrolysis.
   * Disaccharides are released as maltose; longer chains are cleaved.
   */
  #processOligomer(oligomer: Polysaccharide): { remainingOligomers: Saccharide[], maltose: Maltose[], freeMonosaccharides: Monosaccharide[], bondsCleaved: number } {
    if (oligomer.count === this.MIN_HYDROLYZABLE_COUNT) {
      return { remainingOligomers: [], maltose: [new Maltose()], freeMonosaccharides: [], bondsCleaved: 0 };
    }

    const [proximal, distal] = this.#cleaveGlycosidicBond(oligomer);
    const maltose: Maltose[] = [];
    const remainingOligomers: Saccharide[] = [];
    const freeMonosaccharides: Monosaccharide[] = [];

    this.#classifyFragment(proximal, maltose, remainingOligomers, freeMonosaccharides);
    this.#classifyFragment(distal, maltose, remainingOligomers, freeMonosaccharides);

    return { remainingOligomers, maltose, freeMonosaccharides, bondsCleaved: 1 };
  }

  /**
   * Simulates endo-hydrolysis of a single glycosidic bond
   * at a random position within the oligosaccharide chain.
   */
  #cleaveGlycosidicBond(chain: Polysaccharide): [Dextrin, Dextrin] {
    const cleavageSite = this.#selectRandomCleavageSite(chain.count);
    const proximalMonomers = chain.monomers.slice(0, cleavageSite);
    const distalMonomers = chain.monomers.slice(cleavageSite);
    return [
      new Dextrin(proximalMonomers),
      new Dextrin(distalMonomers),
    ];
  }

  /**
   * Selects a random cleavage site along the glycosidic backbone.
   */
  #selectRandomCleavageSite(chainCount: number): number {
    return Math.floor(Math.random() * (chainCount - 1)) + 1;
  }

  /**
   * Classifies a hydrolysis fragment as maltose, a remaining oligomer,
   * or a free monosaccharide.
   */
  #classifyFragment(
    fragment: Dextrin,
    maltose: Maltose[],
    remainingOligomers: Saccharide[],
    freeMonosaccharides: Monosaccharide[],
  ): void {
    if (fragment.count === this.MIN_HYDROLYZABLE_COUNT) {
      maltose.push(new Maltose());
    } else if (fragment.count > this.MIN_HYDROLYZABLE_COUNT) {
      remainingOligomers.push(fragment);
    } else {
      freeMonosaccharides.push(fragment.monomers[0]!);
    }
  }
}
