/**
 * Biological quantity types for @atomika-lab/biology.
 *
 * Branded types prevent accidental unit mismatches in calculations.
 * Each type carries its unit as a phantom type at compile time.
 */

export type IncubationTime = number & { readonly __unit: "min" };
export type Viability = number & { readonly __unit: "fraction" };
