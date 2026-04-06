import { Molecule } from "./Molecule";
import { Atom } from "./Atom";

/**
 * A chemical reaction — a process that transforms reactants into products.
 *
 * Supports both enzymatic and non-enzymatic (spontaneous, inorganic) reactions.
 * The reaction rate is governed by the Arrhenius equation and can be modified
 * by catalysts, temperature, and concentration effects.
 */
export abstract class ChemicalReaction {
  /** Reactant molecules consumed by this reaction. */
  abstract readonly reactants: ReadonlyArray<Molecule>;

  /** Product molecules formed by this reaction. */
  abstract readonly products: ReadonlyArray<Molecule>;

  /** Activation energy (kJ/mol) — minimum energy barrier for the reaction to proceed. */
  abstract readonly activationEnergy: number;

  /** Enthalpy change (kJ/mol) — heat released (negative) or absorbed (positive). */
  abstract readonly enthalpy: number;

  /**
   * Stoichiometric coefficients for reactants.
   * Maps each reactant molecule to its coefficient in the balanced equation.
   */
  abstract readonly reactantCoefficients: ReadonlyMap<Molecule, number>;

  /**
   * Stoichiometric coefficients for products.
   * Maps each product molecule to its coefficient in the balanced equation.
   */
  abstract readonly productCoefficients: ReadonlyMap<Molecule, number>;

  /**
   * Calculates the reaction rate constant using the Arrhenius equation.
   *
   * k = A · exp(-Ea / RT)
   *
   * @param temperatureK Temperature in Kelvin.
   * @param preExponentialFactor Frequency factor A (s⁻¹), typically 10¹²–10¹⁴ for unimolecular reactions.
   * @returns Rate constant in s⁻¹.
   */
  calculateRateConstant(temperatureK: number, preExponentialFactor: number = 1e13): number {
    const R = 8.314e-3; // Gas constant in kJ/(mol·K)
    return preExponentialFactor * Math.exp(-this.activationEnergy / (R * temperatureK));
  }

  /**
   * Determines whether the reaction is spontaneous under standard conditions.
   *
   * A reaction is spontaneous if ΔG < 0, where ΔG = ΔH - TΔS.
   * For simplicity, we assume ΔS ≈ 0 and check if ΔH < 0 (exothermic).
   *
   * @returns True if the reaction is exothermic (releases energy).
   */
  isSpontaneous(): boolean {
    return this.enthalpy < 0;
  }

  /**
   * Returns the balanced chemical equation as a string.
   * E.g., "2H₂ + O₂ → 2H₂O"
   */
  toString(): string {
    const reactantStr = Array.from(this.reactantCoefficients.entries())
      .map(([mol, coeff]) => coeff > 1 ? `${coeff}×${mol}` : mol.toString())
      .join(" + ");

    const productStr = Array.from(this.productCoefficients.entries())
      .map(([mol, coeff]) => coeff > 1 ? `${coeff}×${mol}` : mol.toString())
      .join(" + ");

    return `${reactantStr} → ${productStr}`;
  }
}
