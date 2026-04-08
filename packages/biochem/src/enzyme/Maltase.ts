import { BioMolecule } from "../BioMolecule";
import { Glucose } from "../saccharide/Glucose";
import { Maltose } from "../saccharide/Maltose";
import { Monosaccharide } from "../saccharide/Monosaccharide";
import { Saccharide } from "../saccharide/Saccharide";
import { ProteinChain } from "@atomika-lab/biochem";
import { Enzyme } from "./Enzyme";
import { Environment, PHYSIOLOGICAL_CONDITIONS } from "@atomika-lab/core";
import { ReactionMixture } from "@atomika-lab/biochem";
import { ReactionResult, type KineticSnapshot } from "@atomika-lab/biochem";
import { ReactionVessel, type EnzymeKinetics } from "@atomika-lab/biochem";
import { LawsOfPhysics } from "@atomika-lab/core";

/**
 * The Maltase enzyme.
 *
 * α-Glucosidase (EC 3.2.1.20) is an exohydrolase that cleaves the terminal
 * α-1,4-glycosidic bond of maltose, releasing two glucose monomers.
 */
export class Maltase extends Enzyme {
  /**
   * Optimal pH for maximal catalytic rate.
   * Intestinal maltase peaks near pH 6.0.
   */
  private readonly OPTIMAL_PH = 6.0;

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
   * Catalytic rate constant (k_cat) — maltose molecules hydrolyzed per second.
   */
  private readonly KCAT = 1.0;

  /**
   * Michaelis constant — substrate concentration at half Vmax.
   * Scaled to nanomolar range for single-molecule simulation.
   */
  private readonly KM = 1e-8;

  /**
   * Product inhibition constant — product concentration at half-maximal inhibition.
   * Scaled to micromolar range for single-molecule simulation.
   */
  private readonly KI = 1e-6;

  /**
   * Equilibrium constant — hydrolysis strongly favors products.
   */
  private readonly KEQ = 1e6;

  /**
   * Enthalpy of reaction (kJ/mol) — glycosidic bond hydrolysis is exothermic.
   */
  private readonly DELTA_H = -15;

  /**
   * Maximum simulation steps to prevent runaway loops.
   */
  private readonly MAX_SIMULATION_STEPS = 10000;

  /**
   * Permanent structural damage flag — once true, the enzyme can never recover.
   */
  isDenatured = false;

  constructor(protein: ProteinChain) {
    super(protein.sequence);
  }

  /**
   * Catalyzes the hydrolysis of maltose into two glucose monomers.
   *
   * Delegates kinetic calculations to the ReactionVessel and uses
   * the same time-stepped simulation model as Amylase.
   *
   * @param substrate The saccharide substrate (maltose or maltose-containing mixture).
   * @param environment Reaction conditions (temperature, pH, duration, solutes).
   * @returns ReactionResult containing the glucose products and kinetic history.
   */
  digest(substrate: BioMolecule, environment: Environment = PHYSIOLOGICAL_CONDITIONS): ReactionResult {
    const vessel = new ReactionVessel(environment);
    const kinetics: EnzymeKinetics = {
      kCat: this.KCAT,
      kM: this.KM,
      kI: this.KI,
      kEq: this.KEQ,
      deltaH: this.DELTA_H,
    };

    const maltoseSubstrate = this.#validateSubstrateSpecificity(substrate);
    if (!maltoseSubstrate) {
      return this.#emptyResult();
    }

    this.#checkThermalDenaturation(environment);
    if (this.isDenatured) {
      return this.#unreactedResult(maltoseSubstrate, environment);
    }

    const phActivity = this.#calculatePhActivity(environment.pH);
    if (phActivity === 0) {
      return this.#unreactedResult(maltoseSubstrate, environment);
    }

    const tempActivity = this.#calculateTempActivity(environment.temperatureC);
    if (tempActivity === 0) {
      return this.#unreactedResult(maltoseSubstrate, environment);
    }

    let reactionMixture: Maltose[] = [maltoseSubstrate];
    const productMixture = new ReactionMixture();
    let moleculesProcessed = 0;
    const totalSteps = Math.min(Math.ceil(environment.durationInSeconds), this.MAX_SIMULATION_STEPS);
    let currentTemp = environment.temperatureC;

    for (let step = 0; step < totalSteps; step++) {
      vessel.recordProgression(reactionMixture, productMixture, step, currentTemp);

      this.#checkThermalDenaturation(environment);
      if (this.isDenatured) break;
      if (reactionMixture.length === 0) break;

      const cleavageRate = vessel.calculateCleavageRate(kinetics, phActivity, tempActivity, [], productMixture);
      const moleculesThisStep = vessel.probabilisticBonds(cleavageRate);
      if (moleculesThisStep === 0) continue;

      const toProcess = Math.min(moleculesThisStep, reactionMixture.length);
      for (let i = 0; i < toProcess; i++) {
        reactionMixture.pop();
        productMixture.add([new Glucose(), new Glucose()]);
        moleculesProcessed++;
      }

      // Apply thermal drift from reaction enthalpy
      currentTemp += LawsOfPhysics.calculateThermalDrift(
        toProcess,
        this.DELTA_H,
        1e-15, // Default femtoliter-scale reaction vessel
      );
    }

    productMixture.add(reactionMixture);

    const remainingMass = reactionMixture.reduce((sum, m) => sum + m.molecularMass, 0);
    const initialCount = maltoseSubstrate.count;
    const conversionRate = initialCount > 0 ? moleculesProcessed / initialCount : 0;

    return new ReactionResult(
      productMixture,
      Math.min(conversionRate, 1),
      remainingMass,
      !this.isDenatured && this.#calculatePhActivity(environment.pH) > 0,
      vessel.getReactionPath(),
    );
  }

  #validateSubstrateSpecificity(substrate: BioMolecule): Maltose | null {
    if (!(substrate instanceof Maltose)) return null;
    return substrate;
  }

  #calculatePhActivity(ph: number): number {
    const deviation = ph - this.OPTIMAL_PH;
    const activity = Math.exp(-(deviation * deviation) / (2 * this.PH_TOLERANCE * this.PH_TOLERANCE));
    return activity < 0.01 ? 0 : activity;
  }

  #calculateTempActivity(temperatureC: number): number {
    if (temperatureC < 5) return 0;
    if (temperatureC >= this.DENATURATION_THRESHOLD) return 0;
    if (temperatureC <= this.OPTIMAL_TEMP) {
      return (temperatureC - 5) / (this.OPTIMAL_TEMP - 5);
    }
    return 1 - (temperatureC - this.OPTIMAL_TEMP) / (this.DENATURATION_THRESHOLD - this.OPTIMAL_TEMP);
  }

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

  #emptyResult(): ReactionResult {
    return new ReactionResult(new ReactionMixture(), 0, 0, false);
  }

  #unreactedResult(substrate: Maltose, environment: Environment): ReactionResult {
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
