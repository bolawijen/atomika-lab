/**
 * Pharmacological quantity types for @atomika-lab/pharmacology.
 *
 * Branded types prevent accidental unit mismatches in calculations.
 * Each type carries its unit as a phantom type at compile time.
 */

export type DissociationConstant = number & { readonly __unit: "M" };
export type Clearance = number & { readonly __unit: "min⁻¹" };
export type Lipophilicity = number & { readonly __unit: "logP" };
