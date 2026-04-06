import { ProteinChain } from "./ProteinChain";
import { Enzyme } from "./enzyme/Enzyme";
import { Saccharide } from "./saccharide/Saccharide";
import { NucleicAcidChain } from "./NucleicAcidChain";
import { Nucleotide, NitrogenousBase, NucleicAcidType } from "./Nucleotide";
import { Environment, PHYSIOLOGICAL_CONDITIONS } from "./Environment";
import { ReactionMixture } from "./ReactionMixture";
import { ReactionResult, KineticSnapshot } from "./ReactionResult";
import { ReactionVessel, EnzymeKinetics } from "./ReactionVessel";

/**
 * RNA Polymerase (EC 2.7.7.6).
 *
 * Catalyzes the transcription of a DNA template strand into a complementary
 * RNA chain by adding ribonucleotides in the 5'→3' direction.
 */
export class Polymerase extends Enzyme {
  /**
   * Catalytic rate constant — nucleotides added per second.
   */
  private readonly KCAT = 50;

  /**
   * Michaelis constant for nucleotide substrates.
   */
  private readonly KM = 1e-7;

  /**
   * Product inhibition constant.
   */
  private readonly KI = 1e-5;

  /**
   * Equilibrium constant — transcription strongly favors RNA synthesis.
   */
  private readonly KEQ = 1e5;

  /**
   * Enthalpy of phosphodiester bond formation (kJ/mol).
   */
  private readonly DELTA_H = -20;

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
   * Transcribes a DNA template strand into a complementary RNA chain.
   *
   * @param substrate The DNA template strand.
   * @param environment Reaction conditions (temperature, pH, duration, solutes).
   * @returns ReactionResult containing the synthesized RNA and kinetic history.
   */
  digest(substrate: Saccharide, environment: Environment = PHYSIOLOGICAL_CONDITIONS): ReactionResult {
    const dnaTemplate = this.#validateSubstrate(substrate);
    if (!dnaTemplate) {
      return this.#emptyResult();
    }

    this.#checkThermalDenaturation(environment);
    if (this.isDenatured) {
      return this.#unreactedResult(dnaTemplate, environment);
    }

    const vessel = new ReactionVessel(environment);
    const kinetics: EnzymeKinetics = {
      kCat: this.KCAT,
      kM: this.KM,
      kI: this.KI,
      kEq: this.KEQ,
      deltaH: this.DELTA_H,
    };

    let rnaChain: Nucleotide[] = [];
    let nucleotidesAdded = 0;
    const totalSteps = Math.min(Math.ceil(environment.durationInSeconds), this.MAX_SIMULATION_STEPS);
    let currentTemp = environment.temperatureC;

    for (let step = 0; step < totalSteps; step++) {
      vessel.recordSnapshot([], new ReactionMixture(), step, currentTemp);

      this.#checkThermalDenaturation(environment);
      if (this.isDenatured) break;
      if (nucleotidesAdded >= dnaTemplate.count) break;

      // Transcription proceeds at kCat rate for each nucleotide in the template
      const nucleotidesThisStep = vessel.probabilisticBonds(this.KCAT);
      if (nucleotidesThisStep === 0) continue;

      const toAdd = Math.min(nucleotidesThisStep, dnaTemplate.count - nucleotidesAdded);
      for (let i = 0; i < toAdd; i++) {
        const templateBase = dnaTemplate.sequence[nucleotidesAdded].base;
        const complementaryBase = this.#getComplementaryRNA(templateBase);
        rnaChain.push(new Nucleotide(complementaryBase, NucleicAcidType.RNA));
        nucleotidesAdded++;
      }

      currentTemp += this.#calculateThermalDrift(toAdd, this.DELTA_H);
    }

    const productMixture = new ReactionMixture();
    if (rnaChain.length > 0) {
      productMixture.add([new NucleicAcidChain(rnaChain)]);
    }

    const remainingMass = dnaTemplate.molecularMass;
    const conversionRate = dnaTemplate.count > 0 ? nucleotidesAdded / dnaTemplate.count : 0;

    return new ReactionResult(
      productMixture,
      Math.min(conversionRate, 1),
      remainingMass,
      !this.isDenatured,
      vessel.getHistory(),
    );
  }

  #validateSubstrate(substrate: Saccharide): NucleicAcidChain | null {
    if (!(substrate instanceof NucleicAcidChain)) return null;
    if (substrate.type !== NucleicAcidType.DNA) return null;
    return substrate;
  }

  #getComplementaryRNA(dnaBase: NitrogenousBase): NitrogenousBase {
    switch (dnaBase) {
      case NitrogenousBase.ADENINE: return NitrogenousBase.URACIL;
      case NitrogenousBase.THYMINE: return NitrogenousBase.ADENINE;
      case NitrogenousBase.CYTOSINE: return NitrogenousBase.GUANINE;
      case NitrogenousBase.GUANINE: return NitrogenousBase.CYTOSINE;
      default: return NitrogenousBase.ADENINE;
    }
  }

  #calculateThermalDrift(bondsFormed: number, deltaH: number): number {
    const waterMass = 1e-15 * 1000;
    const specificHeat = 4.184;
    const energyJoules = bondsFormed * Math.abs(deltaH) * 1000 / 6.022e23;
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

  #unreactedResult(substrate: NucleicAcidChain, environment: Environment): ReactionResult {
    const mixture = new ReactionMixture();
    mixture.add([substrate]);
    return new ReactionResult(mixture, 0, substrate.molecularMass, !this.isDenatured);
  }
}
