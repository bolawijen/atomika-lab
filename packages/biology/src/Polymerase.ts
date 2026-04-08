import { Enzyme, ProteinChain, AminoAcid, BioMolecule } from "@atomika-lab/biochem";
import { NucleicAcidChain } from "./NucleicAcidChain";
import { Nucleotide, NitrogenousBase, NucleicAcidType } from "./Nucleotide";
import { Environment, PHYSIOLOGICAL_CONDITIONS, Molecule } from "@atomika-lab/core";
import { ReactionMixture, ReactionResult, type KineticSnapshot, ReactionVessel, type EnzymeKinetics } from "@atomika-lab/biochem";
import { LawsOfPhysics } from "@atomika-lab/core";

/**
 * RNA Polymerase (EC 2.7.7.6).
 *
 * Catalyzes the transcription of a DNA template strand into a complementary
 * RNA chain by adding ribonucleotides in the 5'→3' direction.
 */
export class Polymerase extends Enzyme {
  /**
   * The active site where nucleotide addition occurs.
   * When occupied by a high-affinity ligand (e.g., Rifampicin),
   * substrate entry is blocked and transcription halts.
   */
  private activeSiteOccupant: Molecule | null = null;

  /**
   * Transcription error rate — probability of nucleotide substitution per base.
   * Natural RNA polymerase error rates are approximately 1 × 10⁻⁶.
   */
  private readonly ERROR_RATE = 1e-6;

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
  private readonly DELTA_H = -10;

  /**
   * Temperature threshold for thermal denaturation (°C).
   */
  private readonly DENATURATION_THRESHOLD = 65;

  /**
   * Maximum simulation steps.
   */
  private readonly MAX_SIMULATION_STEPS = 10000;

  /**
   * Permanent structural damage flag.
   */
  isDenatured = false;

  constructor(protein: ProteinChain) {
    super(protein.sequence);
  }

  /**
   * Transcribes a DNA template strand into a complementary RNA chain.
   *
   * @param substrate The DNA template strand.
   * @param environment Reaction conditions (temperature, pH, duration, solutes).
   * RNA transcript formed by complementary base pairing with the DNA template.
   */
  digest(substrate: BioMolecule, environment: Environment = PHYSIOLOGICAL_CONDITIONS): ReactionResult {
    // Active site occupied — transcription blocked
    if (this.activeSiteOccupant) {
      return this.#emptyResult();
    }

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
      vessel.recordProgression([], new ReactionMixture(), step, currentTemp);

      this.#checkThermalDenaturation(environment);
      if (this.isDenatured) break;
      if (nucleotidesAdded >= dnaTemplate.count) break;

      // Transcription proceeds at kCat rate for each nucleotide in the template
      const nucleotidesThisStep = vessel.probabilisticBonds(this.KCAT);
      if (nucleotidesThisStep === 0) continue;

      const toAdd = Math.min(nucleotidesThisStep, dnaTemplate.count - nucleotidesAdded);
      for (let i = 0; i < toAdd; i++) {
        const templateBase = dnaTemplate.sequence[nucleotidesAdded]!.base;
        let complementaryBase = this.#getComplementaryRNA(templateBase);

        // Transcription error: occasional nucleotide substitution
        if (Math.random() < this.ERROR_RATE) {
          complementaryBase = this.#randomSubstitution(complementaryBase);
        }

        rnaChain.push(new Nucleotide(complementaryBase, NucleicAcidType.RNA));
        nucleotidesAdded++;
      }

      currentTemp += LawsOfPhysics.calculateThermalDrift(toAdd, this.DELTA_H, 1e-15);
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
      vessel.getReactionPath(),
    );
  }

  #validateSubstrate(substrate: BioMolecule): NucleicAcidChain | null {
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

  /**
   * Introduces a random nucleotide substitution (mimicking transcription errors).
   */
  #randomSubstitution(correctBase: NitrogenousBase): NitrogenousBase {
    const bases = [
      NitrogenousBase.ADENINE,
      NitrogenousBase.URACIL,
      NitrogenousBase.CYTOSINE,
      NitrogenousBase.GUANINE,
    ];
    const wrongBases = bases.filter(b => b !== correctBase);
    return wrongBases[Math.floor(Math.random() * wrongBases.length)]!;
  }

  #checkThermalDenaturation(environment: Environment): void {
    if (environment.temperatureC >= this.DENATURATION_THRESHOLD) {
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

  /**
   * Binds a ligand (drug molecule) to the active site, blocking substrate entry.
   *
   * @param ligand The molecule binding to the active site.
   * @param affinity Binding affinity (lower = stronger binding, nM).
   */
  bindLigand(ligand: Molecule, affinity: number): void {
    // High-affinity ligands (low nM) effectively occupy the active site
    if (affinity < 10) {
      this.activeSiteOccupant = ligand;
    }
  }

  /**
   * Releases the current active site occupant, restoring catalytic activity.
   */
  releaseActiveSite(): void {
    this.activeSiteOccupant = null;
  }

  /**
   * Whether the active site is currently occupied.
   */
  isActiveSiteOccupied(): boolean {
    return this.activeSiteOccupant !== null;
  }
}
