import { Maltose } from "../saccharide/Maltose";
import { Dextrin } from "../saccharide/Dextrin";
import { Monosaccharide } from "../saccharide/Monosaccharide";
import { ProteinChain } from "../ProteinChain";
import { Enzyme } from "./Enzyme";
import { Saccharide } from "../saccharide/Saccharide";
import { Polysaccharide } from "../saccharide/Polysaccharide";
import { GlycosidicBondType } from "../saccharide/GlycosidicBondType";
import { Environment, PHYSIOLOGICAL_CONDITIONS } from "../Environment";
import { ReactionMixture } from "../ReactionMixture";
import { ReactionResult } from "../ReactionResult";

/**
 * The Amylase enzyme.
 *
 * α-Amylase (EC 3.2.1.1) is an endohydrolase that randomly cleaves
 * internal α-1,4-glycosidic bonds in polysaccharides such as amylose,
 * yielding maltose, free monosaccharides, and limit dextrins as end products.
 */
export class Amylase extends Enzyme {
  /**
   * Minimum monomer count for a fragment to contain a cleavable bond.
   * A disaccharide (n = 2) is the smallest hydrolyzable unit.
   */
  private readonly MIN_HYDROLYZABLE_COUNT = 2;

  /**
   * Optimal temperature for catalytic activity (°C).
   */
  private readonly OPTIMAL_TEMP = 37;

  /**
   * Temperature threshold for irreversible thermal denaturation (°C).
   */
  private readonly DENATURATION_THRESHOLD = 60;

  /**
   * Optimal pH for maximal catalytic rate.
   * Human salivary α-amylase peaks near pH 6.8.
   */
  private readonly OPTIMAL_PH = 6.8;

  /**
   * pH tolerance width — controls the breadth of the bell-shaped activity curve.
   * A narrower value produces a sharper peak around the optimal pH.
   */
  private readonly PH_TOLERANCE = 1.5;

  /**
   * Catalytic rate constant (k_cat) — bonds cleaved per enzyme molecule per second
   * under saturating substrate conditions at optimal pH and temperature.
   */
  private readonly KCAT = 0.5;

  /**
   * Michaelis constant. Substrate concentration at half Vmax.
   * Lower values indicate higher substrate affinity.
   */
  private readonly KM = 5;

  /**
   * Product inhibition constant. Product concentration at half-maximal inhibition.
   * Models competitive inhibition by maltose and monosaccharides at the active site.
   */
  private readonly KI = 200;

  /**
   * Permanent structural damage flag — once true, the enzyme can never recover.
   */
  isDenatured = false;

  constructor(protein: ProteinChain) {
    super(protein);
  }

  /**
   * Catalyzes the hydrolysis of α-1,4-glycosidic bonds in a polysaccharide substrate.
   *
   * The reaction follows Michaelis-Menten kinetics with competitive product inhibition
   * and a bell-shaped pH activity profile. Reaction extent is governed by duration.
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

    const initialBondCount = validatedSubstrate.cleavableBondCount;

    this.#checkThermalDenaturation(environment);
    if (this.isDenatured) {
      return this.#unreactedResult(validatedSubstrate, environment);
    }

    const phActivity = this.#calculatePhActivity(environment.pH);
    if (phActivity === 0) {
      return this.#unreactedResult(validatedSubstrate, environment);
    }

    const tempActivity = this.#calculateTempActivity(environment.temperatureC);
    if (tempActivity === 0) {
      return this.#unreactedResult(validatedSubstrate, environment);
    }

    let reactionMixture: Polysaccharide[] = [validatedSubstrate];
    const productMixture = new ReactionMixture();
    let bondsCleaved = 0;
    const totalSteps = Math.ceil(environment.durationInSeconds);

    for (let step = 0; step < totalSteps; step++) {
      this.#checkThermalDenaturation(environment);
      if (this.isDenatured) break;
      if (!this.#hasHydrolyzableSubstrate(reactionMixture)) break;

      const cleavageRate = this.#calculateCleavageRate(reactionMixture, productMixture, phActivity, tempActivity);
      const bondsThisStep = this.#probabilisticBonds(cleavageRate);
      if (bondsThisStep === 0) continue;

      const result = this.#executeCatalyticCycle(reactionMixture, bondsThisStep);
      productMixture.add(result.maltose);
      productMixture.add(result.freeMonosaccharides);
      bondsCleaved += result.bondsCleaved;
      reactionMixture = result.unhydrolyzedFragments;
    }

    productMixture.add(reactionMixture);

    const remainingMass = this.#totalMass(reactionMixture);
    const conversionRate = initialBondCount > 0 ? bondsCleaved / initialBondCount : 0;

    return new ReactionResult(
      productMixture,
      Math.min(conversionRate, 1),
      remainingMass,
      !this.isDenatured && this.#calculatePhActivity(environment.pH) > 0,
    );
  }

  // ── Kinetics Engine ──────────────────────────────────────────────

  /**
   * Calculates the effective bond cleavage rate (bonds/s) using
   * Michaelis-Menten kinetics with competitive product inhibition,
   * pH-dependent activity, and temperature-dependent activity.
   */
  #calculateCleavageRate(
    mixture: Polysaccharide[],
    products: ReactionMixture,
    phActivity: number,
    tempActivity: number,
  ): number {
    const substrateConcentration = this.#totalCleavableBonds(mixture);
    const productConcentration = products.speciesCount;

    const vmax = this.KCAT * phActivity * tempActivity;
    const inhibitionFactor = 1 + productConcentration / this.KI;
    return vmax * substrateConcentration / (this.KM * inhibitionFactor + substrateConcentration);
  }

  /**
   * Temperature activity curve — zero below 5°C, zero above denaturation threshold,
   * with a gradual rise between the optimal temperature and the threshold.
   */
  #calculateTempActivity(temperatureC: number): number {
    if (temperatureC < 5) return 0;
    if (temperatureC >= this.DENATURATION_THRESHOLD) return 0;
    if (temperatureC <= this.OPTIMAL_TEMP) {
      // Linear ramp from 5°C to optimal
      return (temperatureC - 5) / (this.OPTIMAL_TEMP - 5);
    }
    // Gradual decline from optimal to denaturation threshold
    return 1 - (temperatureC - this.OPTIMAL_TEMP) / (this.DENATURATION_THRESHOLD - this.OPTIMAL_TEMP);
  }

  /**
   * Converts a fractional cleavage rate into an integer bond count
   * using stochastic rounding.
   */
  #probabilisticBonds(rate: number): number {
    const base = Math.floor(rate);
    const remainder = rate - base;
    return Math.random() < remainder ? base + 1 : base;
  }

  /**
   * Bell-shaped pH activity curve centered at OPTIMAL_PH.
   * Returns a scaling factor between 0 and 1.
   * Activity drops to near-zero beyond ±3 pH units from optimum.
   */
  #calculatePhActivity(ph: number): number {
    const deviation = ph - this.OPTIMAL_PH;
    const activity = Math.exp(-(deviation * deviation) / (2 * this.PH_TOLERANCE * this.PH_TOLERANCE));
    return activity < 0.01 ? 0 : activity;
  }

  /**
   * Sums all cleavable glycosidic bonds across every molecule in the mixture.
   * A chain of n monomers contributes n − 1 bonds.
   */
  #totalCleavableBonds(mixture: Polysaccharide[]): number {
    let total = 0;
    for (const fragment of mixture) {
      total += fragment.cleavableBondCount;
    }
    return total;
  }

  /**
   * Sums the molecular mass of every molecule in the mixture.
   */
  #totalMass(mixture: Polysaccharide[]): number {
    let total = 0;
    for (const fragment of mixture) {
      total += fragment.molecularMass;
    }
    return total;
  }

  // ── Catalytic Cycle ──────────────────────────────────────────────

  /**
   * Executes one catalytic pass over the reaction mixture,
   * cleaving up to the specified number of glycosidic bonds.
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

      const result = this.#processOligomer(oligomer);
      unhydrolyzedFragments.push(...result.remainingOligomers);
      maltose.push(...result.maltose);
      freeMonosaccharides.push(...result.freeMonosaccharides);
      bondsCleaved += result.bondsCleaved;
    }

    return { unhydrolyzedFragments, maltose, freeMonosaccharides, bondsCleaved };
  }

  /**
   * Processes a single oligosaccharide during a catalytic cycle.
   * Disaccharides are released as maltose; longer chains are hydrolyzed.
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

    return { remainingOligomers, maltose, freeMonosaccharides, bondsCleaved: 1 };
  }

  /**
   * Simulates endo-hydrolysis of a single α-1,4-glycosidic bond
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
      freeMonosaccharides.push(fragment.monomers[0]);
    }
  }

  // ── Validation & State ───────────────────────────────────────────

  /**
   * Validates substrate specificity: the substrate must be a polysaccharide
   * with α-1,4-glycosidic bonds and sufficient chain length.
   */
  #validateSubstrateSpecificity(substrate: Saccharide): Polysaccharide | null {
    if (!(substrate instanceof Polysaccharide)) return null;
    if (substrate.bondType !== GlycosidicBondType.ALPHA_1_4) return null;
    if (substrate.count < this.MIN_HYDROLYZABLE_COUNT) return null;
    return substrate;
  }

  /**
   * Checks whether any fragment in the mixture contains cleavable bonds.
   */
  #hasHydrolyzableSubstrate(mixture: Polysaccharide[]): boolean {
    return mixture.some(oligomer => oligomer.count > this.MIN_HYDROLYZABLE_COUNT);
  }

  /**
   * Evaluates whether the current temperature causes irreversible unfolding.
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

  // ── Result Helpers ───────────────────────────────────────────────

  #emptyResult(): ReactionResult {
    return new ReactionResult(new ReactionMixture(), 0, 0, false);
  }

  #unreactedResult(substrate: Polysaccharide, environment: Environment): ReactionResult {
    const mixture = new ReactionMixture();
    mixture.add([substrate]);
    return new ReactionResult(
      mixture,
      0,
      substrate.molecularMass,
      !this.isDenatured && this.#calculatePhActivity(environment.pH) > 0,
    );
  }
}
