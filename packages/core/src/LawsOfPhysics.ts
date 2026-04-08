import { PhysicalConstants } from "./PhysicalConstants";
import {
  calculateGibbsFreeEnergy,
  calculateNernstPotential,
} from "./RedoxCalculator";
import {
  calculateSahaIonization,
  calculateLorentzForce,
  calculateRadiativePowerLoss,
  calculatePeakEmissionWavelength,
} from "./PlasmaCalculator";
import {
  calculateIdealGasVolume,
  calculateVanDerWaalsPressure,
  calculateBoilingPointAtPressure,
} from "./PhaseCalculator";

/**
 * Fundamental physical laws governing chemical systems.
 *
 * Re-exports calculator module functions as a unified namespace for
 * thermodynamics, gas behavior, plasma physics, radiation, and phase
 * transitions.
 */
export const LawsOfPhysics = {
  // ── Thermodynamics ──────────────────────────────────────────────

  /**
   * Arrhenius equation: k = A × exp(-Ea / RT)
   *
   * @param activationEnergy Activation energy (kJ/mol).
   * @param temperatureK Temperature in Kelvin.
   * @param preExponentialFactor Frequency factor A (s⁻¹).
   * @returns Rate constant (s⁻¹).
   */
  calculateArrheniusRate: (
    activationEnergy: number,
    temperatureK: number,
    preExponentialFactor: number = 1e13,
  ): number => preExponentialFactor * Math.exp(
    -activationEnergy / (PhysicalConstants.GAS_CONSTANT * temperatureK)
  ),

  /**
   * Gibbs Free Energy: ΔG = -nFE°
   *
   * @param electronsTransferred Number of electrons (n).
   * @param standardPotential Standard cell potential E° (V).
   * @returns Gibbs Free Energy (kJ/mol).
   */
  calculateGibbsFreeEnergy,

  /**
   * Nernst equation: E = E° - (RT/nF) × ln(Q)
   *
   * @param standardPotential Standard cell potential E° (V).
   * @param electronsTransferred Number of electrons (n).
   * @param temperatureK Temperature in Kelvin.
   * @param reactionQuotient Reaction quotient Q.
   * @returns Cell potential under non-standard conditions (V).
   */
  calculateNernstPotential,

  // ── Gas Laws ────────────────────────────────────────────────────

  /**
   * Ideal Gas Law: V = nRT/P
   *
   * @param moles Number of moles.
   * @param temperatureK Temperature in Kelvin.
   * @param pressureAtm Pressure in atmospheres.
   * @returns Volume in liters.
   */
  calculateIdealGasVolume,

  /**
   * Van der Waals equation for real gases: P = nRT/(V-nb) - an²/V²
   *
   * @param moles Number of moles.
   * @param volume Volume (L).
   * @param temperatureK Temperature in Kelvin.
   * @param vanDerWaalsA Attraction parameter (L²·atm/mol²).
   * @param vanDerWaalsB Volume exclusion parameter (L/mol).
   * @returns Pressure (atm).
   */
  calculateVanDerWaalsPressure,

  // ── Plasma Physics ──────────────────────────────────────────────

  /**
   * Saha Ionization Equation (simplified):
   * nᵢ/nₙ = (2/ne) × (2πmₑkT/h²)^(3/2) × exp(-Eᵢ/kT)
   *
   * @param ionizationEnergy Ionization energy (eV).
   * @param temperatureK Temperature in Kelvin.
   * @param electronDensity Free electron density (m⁻³).
   * @returns Ionization fraction (0–1).
   */
  calculateSahaIonization,

  /**
   * Lorentz Force: F = q(E + v × B)
   *
   * @param charge Particle charge (C).
   * @param velocity Velocity vector [vx, vy, vz] (m/s).
   * @param electricField Electric field vector [Ex, Ey, Ez] (V/m).
   * @param magneticField Magnetic field vector [Bx, By, Bz] (T).
   * @returns Force vector [Fx, Fy, Fz] (N).
   */
  calculateLorentzForce,

  // ── Radiation ───────────────────────────────────────────────────

  /**
   * Stefan-Boltzmann Law: P = εσAT⁴
   *
   * @param temperatureK Temperature in Kelvin.
   * @param surfaceArea Surface area (m²).
   * @param emissivity Emissivity (0–1).
   * @returns Radiated power (W).
   */
  calculateRadiativePower: calculateRadiativePowerLoss,

  /**
   * Wien's Displacement Law: λ_max = b/T
   *
   * @param temperatureK Temperature in Kelvin.
   * @returns Peak emission wavelength (nm).
   */
  calculatePeakWavelength: calculatePeakEmissionWavelength,

  // ── Phase Transitions ───────────────────────────────────────────

  /**
   * Clausius-Clapeyron relation: ln(P₂/P₁) = (ΔHvap/R) × (1/T₁ - 1/T₂)
   *
   * @param normalBoilingPointC Boiling point at 1 atm (°C).
   * @param enthalpyOfVaporization Enthalpy of vaporization (kJ/mol).
   * @param pressureAtm Current pressure (atm).
   * @returns Boiling point at given pressure (°C).
   */
  calculateBoilingPointAtPressure,

  // ── Temperature Conversion ──────────────────────────────────────

  /** Celsius to Kelvin. */
  celsiusToKelvin: (temperatureC: number): number =>
    temperatureC + PhysicalConstants.ABSOLUTE_ZERO_OFFSET,

  /** Kelvin to Celsius. */
  kelvinToCelsius: (temperatureK: number): number =>
    temperatureK - PhysicalConstants.ABSOLUTE_ZERO_OFFSET,

  // ── Thermal Drift ───────────────────────────────────────────────

  /**
   * Calculates temperature change from reaction enthalpy.
   *
   * ΔT = (n × |ΔH| × 1000) / (m × Cp × NA)
   *
   * where n = number of bond events, ΔH = enthalpy (kJ/mol),
   * m = mass of solvent (g), Cp = specific heat capacity (J/g·°C),
   * NA = Avogadro's number.
   *
   * @param bondEvents Number of bonds cleaved (positive) or formed (negative).
   * @param enthalpy Enthalpy of reaction (kJ/mol). Negative = exothermic.
   * @param vesselVolume Volume of the reaction vessel (L).
   * @returns Temperature change (°C). Positive for heating, negative for cooling.
   */
  calculateThermalDrift: (bondEvents: number, enthalpy: number, vesselVolume: number): number => {
    if (bondEvents === 0 || vesselVolume <= 0) return 0;

    const waterMass = vesselVolume * PhysicalConstants.WATER_DENSITY;
    const energyJoules = bondEvents * Math.abs(enthalpy) * 1000 / PhysicalConstants.AVOGADRO;
    const temperatureChange = energyJoules / (waterMass * PhysicalConstants.SPECIFIC_HEAT_WATER);

    return enthalpy < 0 ? temperatureChange : -temperatureChange;
  },
} as const;
