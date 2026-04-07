/**
 * Biochemical quantity types for @atomika-lab/biochem.
 *
 * Branded types prevent accidental unit mismatches in calculations.
 * Each type carries its unit as a phantom type at compile time.
 */

export type BiochemicalEnergy = number & { readonly __unit: "kcal/mol" };
export type MolarConcentration = number & { readonly __unit: "mol/L" };
export type Acidity = number & { readonly __unit: "pH" };
export type RateConstant = number & { readonly __unit: "s⁻¹" };
export type Conversion = number & { readonly __unit: "fraction" };
