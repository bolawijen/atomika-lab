import { Atom } from "./src/Atom";
import { ELEMENTS } from "./src/Element";
import { Amylose } from "./src/bio/saccharide/Amylose";
import { Amylase } from "./src/bio/enzyme/Amylase";
import { AminoAcid } from "./src/bio/AminoAcid";
import { ProteinChain } from "./src/bio/ProteinChain";
import { Glucose } from "./src/bio/saccharide/Glucose";
import { Fructose } from "./src/bio/saccharide/Fructose";
import { Sucrose } from "./src/bio/saccharide/Sucrose";
import { Galactose } from "./src/bio/saccharide/Galactose";
import { Lactose } from "./src/bio/saccharide/Lactose";
import { Maltose } from "./src/bio/saccharide/Maltose";
import { Dextrin } from "./src/bio/saccharide/Dextrin";
import { Environment, PHYSIOLOGICAL_CONDITIONS } from "./src/bio/Environment";

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
const normalEnv = new Environment(37, 7.0, 60);
const normalResult = new Amylase(enzymeProtein).digest(new Amylose(10), normalEnv);
console.log(`Normal (37°C, pH 7.0, 60s): ${normalResult.products.speciesCount} products, conversion: ${(normalResult.conversionRate * 100).toFixed(0)}%, remaining: ${normalResult.remainingSubstrateMass.toFixed(0)} Da, active: ${normalResult.isEnzymeStillActive}`);

// Scenario B: Freezing (0°C) — enzyme inactivated (reversible)
const coldEnv = new Environment(0, 7.0, 60);
const coldResult = new Amylase(enzymeProtein).digest(new Amylose(10), coldEnv);
console.log(`Frozen (0°C, pH 7.0, 60s): ${coldResult.products.speciesCount} products, conversion: ${(coldResult.conversionRate * 100).toFixed(0)}%, remaining: ${coldResult.remainingSubstrateMass.toFixed(0)} Da, active: ${coldResult.isEnzymeStillActive}`);

// Scenario C: Boiling (80°C) — irreversible denaturation
const hotEnv = new Environment(80, 7.0, 60);
const hotResult = new Amylase(enzymeProtein).digest(new Amylose(10), hotEnv);
console.log(`Boiling (80°C, pH 7.0, 60s): ${hotResult.products.speciesCount} products, conversion: ${(hotResult.conversionRate * 100).toFixed(0)}%, remaining: ${hotResult.remainingSubstrateMass.toFixed(0)} Da, active: ${hotResult.isEnzymeStillActive}`);

// Scenario D: Acidic stomach (pH 2) — α-amylase inhibited
const acidEnv = new Environment(37, 2.0, 60);
const acidResult = new Amylase(enzymeProtein).digest(new Amylose(10), acidEnv);
console.log(`Acidic (37°C, pH 2.0, 60s): ${acidResult.products.speciesCount} products, conversion: ${(acidResult.conversionRate * 100).toFixed(0)}%, remaining: ${acidResult.remainingSubstrateMass.toFixed(0)} Da, active: ${acidResult.isEnzymeStillActive}`);

// Scenario E: Short reaction (5s) vs long reaction (300s)
const shortEnv = new Environment(37, 7.0, 5);
const shortResult = new Amylase(enzymeProtein).digest(new Amylose(10), shortEnv);
console.log(`Short (37°C, pH 7.0, 5s): ${shortResult.products.speciesCount} products, conversion: ${(shortResult.conversionRate * 100).toFixed(0)}%`);

const longEnv = new Environment(37, 7.0, 300);
const longResult = new Amylase(enzymeProtein).digest(new Amylose(10), longEnv);
console.log(`Long (37°C, pH 7.0, 300s): ${longResult.products.speciesCount} products, conversion: ${(longResult.conversionRate * 100).toFixed(0)}%`);
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
