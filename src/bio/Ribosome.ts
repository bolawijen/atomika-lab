import { AminoAcid } from "./AminoAcid";
import { ProteinChain } from "./ProteinChain";
import { NucleicAcidChain } from "./NucleicAcidChain";
import { Nucleotide, NitrogenousBase } from "./Nucleotide";
import { Environment, PHYSIOLOGICAL_CONDITIONS } from "../core/Environment";
import { ReactionMixture } from "../core/ReactionMixture";
import { ReactionResult, KineticSnapshot } from "../core/ReactionResult";
import { ReactionVessel, EnzymeKinetics } from "../core/ReactionVessel";
import { ELEMENTS } from "../Element";

/**
 * Standard genetic code — maps RNA codons (triplets) to amino acids.
 */
const GENETIC_CODE: ReadonlyMap<string, { name: string; threeLetter: string; oneLetter: string; composition: Map<any, number> }> = new Map([
  // Phenylalanine
  ["UUU", { name: "Phenylalanine", threeLetter: "Phe", oneLetter: "F", composition: new Map() }],
  ["UUC", { name: "Phenylalanine", threeLetter: "Phe", oneLetter: "F", composition: new Map() }],
  // Leucine
  ["UUA", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map() }],
  ["UUG", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map() }],
  ["CUU", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map() }],
  ["CUC", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map() }],
  ["CUA", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map() }],
  ["CUG", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map() }],
  // Isoleucine
  ["AUU", { name: "Isoleucine", threeLetter: "Ile", oneLetter: "I", composition: new Map() }],
  ["AUC", { name: "Isoleucine", threeLetter: "Ile", oneLetter: "I", composition: new Map() }],
  ["AUA", { name: "Isoleucine", threeLetter: "Ile", oneLetter: "I", composition: new Map() }],
  // Methionine (Start)
  ["AUG", { name: "Methionine", threeLetter: "Met", oneLetter: "M", composition: new Map() }],
  // Valine
  ["GUU", { name: "Valine", threeLetter: "Val", oneLetter: "V", composition: new Map() }],
  ["GUC", { name: "Valine", threeLetter: "Val", oneLetter: "V", composition: new Map() }],
  ["GUA", { name: "Valine", threeLetter: "Val", oneLetter: "V", composition: new Map() }],
  ["GUG", { name: "Valine", threeLetter: "Val", oneLetter: "V", composition: new Map() }],
  // Serine
  ["UCU", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map() }],
  ["UCC", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map() }],
  ["UCA", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map() }],
  ["UCG", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map() }],
  ["AGU", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map() }],
  ["AGC", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map() }],
  // Proline
  ["CCU", { name: "Proline", threeLetter: "Pro", oneLetter: "P", composition: new Map() }],
  ["CCC", { name: "Proline", threeLetter: "Pro", oneLetter: "P", composition: new Map() }],
  ["CCA", { name: "Proline", threeLetter: "Pro", oneLetter: "P", composition: new Map() }],
  ["CCG", { name: "Proline", threeLetter: "Pro", oneLetter: "P", composition: new Map() }],
  // Threonine
  ["ACU", { name: "Threonine", threeLetter: "Thr", oneLetter: "T", composition: new Map() }],
  ["ACC", { name: "Threonine", threeLetter: "Thr", oneLetter: "T", composition: new Map() }],
  ["ACA", { name: "Threonine", threeLetter: "Thr", oneLetter: "T", composition: new Map() }],
  ["ACG", { name: "Threonine", threeLetter: "Thr", oneLetter: "T", composition: new Map() }],
  // Alanine
  ["GCU", { name: "Alanine", threeLetter: "Ala", oneLetter: "A", composition: new Map() }],
  ["GCC", { name: "Alanine", threeLetter: "Ala", oneLetter: "A", composition: new Map() }],
  ["GCA", { name: "Alanine", threeLetter: "Ala", oneLetter: "A", composition: new Map() }],
  ["GCG", { name: "Alanine", threeLetter: "Ala", oneLetter: "A", composition: new Map() }],
  // Tyrosine
  ["UAU", { name: "Tyrosine", threeLetter: "Tyr", oneLetter: "Y", composition: new Map() }],
  ["UAC", { name: "Tyrosine", threeLetter: "Tyr", oneLetter: "Y", composition: new Map() }],
  // Histidine
  ["CAU", { name: "Histidine", threeLetter: "His", oneLetter: "H", composition: new Map() }],
  ["CAC", { name: "Histidine", threeLetter: "His", oneLetter: "H", composition: new Map() }],
  // Glutamine
  ["CAA", { name: "Glutamine", threeLetter: "Gln", oneLetter: "Q", composition: new Map() }],
  ["CAG", { name: "Glutamine", threeLetter: "Gln", oneLetter: "Q", composition: new Map() }],
  // Asparagine
  ["AAU", { name: "Asparagine", threeLetter: "Asn", oneLetter: "N", composition: new Map() }],
  ["AAC", { name: "Asparagine", threeLetter: "Asn", oneLetter: "N", composition: new Map() }],
  // Lysine
  ["AAA", { name: "Lysine", threeLetter: "Lys", oneLetter: "K", composition: new Map() }],
  ["AAG", { name: "Lysine", threeLetter: "Lys", oneLetter: "K", composition: new Map() }],
  // Aspartic Acid
  ["GAU", { name: "Aspartic Acid", threeLetter: "Asp", oneLetter: "D", composition: new Map() }],
  ["GAC", { name: "Aspartic Acid", threeLetter: "Asp", oneLetter: "D", composition: new Map() }],
  // Glutamic Acid
  ["GAA", { name: "Glutamic Acid", threeLetter: "Glu", oneLetter: "E", composition: new Map() }],
  ["GAG", { name: "Glutamic Acid", threeLetter: "Glu", oneLetter: "E", composition: new Map() }],
  // Cysteine
  ["UGU", { name: "Cysteine", threeLetter: "Cys", oneLetter: "C", composition: new Map() }],
  ["UGC", { name: "Cysteine", threeLetter: "Cys", oneLetter: "C", composition: new Map() }],
  // Tryptophan
  ["UGG", { name: "Tryptophan", threeLetter: "Trp", oneLetter: "W", composition: new Map() }],
  // Arginine
  ["CGU", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map() }],
  ["CGC", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map() }],
  ["CGA", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map() }],
  ["CGG", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map() }],
  ["AGA", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map() }],
  ["AGG", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map() }],
  // Glycine
  ["GGU", { name: "Glycine", threeLetter: "Gly", oneLetter: "G", composition: new Map() }],
  ["GGC", { name: "Glycine", threeLetter: "Gly", oneLetter: "G", composition: new Map() }],
  ["GGA", { name: "Glycine", threeLetter: "Gly", oneLetter: "G", composition: new Map() }],
  ["GGG", { name: "Glycine", threeLetter: "Gly", oneLetter: "G", composition: new Map() }],
  // Stop codons
  ["UAA", { name: "Stop", threeLetter: "Stop", oneLetter: "*", composition: new Map() }],
  ["UAG", { name: "Stop", threeLetter: "Stop", oneLetter: "*", composition: new Map() }],
  ["UGA", { name: "Stop", threeLetter: "Stop", oneLetter: "*", composition: new Map() }],
]);

/**
 * The Ribosome — a molecular machine that translates RNA into protein.
 *
 * Reads an mRNA template in codon triplets and assembles the corresponding
 * amino acid chain according to the standard genetic code.
 */
export class Ribosome {
  /**
   * Translation rate — amino acids added per second.
   */
  private readonly KCAT = 20;

  /**
   * Translation error rate — probability of amino acid misincorporation per codon.
   * Natural ribosome error rates are approximately 1 × 10⁻⁴.
   */
  private readonly ERROR_RATE = 1e-4;

  /**
   * ATP molecules consumed per peptide bond formed.
   * Each amino acid requires 2 ATP (activation) + 1 GTP (elongation) ≈ 3 high-energy bonds.
   */
  private readonly ATP_PER_PEPTIDE_BOND = 3;

  /**
   * Folding time — seconds required for chaperone-assisted protein folding
   * before the enzyme reaches full activity.
   */
  private readonly FOLDING_TIME_SECONDS = 30;

  /**
   * Michaelis constant for aminoacyl-tRNA substrates.
   */
  private readonly KM = 1e-7;

  /**
   * Product inhibition constant.
   */
  private readonly KI = 1e-5;

  /**
   * Equilibrium constant — translation strongly favors peptide bond formation.
   */
  private readonly KEQ = 1e6;

  /**
   * Enthalpy of peptide bond formation (kJ/mol).
   */
  private readonly DELTA_H = -10;

  /**
   * Maximum simulation steps.
   */
  private readonly MAX_SIMULATION_STEPS = 10000;

  /**
   * Translates an mRNA template into a polypeptide chain.
   *
   * @param mrna The messenger RNA template.
   * @param environment Reaction conditions (temperature, pH, duration).
   * @returns ReactionResult containing the synthesized protein chain.
   */
  translate(mrna: NucleicAcidChain, environment: Environment = PHYSIOLOGICAL_CONDITIONS): ReactionResult {
    const vessel = new ReactionVessel(environment);
    const kinetics: EnzymeKinetics = {
      kCat: this.KCAT,
      kM: this.KM,
      kI: this.KI,
      kEq: this.KEQ,
      deltaH: this.DELTA_H,
    };

    const aminoAcids: AminoAcid[] = [];
    let codonsTranslated = 0;
    const totalCodons = Math.floor(mrna.count / 3);
    const totalSteps = Math.min(Math.ceil(environment.durationInSeconds), this.MAX_SIMULATION_STEPS);
    let currentTemp = environment.temperatureC;

    for (let step = 0; step < totalSteps; step++) {
      vessel.recordProgression([], new ReactionMixture(), step, currentTemp);

      if (codonsTranslated >= totalCodons) break;

      // Translation proceeds at kCat rate for each codon
      const codonsThisStep = vessel.probabilisticBonds(this.KCAT);
      if (codonsThisStep === 0) continue;

      const toTranslate = Math.min(codonsThisStep, totalCodons - codonsTranslated);
      for (let i = 0; i < toTranslate; i++) {
        const codonStart = codonsTranslated * 3;
        const codon = mrna.sequence
          .slice(codonStart, codonStart + 3)
          .map(n => n.base)
          .join("");

        let aminoAcidInfo = GENETIC_CODE.get(codon);

        // Translation error: occasional amino acid misincorporation
        if (aminoAcidInfo && aminoAcidInfo.oneLetter !== "*" && Math.random() < this.ERROR_RATE) {
          aminoAcidInfo = this.#randomMisincorporation(aminoAcidInfo);
        }

        if (!aminoAcidInfo || aminoAcidInfo.oneLetter === "*") break;

        const aa = new AminoAcid(
          aminoAcidInfo.name,
          aminoAcidInfo.threeLetter,
          aminoAcidInfo.oneLetter,
          this.#getAminoAcidComposition(aminoAcidInfo.name),
        );
        aminoAcids.push(aa);
        codonsTranslated++;
      }

      currentTemp += this.#calculateThermalDrift(toTranslate, this.DELTA_H);
    }

    const productMixture = new ReactionMixture();
    if (aminoAcids.length > 0) {
      productMixture.add([new ProteinChain(aminoAcids)]);
    }

    const conversionRate = totalCodons > 0 ? codonsTranslated / totalCodons : 0;

    return new ReactionResult(
      productMixture,
      Math.min(conversionRate, 1),
      0,
      true,
      vessel.getReactionPath(),
    );
  }

  #getAminoAcidComposition(name: string): Map<any, number> {
    // Simplified compositions for common amino acids
    const compositions: Record<string, [any, number][]> = {
      "Alanine": [[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 2]],
      "Lysine": [[ELEMENTS.C, 6], [ELEMENTS.H, 14], [ELEMENTS.N, 2], [ELEMENTS.O, 2]],
      "Aspartic Acid": [[ELEMENTS.C, 4], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 4]],
      "Methionine": [[ELEMENTS.C, 5], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 2], [ELEMENTS.S, 1]],
      "Glycine": [[ELEMENTS.C, 2], [ELEMENTS.H, 5], [ELEMENTS.N, 1], [ELEMENTS.O, 2]],
      "Serine": [[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 3]],
      "Leucine": [[ELEMENTS.C, 6], [ELEMENTS.H, 13], [ELEMENTS.N, 1], [ELEMENTS.O, 2]],
      "Valine": [[ELEMENTS.C, 5], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 2]],
      "Proline": [[ELEMENTS.C, 5], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 2]],
      "Threonine": [[ELEMENTS.C, 4], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 3]],
      "Phenylalanine": [[ELEMENTS.C, 9], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 2]],
      "Tyrosine": [[ELEMENTS.C, 9], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 3]],
      "Tryptophan": [[ELEMENTS.C, 11], [ELEMENTS.H, 12], [ELEMENTS.N, 2], [ELEMENTS.O, 2]],
      "Histidine": [[ELEMENTS.C, 6], [ELEMENTS.H, 9], [ELEMENTS.N, 3], [ELEMENTS.O, 2]],
      "Glutamine": [[ELEMENTS.C, 5], [ELEMENTS.H, 10], [ELEMENTS.N, 2], [ELEMENTS.O, 3]],
      "Asparagine": [[ELEMENTS.C, 4], [ELEMENTS.H, 8], [ELEMENTS.N, 2], [ELEMENTS.O, 3]],
      "Glutamic Acid": [[ELEMENTS.C, 5], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 4]],
      "Arginine": [[ELEMENTS.C, 6], [ELEMENTS.H, 14], [ELEMENTS.N, 4], [ELEMENTS.O, 2]],
      "Cysteine": [[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 2], [ELEMENTS.S, 1]],
      "Isoleucine": [[ELEMENTS.C, 6], [ELEMENTS.H, 13], [ELEMENTS.N, 1], [ELEMENTS.O, 2]],
    };

    const comp = compositions[name] || [[ELEMENTS.C, 5], [ELEMENTS.H, 10], [ELEMENTS.N, 1], [ELEMENTS.O, 2]];
    return new Map(comp);
  }

  /**
   * Introduces a random amino acid substitution (mimicking translation errors).
   */
  #randomMisincorporation(correctInfo: { name: string; threeLetter: string; oneLetter: string; composition: Map<any, number> }): { name: string; threeLetter: string; oneLetter: string; composition: Map<any, number> } {
    const allAminoAcids = Array.from(GENETIC_CODE.values()).filter(aa => aa.oneLetter !== "*");
    const wrongAAs = allAminoAcids.filter(aa => aa.oneLetter !== correctInfo.oneLetter);
    return wrongAAs[Math.floor(Math.random() * wrongAAs.length)];
  }

  #calculateThermalDrift(bondsFormed: number, deltaH: number): number {
    const waterMass = 1e-15 * 1000;
    const specificHeat = 4.184;
    const energyJoules = bondsFormed * Math.abs(deltaH) * 1000 / 6.022e23;
    const temperatureChange = energyJoules / (waterMass * specificHeat);
    return deltaH < 0 ? temperatureChange : -temperatureChange;
  }
}
