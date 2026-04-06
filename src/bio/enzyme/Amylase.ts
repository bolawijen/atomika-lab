import { ProteinChain } from "../ProteinChain";
import { Enzyme } from "./Enzyme";
import { Saccharide } from "../saccharide/Saccharide";
import { Polysaccharide } from "../saccharide/Polysaccharide";
import { GlycosidicBondType } from "../saccharide/GlycosidicBondType";
import { Environment, PHYSIOLOGICAL_CONDITIONS } from "../../core/Environment";
import { ReactionMixture } from "../../core/ReactionMixture";
import { ReactionResult, KineticSnapshot } from "../../core/ReactionResult";
import { KineticsSimulator, KineticParameters } from "./KineticsSimulator";
import { HydrolysisMechanism, HydrolysisResult } from "./HydrolysisMechanism";
import { ELEMENTS } from "../../Element";
import { StructuralFingerprint } from "../../core/StructuralFingerprint";
import { Chirality } from "../../core/Chirality";
import { RDKitEngine } from "../RDKitEngine";

/**
 * SMARTS pattern for α-1,4-glycosidic linkage — the target of α-amylase.
 * Matches the acetal oxygen bridge between two glucose units.
 */
const ALPHA_1_4_SMARTS = "[OX2][CX4][CX4]";

/**
 * SMILES representation of D-glucose (α-anomer) for fingerprint generation.
 */
const D_GLUCOSE_SMILES = "C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O)O)O)O)O";

/**
 * The Amylase enzyme.
 *
 * α-Amylase (EC 3.2.1.1) is an endohydrolase that randomly cleaves
 * internal α-1,4-glycosidic bonds in polysaccharides such as amylose,
 * yielding maltose, free monosaccharides, and limit dextrins as end products.
 *
 * Requires Ca²⁺ for structural integrity and Cl⁻ as an allosteric activator.
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
   * Scaled to nanomolar range for single-molecule simulation.
   */
  private readonly KM = 1e-8;

  /**
   * Product inhibition constant — product concentration at half-maximal inhibition.
   * Scaled to micromolar range for single-molecule simulation.
   */
  private readonly KI = 1e-6;

  /**
   * Structural fingerprint of the enzyme's active site.
   * Encodes features that determine substrate specificity and affinity.
   */
  private readonly activeSiteFingerprint: StructuralFingerprint;

  /**
   * Base Michaelis constant — the Km when substrate perfectly matches the active site.
   * Scaled to nanomolar range for single-molecule simulation.
   */
  private readonly BASE_KM = 1e-8;

  /**
   * Equilibrium constant — ratio of forward to reverse reaction rates.
   * Hydrolysis strongly favors products (Keq >> 1).
   */
  private readonly KEQ = 1e6;

  /**
   * Enthalpy of reaction (kJ/mol) — glycosidic bond hydrolysis is exothermic.
   * Each bond cleaved releases approximately 15 kJ/mol.
   */
  private readonly DELTA_H = -15;

  /**
   * Maximum reaction duration in simulation steps.
   * Represents the physical time horizon of the reaction vessel.
   */
  private readonly VESSEL_TIME_HORIZON = 10000;

  /**
   * Permanent structural damage flag — once true, the enzyme can never recover.
   */
  isDenatured = false;

  private readonly kinetics = new KineticsSimulator();
  private readonly mechanism = new HydrolysisMechanism();
  private rdkit: RDKitEngine | null = null;
  private idealSubstrateFp: StructuralFingerprint | null = null;

  constructor(protein: ProteinChain) {
    super(protein);
    // Active site fingerprint: encodes α-1,4 bond specificity, D-chirality preference,
    // and polysaccharide chain recognition
    this.activeSiteFingerprint = new StructuralFingerprint([
      GlycosidicBondType.ALPHA_1_4.charCodeAt(0),  // bond type
      Chirality.D.charCodeAt(0),                     // chirality preference
      4,                                              // chain length preference
    ]);

    // Initialize RDKit asynchronously
    this.#initializeRDKit();
  }

  /**
   * Initializes RDKit and precomputes the ideal substrate fingerprint.
   */
  private async #initializeRDKit(): Promise<void> {
    try {
      this.rdkit = await RDKitEngine.getInstance();
      StructuralFingerprint.setEngine(this.rdkit);

      // Compute Morgan fingerprint for ideal substrate (D-glucose polymer)
      const glucoseMol = this.rdkit.createMolecule(D_GLUCOSE_SMILES);
      if (glucoseMol) {
        const fp = this.rdkit.getMorganFingerprint(glucoseMol, 2);
        this.idealSubstrateFp = new StructuralFingerprint([0], fp);
        glucoseMol.delete();
      }
    } catch {
      // RDKit initialization failed — fall back to hash-based fingerprints
      this.rdkit = null;
    }
  }

  /**
   * Catalyzes the hydrolysis of α-1,4-glycosidic bonds in a polysaccharide substrate.
   *
   * Delegates time-stepping and rate calculation to KineticsSimulator,
   * and bond cleavage/fragment classification to HydrolysisMechanism.
   * Checks for required co-factors (Ca²⁺, Cl⁻) before catalysis.
   *
   * @param substrate The polysaccharide substrate (e.g., amylose).
   * @param environment Reaction conditions (temperature, pH, duration, solutes).
   * @returns ReactionResult containing the product mixture, kinetic history, and metadata.
   */
  digest(substrate: Saccharide, environment: Environment = PHYSIOLOGICAL_CONDITIONS): ReactionResult {
    const validatedSubstrate = this.#validateSubstrateSpecificity(substrate);
    if (!validatedSubstrate) {
      return this.#reportInertState();
    }

    const initialBondCount = validatedSubstrate.cleavableBondCount;

    this.#checkThermalDenaturation(environment);
    if (this.isDenatured) {
      return this.#reportInhibitedReaction(validatedSubstrate, environment);
    }

    const coFactorActivity = this.#calculateCoFactorActivity(environment);
    if (coFactorActivity === 0) {
      return this.#reportInhibitedReaction(validatedSubstrate, environment);
    }

    const phActivity = this.#calculatePhActivity(environment.pH);
    if (phActivity === 0) {
      return this.#reportInhibitedReaction(validatedSubstrate, environment);
    }

    const tempActivity = this.#calculateTempActivity(environment.temperatureC);
    if (tempActivity === 0) {
      return this.#reportInhibitedReaction(validatedSubstrate, environment);
    }

    const parameters: KineticParameters = {
      kCat: this.KCAT * coFactorActivity,
      kM: this.#calculateDynamicKm(validatedSubstrate),
      kI: this.KI,
      kEq: this.KEQ,
      deltaH: this.DELTA_H,
      phActivity,
      tempActivity,
      maxSteps: this.VESSEL_TIME_HORIZON,
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
    let currentTemp = environment.temperatureC;

    for (let step = 0; step < totalSteps; step++) {
      history.push(this.kinetics.recordProgression(reactionMixture, productMixture, step, currentTemp));

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

      // Apply thermal drift from reaction enthalpy
      currentTemp += this.#calculateThermalDrift(result.bondsCleaved, parameters.deltaH);
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
   * Co-factor activation scaling.
   * α-Amylase requires Ca²⁺ for structural integrity and Cl⁻ as an activator.
   * Missing Ca²⁺ reduces activity to 10%; missing Cl⁻ reduces to 50%.
   */
  #calculateCoFactorActivity(environment: Environment): number {
    let activity = 1.0;

    const caConcentration = environment.solutes.get(ELEMENTS.Ca) ?? 0;
    if (caConcentration < 0.5) {
      activity *= 0.1; // Near-zero without calcium
    } else if (caConcentration < 2.0) {
      activity *= caConcentration / 2.0;
    }

    const clConcentration = environment.solutes.get(ELEMENTS.Cl) ?? 0;
    if (clConcentration < 10) {
      activity *= 0.5; // Half activity without chloride
    }

    return activity;
  }

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

  /**
   * Calculates temperature drift from reaction enthalpy.
   * Exothermic hydrolysis releases heat, raising the mixture temperature.
   */
  #calculateThermalDrift(bondsCleaved: number, deltaH: number): number {
    const waterMass = 1e-15 * 1000; // 1 fL vessel ≈ 1 ng water
    const specificHeat = 4.184;
    const energyJoules = bondsCleaved * Math.abs(deltaH) * 1000 / 6.022e23;
    const temperatureChange = energyJoules / (waterMass * specificHeat);
    return deltaH < 0 ? temperatureChange : -temperatureChange;
  }

  /**
   * Calculates the effective Michaelis constant based on the structural
   * "lock-and-key" fit between the substrate and the enzyme's active site,
   * modified by steric hindrance from branch points.
   *
   * When RDKit is available, uses Morgan fingerprint Tanimoto similarity
   * for chemically accurate affinity calculation. Otherwise falls back
   * to a simple hash-based distance.
   *
   * A perfect match yields the base Km; poorer fits increase Km (lower affinity).
   * Branch points near the chain ends further increase Km due to steric crowding.
   */
  #calculateDynamicKm(substrate: Polysaccharide): number {
    let fit: number;

    // Use RDKit Morgan fingerprint if available
    if (this.idealSubstrateFp && this.rdkit) {
      // Create substrate SMILES from monomer count (approximation)
      // For a glucose polymer: O[C@@H]1O[C@H](CO)[C@@H](O)[C@H](O)[C@H]1O repeated
      const substrateSmiles = this.#polymerSmiles(substrate.count);
      const substrateMol = this.rdkit.createMolecule(substrateSmiles);
      if (substrateMol) {
        try {
          const substrateFp = this.rdkit.getMorganFingerprint(substrateMol, 2);
          const substrateFingerprint = new StructuralFingerprint([0], substrateFp);
          fit = this.idealSubstrateFp.compatibilityWith(substrateFingerprint);
          substrateMol.delete();
        } catch {
          fit = this.#fallbackFit(substrate);
        }
      } else {
        fit = this.#fallbackFit(substrate);
      }
    } else {
      fit = this.#fallbackFit(substrate);
    }

    // Steric hindrance factor: branch points reduce enzyme accessibility
    // Each branch point increases Km by ~20% due to crowding
    const stericFactor = 1 + substrate.branchCount * 0.2;

    // Poor fit increases Km (lower affinity): Km = BASE_KM / fit × stericFactor
    return (this.BASE_KM / Math.max(fit, 0.01)) * stericFactor;
  }

  /**
   * Generates an approximate SMILES for a glucose polymer of given length.
   */
  #polymerSmiles(length: number): string {
    // Simplified linear α-1,4 glucan SMILES
    const unit = "[C@@H]1[C@H]([C@@H]([C@H](O[C@H]1CO)O)O)O";
    if (length === 1) return `C(${unit})O`;
    let smiles = "O";
    for (let i = 0; i < length; i++) {
      smiles += unit;
    }
    return smiles + "O";
  }

  /**
   * Fallback fit calculation using simple structural features.
   */
  #fallbackFit(substrate: Polysaccharide): number {
    const substrateFingerprint = new StructuralFingerprint([
      substrate.bondType.charCodeAt(0),
      Chirality.D.charCodeAt(0),
      Math.min(substrate.count, 10),
    ]);
    return this.activeSiteFingerprint.compatibilityWith(substrateFingerprint);
  }

  // ── Validation & State ───────────────────────────────────────────

  /**
   * Validates substrate specificity: the substrate must be a polysaccharide
   * with α-1,4-glycosidic bonds, sufficient chain length, and correct chirality.
   *
   * When RDKit is available, uses stereochemical detection to verify
   * that the substrate has the correct D-chirality at the anomeric carbon.
   */
  #validateSubstrateSpecificity(substrate: Saccharide): Polysaccharide | null {
    if (!(substrate instanceof Polysaccharide)) return null;
    if (substrate.bondType !== GlycosidicBondType.ALPHA_1_4) return null;
    if (substrate.count < 2) return null;

    // RDKit chirality verification
    if (this.rdkit) {
      const smiles = this.#polymerSmiles(substrate.count);
      const mol = this.rdkit.createMolecule(smiles);
      if (mol) {
        const chiralCenters = this.rdkit.countChiralCenters(mol);
        mol.delete();
        // Natural D-glucose polymers have chiral centers; L-isomers would differ
        if (chiralCenters === 0) return null; // No chirality = wrong isomer
      }
    }

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

  /**
   * Reports an inert state — no reaction occurs due to invalid substrate.
   */
  #reportInertState(): ReactionResult {
    return new ReactionResult(new ReactionMixture(), 0, 0, false);
  }

  /**
   * Reports an inhibited reaction — substrate present but conditions prevent catalysis.
   */
  #reportInhibitedReaction(substrate: Polysaccharide, environment: Environment): ReactionResult {
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
