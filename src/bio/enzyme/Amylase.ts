import { ProteinChain } from "../ProteinChain";
import { Enzyme } from "./Enzyme";
import { Saccharide } from "../saccharide/Saccharide";
import { Polysaccharide } from "../saccharide/Polysaccharide";
import { GlycosidicBondType } from "../saccharide/GlycosidicBondType";
import { Environment, PHYSIOLOGICAL_CONDITIONS } from "../Environment";
import { ReactionMixture } from "../ReactionMixture";
import { ReactionResult, KineticSnapshot } from "../ReactionResult";
import { KineticsSimulator, KineticParameters } from "./KineticsSimulator";
import { HydrolysisMechanism, HydrolysisResult } from "./HydrolysisMechanism";

/**
 * The Amylase enzyme.
 *
 * α-Amylase (EC 3.2.1.1) is an endohydrolase that randomly cleaves
 * internal α-1,4-glycosidic bonds in polysaccharides such as amylose,
 * yielding maltose, free monosaccharides, and limit dextrins as end products.
 *
 * This class serves as a configuration entity — it stores kinetic parameters
 * and delegates the simulation to KineticsSimulator and HydrolysisMechanism.
 */
export class Amylase extends Enzyme {
  /**
   * Optimal pH for maximal catalytic rate.
   * Human salivary α-amylase peaks near pH 6.8.
   */
  private readonly OPTIMAL_PH = 6.8;

  /**
   * pH tolerance width — controls the breadth of the bell-shaped activity curve.
   */
  private readonly PH_TOLERANCE = 1.5;

  /**
   * Optimal temperature for catalytic activity (°C).
   */
  private readonly OPTIMAL_TEMP = 37;

  /**
   * Temperature threshold for irreversible thermal denaturation (°C).
   */
  private readonly DENATURATION_THRESHOLD = 60;

  /**
   * Catalytic rate constant (k_cat) — bonds cleaved per enzyme molecule per second
   * under saturating substrate conditions at optimal pH and temperature.
   */
  private readonly KCAT = 0.5;

  /**
   * Michaelis constant — substrate concentration at half Vmax.
   */
  private readonly KM = 5;

  /**
   * Product inhibition constant — product concentration at half-maximal inhibition.
   */
  private readonly KI = 200;

  /**
   * Maximum simulation steps to prevent runaway loops.
   */
  private readonly MAX_SIMULATION_STEPS = 10000;

  /**
   * Permanent structural damage flag — once true, the enzyme can never recover.
   */
  isDenatured = false;

  private readonly kinetics = new KineticsSimulator();
  private readonly mechanism = new HydrolysisMechanism();

  constructor(protein: ProteinChain) {
    super(protein);
  }

  /**
   * Catalyzes the hydrolysis of α-1,4-glycosidic bonds in a polysaccharide substrate.
   *
   * Delegates time-stepping and rate calculation to KineticsSimulator,
   * and bond cleavage/fragment classification to HydrolysisMechanism.
   *
   * @param substrate The polysaccharide substrate (e.g., amylose).
   * @param environment Reaction conditions (temperature, pH, duration).
   * @returns ReactionResult containing the product mixture, kinetic history, and metadata.
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

    const parameters: KineticParameters = {
      kCat: this.KCAT,
      kM: this.KM,
      kI: this.KI,
      phActivity,
      tempActivity,
      maxSteps: this.MAX_SIMULATION_STEPS,
    };

    return this.#runSimulation(validatedSubstrate, parameters, environment, initialBondCount);
  }

  /**
   * Executes the time-stepped hydrolysis simulation using the delegated components.
   */
  #runSimulation(
    substrate: Polysaccharide,
    parameters: KineticParameters,
    environment: Environment,
    initialBondCount: number,
  ): ReactionResult {
    let reactionMixture: Polysaccharide[] = [substrate];
    const productMixture = new ReactionMixture();
    let bondsCleaved = 0;
    const history: KineticSnapshot[] = [];
    const totalSteps = Math.min(Math.ceil(environment.durationInSeconds), parameters.maxSteps);

    for (let step = 0; step < totalSteps; step++) {
      history.push(this.kinetics.recordSnapshot(reactionMixture, productMixture, step));

      this.#checkThermalDenaturation(environment);
      if (this.isDenatured) break;
      if (!this.#hasHydrolyzableSubstrate(reactionMixture)) break;

      const cleavageRate = this.kinetics.calculateCleavageRate(parameters, reactionMixture, productMixture);
      const bondsThisStep = this.kinetics.probabilisticBonds(cleavageRate);
      if (bondsThisStep === 0) continue;

      const result = this.mechanism.execute(reactionMixture, bondsThisStep);
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
      history,
    );
  }

  // ── Activity Curves ──────────────────────────────────────────────

  /**
   * Bell-shaped pH activity curve centered at OPTIMAL_PH.
   */
  #calculatePhActivity(ph: number): number {
    const deviation = ph - this.OPTIMAL_PH;
    const activity = Math.exp(-(deviation * deviation) / (2 * this.PH_TOLERANCE * this.PH_TOLERANCE));
    return activity < 0.01 ? 0 : activity;
  }

  /**
   * Temperature activity curve — zero below 5°C, zero above denaturation threshold.
   */
  #calculateTempActivity(temperatureC: number): number {
    if (temperatureC < 5) return 0;
    if (temperatureC >= this.DENATURATION_THRESHOLD) return 0;
    if (temperatureC <= this.OPTIMAL_TEMP) {
      return (temperatureC - 5) / (this.OPTIMAL_TEMP - 5);
    }
    return 1 - (temperatureC - this.OPTIMAL_TEMP) / (this.DENATURATION_THRESHOLD - this.OPTIMAL_TEMP);
  }

  // ── Validation & State ───────────────────────────────────────────

  /**
   * Validates substrate specificity: the substrate must be a polysaccharide
   * with α-1,4-glycosidic bonds and sufficient chain length.
   */
  #validateSubstrateSpecificity(substrate: Saccharide): Polysaccharide | null {
    if (!(substrate instanceof Polysaccharide)) return null;
    if (substrate.bondType !== GlycosidicBondType.ALPHA_1_4) return null;
    if (substrate.count < 2) return null;
    return substrate;
  }

  /**
   * Checks whether any fragment in the mixture contains cleavable bonds.
   */
  #hasHydrolyzableSubstrate(mixture: Polysaccharide[]): boolean {
    return mixture.some(oligomer => oligomer.count > 2);
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

  #totalMass(mixture: Polysaccharide[]): number {
    let total = 0;
    for (const fragment of mixture) {
      total += fragment.molecularMass;
    }
    return total;
  }
}
