/**
 * Pharmacological quantity types for @atomika-lab/pharmacology.
 *
 * Branded types prevent accidental unit mismatches in calculations.
 * Each type carries its unit as a phantom type at compile time.
 */

/**
 * Dissociation constant — equilibrium constant for complex separation.
 *
 * Measured in molar concentration (M). Lower values indicate stronger binding.
 */
export type DissociationConstant = number & { readonly __unit: "M" };

/**
 * Clearance — volume of fluid cleared of a substance per unit time.
 *
 * Measured in reciprocal minutes (min⁻¹). Used for pharmacokinetics.
 */
export type Clearance = number & { readonly __unit: "min⁻¹" };

/**
 * Lipophilicity — partition coefficient between octanol and water.
 *
 * Dimensionless logarithmic scale (logP). Higher values indicate greater fat solubility.
 */
export type Lipophilicity = number & { readonly __unit: "logP" };
