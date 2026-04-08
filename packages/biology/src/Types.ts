/**
 * Biological quantities in living organisms.
 *
 * Cell viability and incubation time — the measurable properties
 * that characterize living systems and their responses to external agents.
 */

/**
 * Generation time — doubling time for bacterial population growth.
 *
 * Measured in hours (h). Species-specific: E. coli ~20 min, M. tuberculosis ~24 h.
 */
export type GenerationTime = number & { readonly __unit: "h" };

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

/**
 * Metabolic energy — ATP available for cellular processes.
 *
 * Measured in attomoles (amol). Represents usable energy reserves.
 */
export type MetabolicEnergy = number & { readonly __unit: "amol" };

/**
 * Nutrient concentration — available small molecules for uptake.
 *
 * Measured in millimolar (mM).
 */
export type NutrientConcentration = number & { readonly __unit: "mM" };
