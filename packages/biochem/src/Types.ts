/**
 * Biochemical quantity types for @atomika-lab/biochem.
 *
 * Branded types prevent accidental unit mismatches in calculations.
 * Each type carries its unit as a phantom type at compile time.
 */

/**
 * Biochemical energy — metabolic work capacity in biological systems.
 *
 * Measured in kilocalories per mole (kcal/mol). Used for adenosine triphosphate
 * (ATP) hydrolysis and metabolic reactions. ATP is the primary energy carrier
 * in living cells, releasing approximately 7.3 kcal/mol upon hydrolysis.
 */
export type BiochemicalEnergy = number & { readonly __unit: "kcal/mol" };

/**
 * Molar concentration — amount of solute dissolved per volume of solution.
 *
 * Measured in moles per liter (mol/L or M).
 */
export type MolarConcentration = number & { readonly __unit: "mol/L" };

/**
 * Acidity — negative logarithm of hydrogen ion activity in aqueous solution.
 *
 * Dimensionless quantity ranging from 0 (strongly acidic) to 14 (strongly basic).
 */
export type Acidity = number & { readonly __unit: "pH" };

/**
 * Rate constant — proportionality factor relating reactant concentrations to reaction rate.
 *
 * Measured in reciprocal seconds (s⁻¹) for first-order reactions.
 */
export type RateConstant = number & { readonly __unit: "s⁻¹" };

/**
 * Conversion — fraction of substrate transformed into products.
 *
 * Dimensionless ratio from 0 (no reaction) to 1 (complete conversion).
 */
export type Conversion = number & { readonly __unit: "fraction" };
