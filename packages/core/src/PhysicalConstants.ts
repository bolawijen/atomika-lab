/**
 * Universal physical constants used across all chemical and physical calculations.
 *
 * Values sourced from CODATA 2018 recommended constants.
 */
export const PhysicalConstants = {
  /** Boltzmann constant (eV/K). */
  BOLTZMANN_EV: 8.617e-5,
  /** Boltzmann constant (J/K). */
  BOLTZMANN_J: 1.381e-23,
  /** Stefan-Boltzmann constant (W/(m²·K⁴)). */
  STEFAN_BOLTZMANN: 5.67e-8,
  /** Elementary charge (Coulombs). */
  ELEMENTARY_CHARGE: 1.602e-19,
  /** Electron mass (kg). */
  ELECTRON_MASS: 9.109e-31,
  /** Planck constant (J·s). */
  PLANCK: 6.626e-34,
  /** Universal gas constant (J/(mol·K)). */
  GAS_CONSTANT: 8.314,
  /** Faraday constant (C/mol). */
  FARADAY: 96485,
  /** Avogadro's number (mol⁻¹). */
  AVOGADRO: 6.022e23,
  /** Ideal gas constant in L·atm/(mol·K). */
  GAS_CONSTANT_L_ATM: 0.08206,
  /** Standard pressure (atm). */
  STANDARD_PRESSURE_ATM: 1.0,
  /** Specific heat capacity of water (J/(g·°C)). */
  SPECIFIC_HEAT_WATER: 4.184,
  /** Density of water (g/L). */
  WATER_DENSITY: 1000,
  /** Wien's displacement constant (m·K). */
  WIEN_DISPLACEMENT: 2.898e-3,
  /** Absolute zero offset (K). */
  ABSOLUTE_ZERO_OFFSET: 273.15,
} as const;
