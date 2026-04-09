/**
 * Physical constants governing passive diffusion across biological membranes.
 */
const DIFFUSION_COEFFICIENT = 0.1;
const MAX_ABSORPTION = 1.0;
const LIPOPHILIC_PERMEABILITY = 1.0;
const HYDROPHILIC_PERMEABILITY = 0.3;

/**
 * Calculates the concentration gradient driving passive diffusion.
 *
 * @param externalConcentration Nutrient concentration outside the cell.
 * @param internalConcentration Nutrient concentration inside the cell.
 * @returns Positive gradient drives molecules inward; zero or negative means no net diffusion.
 */
export function concentrationGradient(
  externalConcentration: number,
  internalConcentration: number,
): number {
  return Math.max(0, externalConcentration - internalConcentration);
}

/**
 * Calculates the rate of passive diffusion across a membrane.
 *
 * Fick's law simplified: rate = gradient × permeability × diffusion coefficient.
 *
 * @param gradient Concentration gradient driving diffusion.
 * @param permeability Membrane permeability to the molecule type (0–1).
 * @returns Amount absorbed per time step (0–1).
 */
export function diffusionRate(gradient: number, permeability: number): number {
  return Math.min(gradient * permeability * DIFFUSION_COEFFICIENT, MAX_ABSORPTION);
}

/**
 * Permeability of lipophilic molecules through a standard lipid bilayer.
 * Lipophilic molecules dissolve readily in the hydrophobic core of the membrane.
 */
export function lipophilicPermeability(): number {
  return LIPOPHILIC_PERMEABILITY;
}

/**
 * Permeability of hydrophilic molecules through a standard lipid bilayer.
 * Hydrophilic molecules face resistance crossing the hydrophobic membrane core.
 */
export function hydrophilicPermeability(): number {
  return HYDROPHILIC_PERMEABILITY;
}

/**
 * Permeability of molecules through a mycolic acid layer.
 *
 * Mycolic acids form a thick waxy barrier that is highly permeable to lipids
 * but resistant to hydrophilic molecules.
 *
 * @param hydrophobicity Hydrophobicity index of the mycolic acid layer (0–1).
 * @returns Permeability to lipid molecules (0–1).
 */
export function mycolicAcidLipidPermeability(hydrophobicity: number): number {
  return hydrophobicity;
}

/**
 * Permeability of non-lipid molecules through porin channels.
 *
 * Porins are protein pores that allow small hydrophilic molecules to pass
 * by size exclusion. Larger molecules are excluded.
 *
 * @param poreSize Pore diameter in ångströms.
 * @returns Normalized permeability (0–1).
 */
export function porinPermeability(poreSize: number): number {
  return poreSize / 20;
}
