/**
 * Henry's Law constant (mol/(L·atm)) for common gases at 25°C.
 *
 * C = kH · P
 * where C is the dissolved concentration (mol/L),
 * kH is Henry's constant, and P is the partial pressure (atm).
 */
export const HENRY_CONSTANTS: ReadonlyMap<string, number> = new Map([
  // Oxygen: moderately soluble
  ["O2", 1.3e-3],
  // Carbon dioxide: highly soluble due to hydration reaction
  ["CO2", 3.4e-2],
  // Hydrogen: poorly soluble
  ["H2", 7.8e-4],
  // Nitrogen: poorly soluble
  ["N2", 6.1e-4],
  // Ammonia: extremely soluble (reacts with water)
  ["NH3", 5.8e1],
  // Chlorine: moderately soluble
  ["Cl2", 6.5e-2],
]);

/**
 * Calculates the dissolved concentration of a gas in water
 * using Henry's Law.
 *
 * @param gasFormula Chemical formula of the gas (e.g., "O2", "CO2").
 * @param partialPressure Partial pressure of the gas in the headspace (atm).
 * @param temperatureC Temperature in degrees Celsius (affects kH).
 * @returns Dissolved concentration in mol/L.
 */
export function calculateHenrysLawConcentration(
  gasFormula: string,
  partialPressure: number,
  temperatureC: number = 25,
): number {
  const kH = HENRY_CONSTANTS.get(gasFormula);
  if (kH === undefined) return 0;

  // Temperature correction: kH decreases with increasing temperature
  // Approximate: kH(T) = kH(25°C) × exp(-ΔH_sol/R × (1/T - 1/298.15))
  // For simplicity, use a linear approximation: ~2% decrease per °C above 25°C
  const tempCorrection = 1 - 0.02 * (temperatureC - 25);
  return kH * partialPressure * Math.max(0.1, tempCorrection);
}

/**
 * Calculates the partial pressure of a gas in a mixture
 * using Dalton's Law.
 *
 * Pᵢ = xᵢ × P_total
 * where xᵢ is the molar fraction of gas i.
 *
 * @param molesOfGas Moles of the specific gas.
 * @param totalMoles Total moles of all gases in the mixture.
 * @param totalPressure Total pressure of the gas mixture (atm).
 * @returns Partial pressure of the gas (atm).
 */
export function calculatePartialPressure(
  molesOfGas: number,
  totalMoles: number,
  totalPressure: number,
): number {
  if (totalMoles === 0) return 0;
  const molarFraction = molesOfGas / totalMoles;
  return molarFraction * totalPressure;
}

/**
 * Calculates the total pressure of a gas mixture
 * using the Ideal Gas Law.
 *
 * P_total = n_total × R × T / V
 *
 * @param totalMoles Total moles of all gases.
 * @param volume Volume of the container (L).
 * @param temperatureC Temperature in degrees Celsius.
 * @returns Total pressure in atmospheres.
 */
export function calculateTotalGasPressure(
  totalMoles: number,
  volume: number,
  temperatureC: number,
): number {
  if (volume <= 0) return 0;
  const temperatureK = temperatureC + 273.15;
  return (totalMoles * 0.08206 * temperatureK) / volume;
}
