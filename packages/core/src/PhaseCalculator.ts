/**
 * Universal gas constant (J/(mol·K)).
 */
const R = 8.314;

/**
 * Standard pressure in atm (1 atm = 101325 Pa).
 */
const STANDARD_PRESSURE_ATM = 1.0;

/**
 * Calculates the boiling point of a substance at a given pressure
 * using the Clausius-Clapeyron relation.
 *
 * ln(P₂/P₁) = (ΔHvap/R) × (1/T₁ - 1/T₂)
 *
 * @param normalBoilingPointC Boiling point at 1 atm (°C).
 * @param enthalpyOfVaporization Enthalpy of vaporization (kJ/mol).
 * @param pressureAtm Current pressure (atm).
 * @returns Boiling point at the given pressure (°C).
 */
export function calculateBoilingPointAtPressure(
  normalBoilingPointC: number,
  enthalpyOfVaporization: number,
  pressureAtm: number,
): number {
  const T1 = normalBoilingPointC + 273.15; // Convert to Kelvin
  const dHvap = enthalpyOfVaporization * 1000; // Convert to J/mol

  // Clausius-Clapeyron: ln(P2/P1) = (dHvap/R) * (1/T1 - 1/T2)
  // Solving for T2: 1/T2 = 1/T1 - (R/dHvap) * ln(P2/P1)
  const lnPressureRatio = Math.log(pressureAtm / STANDARD_PRESSURE_ATM);
  const inverseT2 = 1 / T1 - (R / dHvap) * lnPressureRatio;

  if (inverseT2 <= 0) return normalBoilingPointC; // Avoid division by zero

  const T2 = 1 / inverseT2;
  return T2 - 273.15; // Convert back to Celsius
}

/**
 * Calculates the volume occupied by a gas using the Ideal Gas Law.
 *
 * PV = nRT → V = nRT/P
 *
 * @param moles Number of moles of gas.
 * @param temperatureC Temperature in degrees Celsius.
 * @param pressureAtm Pressure in atmospheres.
 * @returns Volume in liters.
 */
export function calculateIdealGasVolume(
  moles: number,
  temperatureC: number,
  pressureAtm: number = 1.0,
): number {
  const temperatureK = temperatureC + 273.15;
  // R = 0.08206 L·atm/(mol·K)
  return (moles * 0.08206 * temperatureK) / pressureAtm;
}

/**
 * Calculates the pressure exerted by a gas using the Van der Waals equation
 * for real gases.
 *
 * (P + an²/V²)(V - nb) = nRT
 *
 * @param moles Number of moles of gas.
 * @param volume Volume in liters.
 * @param temperatureC Temperature in degrees Celsius.
 * @param vanDerWaalsA Attraction parameter (L²·atm/mol²).
 * @param vanDerWaalsB Volume exclusion parameter (L/mol).
 * @returns Pressure in atmospheres.
 */
export function calculateVanDerWaalsPressure(
  moles: number,
  volume: number,
  temperatureC: number,
  vanDerWaalsA: number,
  vanDerWaalsB: number,
): number {
  const temperatureK = temperatureC + 273.15;
  const n = moles;
  const V = volume;

  // P = nRT/(V - nb) - an²/V²
  const idealTerm = (n * 0.08206 * temperatureK) / (V - n * vanDerWaalsB);
  const correctionTerm = (vanDerWaalsA * n * n) / (V * V);

  return idealTerm - correctionTerm;
}

/**
 * Determines the phase of a pure substance at the given temperature and pressure.
 *
 * @param temperatureC Current temperature (°C).
 * @param pressureAtm Current pressure (atm).
 * @param meltingPointC Melting point at 1 atm (°C).
 * @param boilingPointC Boiling point at 1 atm (°C).
 * @param enthalpyOfVaporization Enthalpy of vaporization (kJ/mol).
 * @returns The phase of the substance.
 */
export function determinePhase(
  temperatureC: number,
  pressureAtm: number,
  meltingPointC: number,
  boilingPointC: number,
  enthalpyOfVaporization: number,
): "solid" | "liquid" | "gas" {
  // Adjust boiling point for current pressure
  const adjustedBoilingPoint = calculateBoilingPointAtPressure(
    boilingPointC,
    enthalpyOfVaporization,
    pressureAtm,
  );

  if (temperatureC < meltingPointC) return "solid";
  if (temperatureC < adjustedBoilingPoint) return "liquid";
  return "gas";
}

/**
 * Calculates the amount of solute that precipitates when concentration
 * exceeds the solubility limit.
 *
 * @param currentConcentration Current molar concentration (M).
 * @param solubilityProduct Solubility product constant (Ksp, M).
 * @param volumeInLiters Volume of the solution.
 * @returns Moles of solute that precipitate (0 if below saturation).
 */
export function calculatePrecipitation(
  currentConcentration: number,
  solubilityProduct: number,
  volumeInLiters: number,
): number {
  if (currentConcentration <= solubilityProduct) return 0;

  const excessConcentration = currentConcentration - solubilityProduct;
  return excessConcentration * volumeInLiters;
}
