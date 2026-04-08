/**
 * Pharmacological quantities in drug-target interactions.
 *
 * Binding affinity, metabolic clearance, and lipophilicity —
 * the measurable properties that determine drug efficacy and distribution.
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
