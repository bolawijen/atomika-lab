import { AminoAcid, ProteinChain } from "@atomika-lab/biochem";
import { Environment, PHYSIOLOGICAL_CONDITIONS, ELEMENTS, Atom } from "@atomika-lab/core";
import { ReactionMixture, ReactionResult, type KineticSnapshot, ReactionVessel, type EnzymeKinetics } from "@atomika-lab/biochem";
import { LawsOfPhysics } from "@atomika-lab/core";
import { NucleicAcidChain } from "./NucleicAcidChain";

/**
 * Amino acid composition record with atomic stoichiometry.
 */
interface AminoAcidComposition {
  name: string;
  threeLetter: string;
  oneLetter: string;
  composition: Map<Atom, number>;
}

/**
 * Standard genetic code — maps RNA codons (triplets) to amino acids.
 */
const GENETIC_CODE: ReadonlyMap<string, AminoAcidComposition> = new Map([
  // Phenylalanine (C9H11NO2)
  ["UUU", { name: "Phenylalanine", threeLetter: "Phe", oneLetter: "F", composition: new Map([[ELEMENTS.C, 9], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["UUC", { name: "Phenylalanine", threeLetter: "Phe", oneLetter: "F", composition: new Map([[ELEMENTS.C, 9], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  // Leucine (C6H13NO2)
  ["UUA", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 13], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["UUG", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 13], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["CUU", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 13], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["CUC", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 13], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["CUA", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 13], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["CUG", { name: "Leucine", threeLetter: "Leu", oneLetter: "L", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 13], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  // Isoleucine (C6H13NO2)
  ["AUU", { name: "Isoleucine", threeLetter: "Ile", oneLetter: "I", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 13], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["AUC", { name: "Isoleucine", threeLetter: "Ile", oneLetter: "I", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 13], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["AUA", { name: "Isoleucine", threeLetter: "Ile", oneLetter: "I", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 13], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  // Methionine (C5H11NO2S)
  ["AUG", { name: "Methionine", threeLetter: "Met", oneLetter: "M", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 2], [ELEMENTS.S, 1]]) }],
  // Valine (C5H11NO2)
  ["GUU", { name: "Valine", threeLetter: "Val", oneLetter: "V", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["GUC", { name: "Valine", threeLetter: "Val", oneLetter: "V", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["GUA", { name: "Valine", threeLetter: "Val", oneLetter: "V", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["GUG", { name: "Valine", threeLetter: "Val", oneLetter: "V", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  // Serine (C3H7NO3)
  ["UCU", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  ["UCC", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  ["UCA", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  ["UCG", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  ["AGU", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  ["AGC", { name: "Serine", threeLetter: "Ser", oneLetter: "S", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  // Proline (C5H9NO2)
  ["CCU", { name: "Proline", threeLetter: "Pro", oneLetter: "P", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["CCC", { name: "Proline", threeLetter: "Pro", oneLetter: "P", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["CCA", { name: "Proline", threeLetter: "Pro", oneLetter: "P", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["CCG", { name: "Proline", threeLetter: "Pro", oneLetter: "P", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  // Threonine (C4H9NO3)
  ["ACU", { name: "Threonine", threeLetter: "Thr", oneLetter: "T", composition: new Map([[ELEMENTS.C, 4], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  ["ACC", { name: "Threonine", threeLetter: "Thr", oneLetter: "T", composition: new Map([[ELEMENTS.C, 4], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  ["ACA", { name: "Threonine", threeLetter: "Thr", oneLetter: "T", composition: new Map([[ELEMENTS.C, 4], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  ["ACG", { name: "Threonine", threeLetter: "Thr", oneLetter: "T", composition: new Map([[ELEMENTS.C, 4], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  // Alanine (C3H7NO2)
  ["GCU", { name: "Alanine", threeLetter: "Ala", oneLetter: "A", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["GCC", { name: "Alanine", threeLetter: "Ala", oneLetter: "A", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["GCA", { name: "Alanine", threeLetter: "Ala", oneLetter: "A", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["GCG", { name: "Alanine", threeLetter: "Ala", oneLetter: "A", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  // Tyrosine (C9H11NO3)
  ["UAU", { name: "Tyrosine", threeLetter: "Tyr", oneLetter: "Y", composition: new Map([[ELEMENTS.C, 9], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  ["UAC", { name: "Tyrosine", threeLetter: "Tyr", oneLetter: "Y", composition: new Map([[ELEMENTS.C, 9], [ELEMENTS.H, 11], [ELEMENTS.N, 1], [ELEMENTS.O, 3]]) }],
  // Histidine (C6H9N3O2)
  ["CAU", { name: "Histidine", threeLetter: "His", oneLetter: "H", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 9], [ELEMENTS.N, 3], [ELEMENTS.O, 2]]) }],
  ["CAC", { name: "Histidine", threeLetter: "His", oneLetter: "H", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 9], [ELEMENTS.N, 3], [ELEMENTS.O, 2]]) }],
  // Glutamine (C5H10N2O3)
  ["CAA", { name: "Glutamine", threeLetter: "Gln", oneLetter: "Q", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 10], [ELEMENTS.N, 2], [ELEMENTS.O, 3]]) }],
  ["CAG", { name: "Glutamine", threeLetter: "Gln", oneLetter: "Q", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 10], [ELEMENTS.N, 2], [ELEMENTS.O, 3]]) }],
  // Asparagine (C4H8N2O3)
  ["AAU", { name: "Asparagine", threeLetter: "Asn", oneLetter: "N", composition: new Map([[ELEMENTS.C, 4], [ELEMENTS.H, 8], [ELEMENTS.N, 2], [ELEMENTS.O, 3]]) }],
  ["AAC", { name: "Asparagine", threeLetter: "Asn", oneLetter: "N", composition: new Map([[ELEMENTS.C, 4], [ELEMENTS.H, 8], [ELEMENTS.N, 2], [ELEMENTS.O, 3]]) }],
  // Lysine (C6H14N2O2)
  ["AAA", { name: "Lysine", threeLetter: "Lys", oneLetter: "K", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 14], [ELEMENTS.N, 2], [ELEMENTS.O, 2]]) }],
  ["AAG", { name: "Lysine", threeLetter: "Lys", oneLetter: "K", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 14], [ELEMENTS.N, 2], [ELEMENTS.O, 2]]) }],
  // Aspartic Acid (C4H7NO4)
  ["GAU", { name: "Aspartic Acid", threeLetter: "Asp", oneLetter: "D", composition: new Map([[ELEMENTS.C, 4], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 4]]) }],
  ["GAC", { name: "Aspartic Acid", threeLetter: "Asp", oneLetter: "D", composition: new Map([[ELEMENTS.C, 4], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 4]]) }],
  // Glutamic Acid (C5H9NO4)
  ["GAA", { name: "Glutamic Acid", threeLetter: "Glu", oneLetter: "E", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 4]]) }],
  ["GAG", { name: "Glutamic Acid", threeLetter: "Glu", oneLetter: "E", composition: new Map([[ELEMENTS.C, 5], [ELEMENTS.H, 9], [ELEMENTS.N, 1], [ELEMENTS.O, 4]]) }],
  // Cysteine (C3H7NO2S)
  ["UGU", { name: "Cysteine", threeLetter: "Cys", oneLetter: "C", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 2], [ELEMENTS.S, 1]]) }],
  ["UGC", { name: "Cysteine", threeLetter: "Cys", oneLetter: "C", composition: new Map([[ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 2], [ELEMENTS.S, 1]]) }],
  // Tryptophan (C11H12N2O2)
  ["UGG", { name: "Tryptophan", threeLetter: "Trp", oneLetter: "W", composition: new Map([[ELEMENTS.C, 11], [ELEMENTS.H, 12], [ELEMENTS.N, 2], [ELEMENTS.O, 2]]) }],
  // Arginine (C6H14N4O2)
  ["CGU", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 14], [ELEMENTS.N, 4], [ELEMENTS.O, 2]]) }],
  ["CGC", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 14], [ELEMENTS.N, 4], [ELEMENTS.O, 2]]) }],
  ["CGA", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 14], [ELEMENTS.N, 4], [ELEMENTS.O, 2]]) }],
  ["CGG", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 14], [ELEMENTS.N, 4], [ELEMENTS.O, 2]]) }],
  ["AGA", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 14], [ELEMENTS.N, 4], [ELEMENTS.O, 2]]) }],
  ["AGG", { name: "Arginine", threeLetter: "Arg", oneLetter: "R", composition: new Map([[ELEMENTS.C, 6], [ELEMENTS.H, 14], [ELEMENTS.N, 4], [ELEMENTS.O, 2]]) }],
  // Glycine (C2H5NO2)
  ["GGU", { name: "Glycine", threeLetter: "Gly", oneLetter: "G", composition: new Map([[ELEMENTS.C, 2], [ELEMENTS.H, 5], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["GGC", { name: "Glycine", threeLetter: "Gly", oneLetter: "G", composition: new Map([[ELEMENTS.C, 2], [ELEMENTS.H, 5], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["GGA", { name: "Glycine", threeLetter: "Gly", oneLetter: "G", composition: new Map([[ELEMENTS.C, 2], [ELEMENTS.H, 5], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  ["GGG", { name: "Glycine", threeLetter: "Gly", oneLetter: "G", composition: new Map([[ELEMENTS.C, 2], [ELEMENTS.H, 5], [ELEMENTS.N, 1], [ELEMENTS.O, 2]]) }],
  // Stop codons
  ["UAA", { name: "Stop", threeLetter: "Stop", oneLetter: "*", composition: new Map() }],
  ["UAG", { name: "Stop", threeLetter: "Stop", oneLetter: "*", composition: new Map() }],
  ["UGA", { name: "Stop", threeLetter: "Stop", oneLetter: "*", composition: new Map() }],
]);

/**
 * Ribonucleoprotein complex that catalyzes translation of messenger RNA
 * into a polypeptide chain.
 *
 * Sequential codon-directed incorporation of aminoacyl-tRNA substrates
 * according to the standard genetic code, forming peptide bonds between
 * adjacent amino acids to extend the growing polypeptide.
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
          .map((n: { base: string }) => n.base)
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

      currentTemp += LawsOfPhysics.calculateThermalDrift(toTranslate, this.DELTA_H, 1e-15);
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

  #getAminoAcidComposition(name: string): Map<Atom, number> {
    // Simplified compositions for common amino acids
    const compositions: Record<string, [Atom, number][]> = {
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
  #randomMisincorporation(correctInfo: { name: string; threeLetter: string; oneLetter: string; composition: Map<Atom, number> }): { name: string; threeLetter: string; oneLetter: string; composition: Map<Atom, number> } {
    const allAminoAcids = Array.from(GENETIC_CODE.values()).filter(aa => aa.oneLetter !== "*");
    const wrongAAs = allAminoAcids.filter(aa => aa.oneLetter !== correctInfo.oneLetter);
    return wrongAAs[Math.floor(Math.random() * wrongAAs.length)]!;
  }
}
