import { Maltose } from "../saccharide/Maltose";
import { Dextrin } from "../saccharide/Dextrin";
import { Glucose } from "../saccharide/Glucose";
import { ProteinChain } from "../ProteinChain";
import { Enzyme } from "./Enzyme";
import { Saccharide } from "../saccharide/Saccharide";
import { Polysaccharide } from "../saccharide/Polysaccharide";
import { Environment, PHYSIOLOGICAL_CONDITIONS } from "../Environment";

/**
 * The Amylase enzyme.
 *
 * α-Amylase (EC 3.2.1.1) is an endohydrolase that randomly cleaves
 * internal α-1,4-glycosidic bonds in polysaccharides such as amylose,
 * yielding maltose and limit dextrins as end products.
 */
export class Amylase extends Enzyme {
  /**
   * Minimum monomer count required for an internal α-1,4-glycosidic bond to exist.
   * A disaccharide (n = 2) is the smallest hydrolyzable unit, yielding one maltose.
   */
  private readonly MIN_HYDROLYZABLE_COUNT = 2;

  /**
   * Optimal temperature for catalytic activity (°C).
   * Human salivary α-amylase operates best near body temperature.
   */
  private readonly OPTIMAL_TEMP = 37;

  /**
   * Temperature threshold for irreversible thermal denaturation (°C).
   * Above this point, the tertiary structure collapses permanently.
   */
  private readonly DENATURATION_THRESHOLD = 60;

  /**
   * Permanent structural damage flag — once true, the enzyme can never recover.
   * Analogous to hardware failure: the protein backbone is unfolded beyond repair.
   */
  isDenatured = false;

  /**
   * Reaction environment governing enzyme activity.
   */
  environment: Environment;

  constructor(protein: ProteinChain, environment: Environment = PHYSIOLOGICAL_CONDITIONS) {
    super(protein);
    this.environment = environment;
  }

  /**
   * Software state — whether the enzyme can currently perform catalysis.
   * Depends on environment: temperature, pH, and structural integrity.
   *
   * Unlike isDenatured, inactivity from suboptimal conditions is reversible.
   * If conditions return to normal, the enzyme resumes catalysis.
   */
  get isActive(): boolean {
    // Hardware check — permanent damage
    if (this.isDenatured) return false;

    // Temperature window — enzyme "freezes" below 5°C, denatures above threshold
    if (this.environment.temperatureC < 5) return false;
    if (this.environment.temperatureC > this.DENATURATION_THRESHOLD) return false;

    // pH window — α-amylase requires near-neutral pH (4–9)
    if (this.environment.pH < 4 || this.environment.pH > 9) return false;

    return true;
  }

  /**
   * Catalyzes the hydrolysis of α-1,4-glycosidic bonds in a polysaccharide substrate.
   *
   * The reaction proceeds through iterative cycles of endo-cleavage until all
   * remaining oligosaccharides are too short to be further hydrolyzed,
   * the enzyme undergoes thermal denaturation, or conditions become unfavorable.
   *
   * @param substrate The polysaccharide substrate (e.g., amylose).
   * @returns All hydrolysis products: maltose, free glucose, and limit dextrins.
   */
  digest(substrate: Saccharide): Saccharide[] {
    const validatedSubstrate = this.#validateSubstrateSpecificity(substrate);
    if (!validatedSubstrate) {
      return [];
    }

    // Check for immediate thermal denaturation before any catalysis
    this.#checkThermalDenaturation();
    if (this.isDenatured) return [];

    let reactionMixture: Polysaccharide[] = [validatedSubstrate];
    const hydrolysisProducts: Saccharide[] = [];

    while (this.isActive && this.#hasHydrolyzableSubstrate(reactionMixture)) {
      this.#checkThermalDenaturation();
      if (this.isDenatured) break;

      const result = this.#executeCatalyticCycle(reactionMixture);
      hydrolysisProducts.push(...result.maltose);
      hydrolysisProducts.push(...result.freeGlucose);
      reactionMixture = result.unhydrolyzedFragments;
    }

    // Append remaining limit dextrins to the product mixture
    hydrolysisProducts.push(...reactionMixture);

    return hydrolysisProducts;
  }

  /**
   * Evaluates whether the current temperature causes irreversible unfolding.
   * Near the denaturation threshold, damage becomes probabilistic.
   */
  #checkThermalDenaturation(): void {
    if (this.environment.temperatureC >= this.DENATURATION_THRESHOLD) {
      // Above threshold: denaturation is certain
      this.isDenatured = true;
    } else if (this.environment.temperatureC > this.OPTIMAL_TEMP) {
      // Between optimal and threshold: probabilistic damage
      const stressFactor = (this.environment.temperatureC - this.OPTIMAL_TEMP)
        / (this.DENATURATION_THRESHOLD - this.OPTIMAL_TEMP);
      if (Math.random() < stressFactor * 0.1) {
        this.isDenatured = true;
      }
    }
    // Below optimal: no damage, just reduced activity (handled by isActive)
  }

  /**
   * Validates that the substrate is a polysaccharide with sufficient monomer count
   * to contain internal α-1,4-glycosidic linkages.
   */
  #validateSubstrateSpecificity(substrate: Saccharide): Polysaccharide | null {
    if (!(substrate instanceof Polysaccharide)) return null;
    if (substrate.count < this.MIN_HYDROLYZABLE_COUNT) return null;
    return substrate;
  }

  /**
   * Checks whether any oligosaccharide in the reaction mixture is long enough
   * to contain a cleavable internal α-1,4-glycosidic bond.
   */
  #hasHydrolyzableSubstrate(mixture: Polysaccharide[]): boolean {
    return mixture.some(oligomer => oligomer.count > this.MIN_HYDROLYZABLE_COUNT);
  }

  /**
   * Executes one full catalytic cycle over the entire reaction mixture.
   * Each molecule is either hydrolyzed or released as a product.
   */
  #executeCatalyticCycle(mixture: Polysaccharide[]): { unhydrolyzedFragments: Polysaccharide[], maltose: Maltose[], freeGlucose: Glucose[] } {
    const unhydrolyzedFragments: Polysaccharide[] = [];
    const maltose: Maltose[] = [];
    const freeGlucose: Glucose[] = [];

    for (const oligomer of mixture) {
      const cycleResult = this.#processOligomer(oligomer);
      unhydrolyzedFragments.push(...cycleResult.remainingOligomers);
      maltose.push(...cycleResult.maltose);
      freeGlucose.push(...cycleResult.freeGlucose);
    }

    return { unhydrolyzedFragments, maltose, freeGlucose };
  }

  /**
   * Processes a single oligosaccharide molecule during a catalytic cycle.
   * Disaccharides are released as maltose; longer chains are hydrolyzed into fragments.
   */
  #processOligomer(oligomer: Polysaccharide): { remainingOligomers: Polysaccharide[], maltose: Maltose[], freeGlucose: Glucose[] } {
    if (oligomer.count === this.MIN_HYDROLYZABLE_COUNT) {
      return { remainingOligomers: [], maltose: [new Maltose()], freeGlucose: [] };
    }

    const [proximal, distal] = this.#cleaveGlycosidicBond(oligomer);
    const maltose: Maltose[] = [];
    const remainingOligomers: Polysaccharide[] = [];
    const freeGlucose: Glucose[] = [];

    this.#classifyFragment(proximal, maltose, remainingOligomers, freeGlucose);
    this.#classifyFragment(distal, maltose, remainingOligomers, freeGlucose);

    return { remainingOligomers, maltose, freeGlucose };
  }

  /**
   * Simulates endo-hydrolysis of a single α-1,4-glycosidic bond at a random
   * position within the oligosaccharide chain.
   *
   * The terms "proximal" and "distal" refer to the two resulting fragments
   * relative to the reducing end of the original chain.
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
   * The site is an integer between 1 and (count − 1), inclusive.
   */
  #selectRandomCleavageSite(chainCount: number): number {
    return Math.floor(Math.random() * (chainCount - 1)) + 1;
  }

  /**
   * Classifies a hydrolysis fragment as maltose, a remaining oligomer,
   * or a free glucose monomer.
   */
  #classifyFragment(
    fragment: Polysaccharide,
    maltose: Maltose[],
    remainingOligomers: Polysaccharide[],
    freeGlucose: Glucose[],
  ): void {
    if (fragment.count === this.MIN_HYDROLYZABLE_COUNT) {
      maltose.push(new Maltose());
    } else if (fragment.count > this.MIN_HYDROLYZABLE_COUNT) {
      remainingOligomers.push(fragment);
    } else {
      // n === 1 → free glucose monomer released from hydrolysis
      freeGlucose.push(fragment.monomers[0] as Glucose);
    }
  }
}
