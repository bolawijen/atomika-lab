/**
 * Pharmacological quantities in drug-target interactions.
 *
 * Binding affinity and metabolic clearance —
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
