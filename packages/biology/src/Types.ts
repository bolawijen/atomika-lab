/**
 * Biological quantity types for @atomika-lab/biology.
 *
 * Branded types prevent accidental unit mismatches in calculations.
 * Each type carries its unit as a phantom type at compile time.
 */

/**
 * Incubation time — extended time interval for biological processes.
 *
 * Measured in minutes (min). Used for experimental protocols.
 */
export type IncubationTime = number & { readonly __unit: "min" };

/**
 * Viability — proportion of living cells in a population.
 *
 * Dimensionless ratio from 0 (all dead) to 1 (all alive).
 */
export type Viability = number & { readonly __unit: "fraction" };
