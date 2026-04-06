import { Atom, ELEMENTS } from "@atomika-lab/core";
import { Amylose, Amylopectin, Glucose, Fructose, Sucrose, Galactose, Lactose, Maltose, Dextrin } from "@atomika-lab/biochem";
import { Amylase, Isoamylase, Maltase, AminoAcid, ProteinChain } from "@atomika-lab/biochem";
import { Environment, PHYSIOLOGICAL_CONDITIONS } from "@atomika-lab/core";
import { Bioreactor } from "@atomika-lab/biology";
import { Nucleotide, NitrogenousBase, NucleicAcidType, NucleicAcidChain, Polymerase, Ribosome } from "@atomika-lab/biology";

// --- Atom Demonstration ---
console.log(`--- Atom Demonstration ---`);
const carbon = new Atom({ name: "Carbon", symbol: "C", protonCount: 6, mass: 12.011, valence: 4 });
console.log(`An atom: ${carbon.name} (${carbon.symbol})`);
console.log("\n");


// --- Amino Acids & Protein Demonstration ---
console.log("--- Amino Acids & Protein Demonstration ---");

const ala = new AminoAcid("Alanine", "Ala", "A", new Map([
  [ELEMENTS.C, 3], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 2],
]));
const lys = new AminoAcid("Lysine", "Lys", "K", new Map([
  [ELEMENTS.C, 6], [ELEMENTS.H, 14], [ELEMENTS.N, 2], [ELEMENTS.O, 2],
]));
const asp = new AminoAcid("Aspartic Acid", "Asp", "D", new Map([
  [ELEMENTS.C, 4], [ELEMENTS.H, 7], [ELEMENTS.N, 1], [ELEMENTS.O, 4],
]));

console.log(`Alanine: ${ala.molecularFormula} (${ala.molecularMass.toFixed(2)} Da)`);
console.log(`Lysine: ${lys.molecularFormula} (${lys.molecularMass.toFixed(2)} Da)`);
console.log(`Aspartic Acid: ${asp.molecularFormula} (${asp.molecularMass.toFixed(2)} Da)`);

const peptide = new ProteinChain([asp, ala, lys, asp, ala]);
console.log(`Peptide sequence: ${peptide}`);
console.log(`Peptide formula: ${peptide.molecularFormula} (${peptide.molecularMass.toFixed(2)} Da)`);
console.log("\n");


// --- Enzyme Environment Demonstration ---
console.log("--- Enzyme Environment Demonstration ---");

const enzymeProtein = new ProteinChain([asp, ala, lys, asp, ala]);

// Scenario A: Physiological conditions (37°C, pH 7, 60s)
const normalEnv = new Environment({ temperatureC: 37, pH: 7.0, durationInSeconds: 60 });
const normalResult = new Amylase(enzymeProtein).digest(new Amylose(10), normalEnv);
console.log(`Normal (37°C, pH 7.0, 60s): ${normalResult.reactionPath.length > 0 ? normalResult.products.speciesCount : 0} products, conversion: ${(normalResult.conversionRate * 100).toFixed(0)}%, remaining: ${normalResult.remainingSubstrateMass.toFixed(0)} Da, active: ${normalResult.isEnzymeStillActive}`);

// Scenario B: Freezing (0°C) — enzyme inactivated (reversible)
const coldEnv = new Environment({ temperatureC: 0, pH: 7.0, durationInSeconds: 60 });
const coldResult = new Amylase(enzymeProtein).digest(new Amylose(10), coldEnv);
console.log(`Frozen (0°C, pH 7.0, 60s): ${coldResult.reactionPath.length > 0 ? coldResult.products.speciesCount : 0} products, conversion: ${(coldResult.conversionRate * 100).toFixed(0)}%, remaining: ${coldResult.remainingSubstrateMass.toFixed(0)} Da, active: ${coldResult.isEnzymeStillActive}`);

// Scenario C: Boiling (80°C) — irreversible denaturation
const hotEnv = new Environment({ temperatureC: 80, pH: 7.0, durationInSeconds: 60 });
const hotResult = new Amylase(enzymeProtein).digest(new Amylose(10), hotEnv);
console.log(`Boiling (80°C, pH 7.0, 60s): ${hotResult.reactionPath.length > 0 ? hotResult.products.speciesCount : 0} products, conversion: ${(hotResult.conversionRate * 100).toFixed(0)}%, remaining: ${hotResult.remainingSubstrateMass.toFixed(0)} Da, active: ${hotResult.isEnzymeStillActive}`);

// Scenario D: Acidic stomach (pH 2) — α-amylase inhibited
const acidEnv = new Environment({ temperatureC: 37, pH: 2.0, durationInSeconds: 60 });
const acidResult = new Amylase(enzymeProtein).digest(new Amylose(10), acidEnv);
console.log(`Acidic (37°C, pH 2.0, 60s): ${acidResult.reactionPath.length > 0 ? acidResult.products.speciesCount : 0} products, conversion: ${(acidResult.conversionRate * 100).toFixed(0)}%, remaining: ${acidResult.remainingSubstrateMass.toFixed(0)} Da, active: ${acidResult.isEnzymeStillActive}`);

// Scenario E: Short reaction (5s) vs long reaction (300s)
const shortEnv = new Environment({ temperatureC: 37, pH: 7.0, durationInSeconds: 5 });
const shortResult = new Amylase(enzymeProtein).digest(new Amylose(10), shortEnv);
console.log(`Short (37°C, pH 7.0, 5s): ${shortResult.reactionPath.length > 0 ? shortResult.products.speciesCount : 0} products, conversion: ${(shortResult.conversionRate * 100).toFixed(0)}%`);

const longEnv = new Environment({ temperatureC: 37, pH: 7.0, durationInSeconds: 300 });
const longResult = new Amylase(enzymeProtein).digest(new Amylose(10), longEnv);
console.log(`Long (37°C, pH 7.0, 300s): ${longResult.reactionPath.length > 0 ? longResult.products.speciesCount : 0} products, conversion: ${(longResult.conversionRate * 100).toFixed(0)}%`);
console.log("\n");


// --- Hydrolysis Stoichiometry Demonstration ---
console.log("--- Hydrolysis Stoichiometry Demonstration ---");

const smallSubstrate = new Amylose(5);
console.log(`Substrate: ${smallSubstrate} → ${smallSubstrate.molecularFormula} (${smallSubstrate.molecularMass.toFixed(2)} Da)`);

const maltose = new Maltose();
const dextrin3 = new Dextrin(smallSubstrate.monomers.slice(2));
console.log(`\nExpected hydrolysis products (1 cleavage):`);
console.log(`  Maltose: ${maltose.molecularFormula} (${maltose.molecularMass.toFixed(2)} Da)`);
console.log(`  Dextrin(n=3): ${dextrin3.molecularFormula} (${dextrin3.molecularMass.toFixed(2)} Da)`);

const reactantMass = smallSubstrate.molecularMass + (2 * ELEMENTS.H.mass + ELEMENTS.O.mass);
const productMass = maltose.molecularMass + dextrin3.molecularMass;
console.log(`\nStoichiometry check: Amylose(n=5) + H₂O → Maltose + Dextrin(n=3)`);
console.log(`  Reactants: ${reactantMass.toFixed(2)} Da`);
console.log(`  Products:  ${productMass.toFixed(2)} Da`);
console.log(`  Balance:   ${(productMass - reactantMass).toFixed(2)} Da (should be ≈ 0)`);
console.log("\n");


// --- Other Carbohydrates Demonstration ---
console.log("--- Other Carbohydrates Demonstration ---");

const glucose = new Glucose();
const fructose = new Fructose();
const galactose = new Galactose();
console.log(`Glucose: ${glucose.molecularFormula} (${glucose.molecularMass.toFixed(2)} Da)`);
console.log(`Fructose: ${fructose.molecularFormula} (${fructose.molecularMass.toFixed(2)} Da)`);
console.log(`Galactose: ${galactose.molecularFormula} (${galactose.molecularMass.toFixed(2)} Da)`);

const sucrose = new Sucrose();
const lactose = new Lactose();
console.log(`Sucrose: ${sucrose.molecularFormula} (${sucrose.molecularMass.toFixed(2)} Da)`);
console.log(`Lactose: ${lactose.molecularFormula} (${lactose.molecularMass.toFixed(2)} Da)`);


// --- Multi-Enzyme Bioreactor Demonstration ---
console.log("\n--- Multi-Enzyme Bioreactor Demonstration ---");

const digestiveEnzymeProtein = new ProteinChain([asp, ala, lys, asp, ala]);
const bioreactor = new Bioreactor();
bioreactor.addEnzyme(new Isoamylase(digestiveEnzymeProtein));
bioreactor.addEnzyme(new Amylase(digestiveEnzymeProtein));
bioreactor.addEnzyme(new Maltase(digestiveEnzymeProtein));

const branchedAmylopectin = new Amylopectin(30, [6, 12, 18, 24]);
console.log(`Initial substrate: ${branchedAmylopectin}`);

const fullDigestion = bioreactor.digest(branchedAmylopectin, new Environment({ temperatureC: 37, pH: 7.0, durationInSeconds: 120 }));
console.log(`After 120s digestion: ${fullDigestion.reactionPath.length > 0 ? fullDigestion.products.speciesCount : 0} molecular species`);
console.log(`Conversion: ${(fullDigestion.conversionRate * 100).toFixed(0)}%`);
console.log(`Remaining mass: ${fullDigestion.remainingSubstrateMass.toFixed(0)} Da`);

if (fullDigestion.reactionPath.length > 0) {
  const first = fullDigestion.reactionPath[0];
  const last = fullDigestion.reactionPath[fullDigestion.reactionPath.length - 1];
  console.log(`Kinetic range: ${first.remainingBonds} → ${last.remainingBonds} cleavable bonds`);
}


// --- Genetic Foundation & Protein Synthesis Demonstration ---
console.log("\n--- Genetic Foundation & Protein Synthesis Demonstration ---");

// 1. Nucleotide base-pairing
const adenine = new Nucleotide(NitrogenousBase.ADENINE, NucleicAcidType.DNA);
const thymine = new Nucleotide(NitrogenousBase.THYMINE, NucleicAcidType.DNA);
const cytosine = new Nucleotide(NitrogenousBase.CYTOSINE, NucleicAcidType.DNA);
const guanine = new Nucleotide(NitrogenousBase.GUANINE, NucleicAcidType.DNA);
console.log(`DNA bases: ${adenine}↔${adenine.complementaryBase}, ${thymine}↔${thymine.complementaryBase}, ${cytosine}↔${cytosine.complementaryBase}, ${guanine}↔${guanine.complementaryBase}`);

// 2. DNA template strand for "Met-Ala-Lys" → AUG GCU AAA (mRNA) → TAC CGA TTT (DNA template)
const codingDna = new NucleicAcidChain([
  new Nucleotide(NitrogenousBase.THYMINE, NucleicAcidType.DNA),
  new Nucleotide(NitrogenousBase.ADENINE, NucleicAcidType.DNA),
  new Nucleotide(NitrogenousBase.CYTOSINE, NucleicAcidType.DNA),
  new Nucleotide(NitrogenousBase.CYTOSINE, NucleicAcidType.DNA),
  new Nucleotide(NitrogenousBase.GUANINE, NucleicAcidType.DNA),
  new Nucleotide(NitrogenousBase.ADENINE, NucleicAcidType.DNA),
  new Nucleotide(NitrogenousBase.ADENINE, NucleicAcidType.DNA),
  new Nucleotide(NitrogenousBase.ADENINE, NucleicAcidType.DNA),
  new Nucleotide(NitrogenousBase.THYMINE, NucleicAcidType.DNA),
]);
console.log(`DNA template: ${codingDna} (${codingDna.count} nucleotides)`);
console.log(`DNA formula: ${codingDna.molecularFormula} (${codingDna.molecularMass.toFixed(0)} Da)`);

// 3. Transcription: DNA → mRNA
const polymeraseProtein = new ProteinChain([asp, ala, lys, asp, ala]);
const rnaPolymerase = new Polymerase(polymeraseProtein);
const transcriptionEnv = new Environment(37, 7.5, 30);
const transcriptionResult = rnaPolymerase.digest(codingDna, transcriptionEnv);
const mrna = transcriptionResult.products.getAll()[0] as NucleicAcidChain | undefined;
if (mrna) {
  console.log(`mRNA transcript: ${mrna} (${mrna.count} nucleotides)`);
  console.log(`mRNA formula: ${mrna.molecularFormula} (${mrna.molecularMass.toFixed(0)} Da)`);

  // 4. Translation: mRNA → Protein
  const ribosome = new Ribosome(polymeraseProtein);
  const translationEnv = new Environment(37, 7.2, 60);
  const translationResult = ribosome.translate(mrna, translationEnv);
  const protein = translationResult.products.getAll()[0] as ProteinChain | undefined;
  if (protein) {
    console.log(`Protein: ${protein} (${protein.count} amino acids)`);
    console.log(`Protein formula: ${protein.molecularFormula} (${protein.molecularMass.toFixed(0)} Da)`);
  }
}


// --- Complex Polysaccharides & Branching Demonstration ---
console.log("\n--- Complex Polysaccharides & Branching Demonstration ---");

const linearAmylose = new Amylose(20);
console.log(`Linear amylose: ${linearAmylose}, branches: ${linearAmylose.branchCount}`);

const branched = new Amylopectin(30, [6, 12, 18, 24]);
console.log(`Amylopectin: ${branched}`);
console.log(`  Formula: ${branched.molecularFormula}`);
console.log(`  Mass: ${branched.molecularMass.toFixed(0)} Da`);
console.log(`  Branch points: ${branched.branchCount}`);

const amylaseOnly = new Amylase(digestiveEnzymeProtein);
const amylaseResult = amylaseOnly.digest(branched, new Environment({ temperatureC: 37, pH: 7.0, durationInSeconds: 60 }));
console.log(`\nAmylase alone on amylopectin: ${amylaseResult.reactionPath.length > 0 ? amylaseResult.products.speciesCount : 0} products, conversion: ${(amylaseResult.conversionRate * 100).toFixed(0)}%`);

const isoamylase = new Isoamylase(digestiveEnzymeProtein);
const debranchResult = isoamylase.digest(branched, new Environment({ temperatureC: 37, pH: 7.0, durationInSeconds: 30 }));
console.log(`Isoamylase debranching: ${debranchResult.reactionPath.length > 0 ? debranchResult.products.speciesCount : 0} linearized chains, branches cleaved: ${(debranchResult.conversionRate * 100).toFixed(0)}%`);
