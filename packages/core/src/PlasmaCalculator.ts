import { Atom } from "./Atom";

/**
 * Boltzmann constant (eV/K).
 */
const KB_EV = 8.617e-5;

/**
 * Stefan-Boltzmann constant (W/(m²·K⁴)).
 */
const SIGMA = 5.67e-8;

/**
 * Elementary charge (Coulombs).
 */
const ELEMENTARY_CHARGE = 1.602e-19;

/**
 * Electron mass (kg).
 */
const ELECTRON_MASS = 9.109e-31;

/**
 * Degree of ionization from the Saha Ionization Equation.
 *
 * nᵢ·nₑ / nₙ = (2πmₑkT/h²)^(3/2) · (2Zᵢ/Zₙ) · exp(-Eᵢ/kT)
 *
 * The ionization fraction represents the proportion of atoms that have
 * lost an electron at thermal equilibrium.
 *
 * @param atom The element being ionized.
 * @param temperatureK Temperature in Kelvin.
 * @param electronDensity Free electron density (m⁻³).
 * Ionization fraction (0–1).
 */
export function calculateSahaIonization(
  atom: Atom,
  temperatureK: number,
  electronDensity: number = 1e20,
): number {
  if (!atom.ionizationEnergy) return 0;

  const Ei = atom.ionizationEnergy; // eV
  const kT = KB_EV * temperatureK; // eV

  // Simplified Saha equation (assuming partition function ratio ≈ 1)
  // nᵢ/nₙ = (2/ne) · (2πmₑkT/h²)^(3/2) · exp(-Ei/kT)
  const thermalWavelength = Math.pow(2 * Math.PI * ELECTRON_MASS * kT * ELEMENTARY_CHARGE / (6.626e-34 * 6.626e-34), 1.5);
  const ionizationRatio = (2 / electronDensity) * thermalWavelength * Math.exp(-Ei / kT);

  // Ionization fraction: f = nᵢ / (nᵢ + nₙ) = ratio / (1 + ratio)
  return ionizationRatio / (1 + ionizationRatio);
}

/**
 * Calculates the Lorentz force on a charged particle.
 *
 * F = q(E + v × B)
 *
 * @param charge Particle charge in Coulombs.
 * @param velocity Particle velocity vector [vx, vy, vz] (m/s).
 * @param electricField Electric field vector [Ex, Ey, Ez] (V/m).
 * @param magneticField Magnetic field vector [Bx, By, Bz] (Tesla).
 * @returns Force vector [Fx, Fy, Fz] (Newtons).
 */
export function calculateLorentzForce(
  charge: number,
  velocity: [number, number, number],
  electricField: [number, number, number],
  magneticField: [number, number, number],
): [number, number, number] {
  // Cross product: v × B
  const crossProduct: [number, number, number] = [
    velocity[1] * magneticField[2] - velocity[2] * magneticField[1],
    velocity[2] * magneticField[0] - velocity[0] * magneticField[2],
    velocity[0] * magneticField[1] - velocity[1] * magneticField[0],
  ];

  // F = q(E + v × B)
  return [
    charge * (electricField[0] + crossProduct[0]),
    charge * (electricField[1] + crossProduct[1]),
    charge * (electricField[2] + crossProduct[2]),
  ];
}

/**
 * Calculates the radiative power loss from plasma via the Stefan-Boltzmann Law.
 *
 * P = εσAT⁴
 *
 * @param temperatureK Plasma temperature in Kelvin.
 * @param surfaceArea Surface area of the plasma volume (m²).
 * @param emissivity Emissivity factor (0–1, typically ~0.9 for plasma).
 * @returns Radiated power in Watts.
 */
export function calculateRadiativePowerLoss(
  temperatureK: number,
  surfaceArea: number,
  emissivity: number = 0.9,
): number {
  return emissivity * SIGMA * surfaceArea * Math.pow(temperatureK, 4);
}

/**
 * Estimates the dominant emission wavelength of a plasma based on temperature.
 *
 * Uses Wien's Displacement Law: λ_max = b/T
 *
 * @param temperatureK Plasma temperature in Kelvin.
 * @returns Peak emission wavelength in nanometers.
 */
export function calculatePeakEmissionWavelength(temperatureK: number): number {
  // Wien's displacement constant: 2.898e-3 m·K
  const wienConstant = 2.898e-3;
  const wavelengthM = wienConstant / temperatureK;
  return wavelengthM * 1e9; // Convert to nanometers
}

/**
 * Determines whether a substance is in the plasma phase.
 *
 * Plasma forms when temperature exceeds the ionization threshold
 * (typically > 5000 K for most elements).
 *
 * @param temperatureK Temperature in Kelvin.
 * @returns True if the substance is likely in the plasma phase.
 */
export function isPlasmaPhase(temperatureK: number): boolean {
  return temperatureK > 5000;
}
