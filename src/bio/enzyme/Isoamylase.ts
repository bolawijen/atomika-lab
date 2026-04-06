import { Glucose } from "../saccharide/Glucose";
import { Dextrin } from "../saccharide/Dextrin";
import { Monosaccharide } from "../saccharide/Monosaccharide";
import { ProteinChain } from "../ProteinChain";
import { Enzyme } from "./Enzyme";
import { Saccharide } from "../saccharide/Saccharide";
import { Polysaccharide } from "../saccharide/Polysaccharide";
import { GlycosidicBondType } from "../saccharide/GlycosidicBondType";
import { Environment, PHYSIOLOGICAL_CONDITIONS } from "../Environment";
import { ReactionMixture } from "../ReactionMixture";
import { ReactionResult, KineticSnapshot } from "../ReactionResult";
import { ReactionVessel, EnzymeKinetics } from "../ReactionVessel";

/**
 * Isoamylase (EC 3.2.1.68) — a debranching enzyme.
 *
 * Specifically hydrolyzes α-1,6-glycosidic bonds at branch points in
 * amylopectin and glycogen, converting branched polysaccharides into
 * linear chains that can be fully digested by α-amylase.
 */
export class Isoamylase extends Enzyme {
  /**
   * Catalytic rate constant — branch points cleaved per second.
   */
  private readonly KCAT = 0.3;

  /**
   * Michaelis constant — scaled for single-molecule simulation.
   */
  private readonly KM = 1e-8;

  /**
   * Product inhibition constant.
   */
  private readonly KI = 1e-6;

  /**
   * Equilibrium constant — debranching strongly favors products.
   */
  private readonly KEQ = 1e6;

  /**
   * Enthalpy of reaction (kJ/mol).
   */
  private readonly DELTA_H = -15;

  /**
   * Maximum simulation steps.
   */
  private readonly MAX_SIMULATION_STEPS = 10000;

  /**
   * Permanent structural damage flag.
   */
  isDenatured = false;

  constructor(protein: ProteinChain) {
    super(protein);
  }

  /**
   * Hydrolyzes α-1,6-glycosidic bonds at branch points,
   * converting branched polysaccharides into linear chains.
   *
   * @param substrate The branched polysaccharide (e.g., amylopectin).
   * @param environment Reaction conditions (temperature, pH, duration).
   * @returns ReactionResult containing linearized polysaccharide products.
   */
  digest(substrate: Saccharide, environment: Environment = PHYSIOLOGICAL_CONDITIONS): ReactionResult {
    const validatedSubstrate = this.#validateSubstrateSpecificity(substrate);
    if (!validatedSubstrate) {
      return this.#emptyResult();
    }

    this.#checkThermalDenaturation(environment);
    if (this.isDenatured) {
      return this.#unreactedResult(validatedSubstrate, environment);
    }

    const vessel = new ReactionVessel(environment);
    const kinetics: EnzymeKinetics = {
      kCat: this.KCAT,
      kM: this.KM,
      kI: this.KI,
      kEq: this.KEQ,
      deltaH: this.DELTA_H,
    };

    let reactionMixture: Polysaccharide[] = [validatedSubstrate];
    const productMixture = new ReactionMixture();
    let branchesCleaved = 0;
    const totalSteps = Math.min(Math.ceil(environment.durationInSeconds), this.MAX_SIMULATION_STEPS);
    let currentTemp = environment.temperatureC;

    for (let step = 0; step < totalSteps; step++) {
      vessel.recordSnapshot(reactionMixture, productMixture, step, currentTemp);

      this.#checkThermalDenaturation(environment);
      if (this.isDenatured) break;
      if (!this.#hasBranchPoints(reactionMixture)) break;

      const cleavageRate = vessel.calculateCleavageRate(kinetics, 1, 1, reactionMixture, productMixture);
      const branchesThisStep = vessel.probabilisticBonds(cleavageRate);
      if (branchesThisStep === 0) continue;

      const result = this.#executeDebranching(reactionMixture, branchesThisStep);
      productMixture.add(result.linearized);
      branchesCleaved += result.branchesCleaved;
      reactionMixture = result.remaining;

      currentTemp += this.#calculateThermalDrift(result.branchesCleaved, this.DELTA_H);
    }

    productMixture.add(reactionMixture);

    const remainingMass = this.#totalMass(reactionMixture);
    const initialBranches = this.#countTotalBranches([validatedSubstrate]);
    const conversionRate = initialBranches > 0 ? branchesCleaved / initialBranches : 0;

    return new ReactionResult(
      productMixture,
      Math.min(conversionRate, 1),
      remainingMass,
      !this.isDenatured,
      vessel.getHistory(),
    );
  }

  /**
   * Validates that the substrate is a branched polysaccharide with α-1,6 linkages.
   */
  #validateSubstrateSpecificity(substrate: Saccharide): Polysaccharide | null {
    if (!(substrate instanceof Polysaccharide)) return null;
    if (substrate.branchCount === 0) return null;
    return substrate;
  }

  /**
   * Checks whether any molecule in the mixture contains branch points.
   */
  #hasBranchPoints(mixture: Polysaccharide[]): boolean {
    return mixture.some(m => m.branchCount > 0);
  }

  /**
   * Counts total branch points across all molecules in the mixture.
   */
  #countTotalBranches(mixture: Polysaccharide[]): number {
    return mixture.reduce((sum, m) => sum + m.branchCount, 0);
  }

  /**
   * Executes debranching by cleaving α-1,6 linkages and converting
   * branched polysaccharides into linear chains.
   */
  #executeDebranching(
    mixture: Polysaccharide[],
    budget: number,
  ): { linearized: Polysaccharide[], remaining: Polysaccharide[], branchesCleaved: number } {
    const linearized: Polysaccharide[] = [];
    const remaining: Polysaccharide[] = [];
    let branchesCleaved = 0;

    for (const molecule of mixture) {
      if (branchesCleaved >= budget) {
        remaining.push(molecule);
        continue;
      }

      if (molecule.branchCount > 0) {
        // Remove one branch point, convert to linear chain
        const remainingBranches = molecule.branchPoints.slice(1);
        const linearChain = new Dextrin([...molecule.monomers]);
        // Note: Dextrin is linear, so no branch points passed
        linearized.push(linearChain);
        branchesCleaved++;
      } else {
        remaining.push(molecule);
      }
    }

    return { linearized, remaining, branchesCleaved };
  }

  #calculateThermalDrift(bondsCleaved: number, deltaH: number): number {
    const waterMass = 1e-15 * 1000;
    const specificHeat = 4.184;
    const energyJoules = bondsCleaved * Math.abs(deltaH) * 1000 / 6.022e23;
    const temperatureChange = energyJoules / (waterMass * specificHeat);
    return deltaH < 0 ? temperatureChange : -temperatureChange;
  }

  #checkThermalDenaturation(environment: Environment): void {
    if (environment.temperatureC >= 60) {
      this.isDenatured = true;
    }
  }

  #emptyResult(): ReactionResult {
    return new ReactionResult(new ReactionMixture(), 0, 0, false);
  }

  #unreactedResult(substrate: Polysaccharide, environment: Environment): ReactionResult {
    const mixture = new ReactionMixture();
    mixture.add([substrate]);
    return new ReactionResult(mixture, 0, substrate.molecularMass, !this.isDenatured);
  }

  #totalMass(mixture: Polysaccharide[]): number {
    let total = 0;
    for (const fragment of mixture) {
      total += fragment.molecularMass;
    }
    return total;
  }
}
