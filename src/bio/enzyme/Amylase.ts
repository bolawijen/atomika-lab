import { Maltose } from "../saccharide/Maltose";
import { Dextrin } from "../saccharide/Dextrin";
import { Monosaccharide } from "../saccharide/Monosaccharide";
import { ProteinChain } from "../ProteinChain";
import { Enzyme } from "./Enzyme";
import { Saccharide } from "../saccharide/Saccharide";
import { Polysaccharide } from "../saccharide/Polysaccharide";
import { Environment, PHYSIOLOGICAL_CONDITIONS } from "../Environment";
import { ReactionMixture } from "../ReactionMixture";
import { ReactionResult } from "../ReactionResult";

/**
 * The Amylase enzyme.
 *
 * α-Amylase (EC 3.2.1.1) is an endohydrolase that randomly cleaves
 * internal α-1,4-glycosidic bonds in polysaccharides such as amylose,
 * yielding maltose, free glucose, and limit dextrins as end products.
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
   * Maximum catalytic turnover rate (bonds cleaved per second).
   * Represents Vmax under saturating substrate conditions.
   */
  private readonly VMAX = 100;

  /**
   * Michaelis constant (mM). Substrate concentration at half Vmax.
   * Lower values indicate higher substrate affinity.
   */
  private readonly KM = 5;

  /**
   * Permanent structural damage flag — once true, the enzyme can never recover.
   * The protein tertiary structure has undergone irreversible unfolding.
   */
  isDenatured = false;

  constructor(protein: ProteinChain) {
    super(protein);
  }

  /**
   * Biochemical activity state — whether the enzyme can currently perform catalysis.
   * Depends on environment: temperature, pH, and structural integrity.
   *
   * Unlike isDenatured, inactivity from suboptimal conditions is reversible.
   * If conditions return to the physiological range, the enzyme resumes catalysis.
   */
  #isEnvironmentActive(environment: Environment): boolean {
    // Irreversible denaturation — permanent structural loss
    if (this.isDenatured) return false;

    // Temperature window — catalytic rate drops below 5°C
    if (environment.temperatureC < 5) return false;
    if (environment.temperatureC > this.DENATURATION_THRESHOLD) return false;

    // pH window — α-amylase requires near-neutral pH (4–9)
    if (environment.pH < 4 || environment.pH > 9) return false;

    return true;
  }

  /**
   * Catalyzes the hydrolysis of α-1,4-glycosidic bonds in a polysaccharide substrate.
   *
   * The reaction follows Michaelis-Menten kinetics: the number of bonds cleaved
   * per cycle is limited by Vmax and the substrate concentration relative to Km.
   * Reaction extent is governed by the environment duration.
   *
   * @param substrate The polysaccharide substrate (e.g., amylose).
   * @param environment Reaction conditions (temperature, pH, duration).
   * @returns ReactionResult containing the product mixture and kinetic metadata.
   */
  digest(substrate: Saccharide, environment: Environment = PHYSIOLOGICAL_CONDITIONS): ReactionResult {
    const validatedSubstrate = this.#validateSubstrateSpecificity(substrate);
    if (!validatedSubstrate) {
      return this.#emptyResult();
    }

    const initialBondCount = validatedSubstrate.count - 1;
    let bondsCleaved = 0;

    // Check for immediate thermal denaturation
    this.#checkThermalDenaturation(environment);
    if (this.isDenatured) {
      return this.#unreactedResult(validatedSubstrate, environment);
    }

    if (!this.#isEnvironmentActive(environment)) {
      return this.#unreactedResult(validatedSubstrate, environment);
    }

    let reactionMixture: Polysaccharide[] = [validatedSubstrate];
    const productMixture = new ReactionMixture();

    // Calculate effective catalytic rate from Michaelis-Menten kinetics
    // v = Vmax * [S] / (Km + [S])
    // Approximate [S] as monomer count (higher count = more substrate)
    const substrateConcentration = validatedSubstrate.count;
    const effectiveRate = this.VMAX * substrateConcentration / (this.KM + substrateConcentration);

    // Total bonds that can be cleaved within the reaction duration
    const maxCleavages = Math.floor(effectiveRate * environment.durationInSeconds);
    let cleavageBudget = maxCleavages;

    while (cleavageBudget > 0 && this.#hasHydrolyzableSubstrate(reactionMixture)) {
      this.#checkThermalDenaturation(environment);
      if (this.isDenatured) break;

      const result = this.#executeCatalyticCycle(reactionMixture, cleavageBudget);
      productMixture.add(result.maltose);
      productMixture.add(result.freeMonosaccharides);
      bondsCleaved += result.bondsCleaved;
      cleavageBudget -= result.bondsCleaved;
      reactionMixture = result.unhydrolyzedFragments;
    }

    // Append remaining limit dextrins to the product mixture
    productMixture.add(reactionMixture);

    const remainingMass = reactionMixture.reduce((sum, frag) => sum + frag.molecularMass, 0);
    const conversionRate = initialBondCount > 0 ? bondsCleaved / initialBondCount : 0;

    return new ReactionResult(
      productMixture,
      Math.min(conversionRate, 1),
      remainingMass,
      !this.isDenatured && this.#isEnvironmentActive(environment),
    );
  }

  /**
   * Returns an empty reaction result for invalid or denatured reactions.
   */
  #emptyResult(): ReactionResult {
    return new ReactionResult(new ReactionMixture(), 0, 0, false);
  }

  /**
   * Returns the unreacted substrate when conditions prevent catalysis.
   */
  #unreactedResult(substrate: Polysaccharide, environment: Environment): ReactionResult {
    const mixture = new ReactionMixture();
    mixture.add([substrate]);
    return new ReactionResult(
      mixture,
      0,
      substrate.molecularMass,
      !this.isDenatured && this.#isEnvironmentActive(environment),
    );
  }

  /**
   * Evaluates whether the current temperature causes irreversible unfolding.
   * Near the denaturation threshold, damage becomes probabilistic.
   */
  #checkThermalDenaturation(environment: Environment): void {
    if (environment.temperatureC >= this.DENATURATION_THRESHOLD) {
      this.isDenatured = true;
    } else if (environment.temperatureC > this.OPTIMAL_TEMP) {
      const stressFactor = (environment.temperatureC - this.OPTIMAL_TEMP)
        / (this.DENATURATION_THRESHOLD - this.OPTIMAL_TEMP);
      if (Math.random() < stressFactor * 0.1) {
        this.isDenatured = true;
      }
    }
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
   * Executes one full catalytic cycle over the reaction mixture,
   * constrained by the remaining cleavage budget from Michaelis-Menten kinetics.
   */
  #executeCatalyticCycle(
    mixture: Polysaccharide[],
    budget: number,
  ): { unhydrolyzedFragments: Polysaccharide[], maltose: Maltose[], freeMonosaccharides: Monosaccharide[], bondsCleaved: number } {
    const unhydrolyzedFragments: Polysaccharide[] = [];
    const maltose: Maltose[] = [];
    const freeMonosaccharides: Monosaccharide[] = [];
    let bondsCleaved = 0;

    for (const oligomer of mixture) {
      if (bondsCleaved >= budget) {
        unhydrolyzedFragments.push(oligomer);
        continue;
      }

      const cycleResult = this.#processOligomer(oligomer);
      unhydrolyzedFragments.push(...cycleResult.remainingOligomers);
      maltose.push(...cycleResult.maltose);
      freeMonosaccharides.push(...cycleResult.freeMonosaccharides);
      bondsCleaved += cycleResult.bondsCleaved;
    }

    return { unhydrolyzedFragments, maltose, freeMonosaccharides, bondsCleaved };
  }

  /**
   * Processes a single oligosaccharide molecule during a catalytic cycle.
   * Disaccharides are released as maltose; longer chains are hydrolyzed into fragments.
   */
  #processOligomer(oligomer: Polysaccharide): { remainingOligomers: Polysaccharide[], maltose: Maltose[], freeMonosaccharides: Monosaccharide[], bondsCleaved: number } {
    if (oligomer.count === this.MIN_HYDROLYZABLE_COUNT) {
      return { remainingOligomers: [], maltose: [new Maltose()], freeMonosaccharides: [], bondsCleaved: 0 };
    }

    const [proximal, distal] = this.#cleaveGlycosidicBond(oligomer);
    const maltose: Maltose[] = [];
    const remainingOligomers: Polysaccharide[] = [];
    const freeMonosaccharides: Monosaccharide[] = [];

    this.#classifyFragment(proximal, maltose, remainingOligomers, freeMonosaccharides);
    this.#classifyFragment(distal, maltose, remainingOligomers, freeMonosaccharides);

    // One glycosidic bond was cleaved to produce these two fragments
    return { remainingOligomers, maltose, freeMonosaccharides, bondsCleaved: 1 };
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
   * or a free monosaccharide.
   *
   * The actual monomer instance from the fragment is preserved — no type casting.
   */
  #classifyFragment(
    fragment: Polysaccharide,
    maltose: Maltose[],
    remainingOligomers: Polysaccharide[],
    freeMonosaccharides: Monosaccharide[],
  ): void {
    if (fragment.count === this.MIN_HYDROLYZABLE_COUNT) {
      maltose.push(new Maltose());
    } else if (fragment.count > this.MIN_HYDROLYZABLE_COUNT) {
      remainingOligomers.push(fragment);
    } else {
      // n === 1 → free monosaccharide released from hydrolysis
      // Use the actual monomer instance from the fragment, no casting needed
      freeMonosaccharides.push(fragment.monomers[0]);
    }
  }
}
