import { PhysicalConstants } from "./PhysicalConstants";

/**
 * Fundamental physical laws governing chemical systems.
 *
 * Provides calculations for thermodynamics (Arrhenius kinetics, Gibbs free energy,
 * Nernst electrochemical potential), gas behavior (ideal and real gas equations),
 * plasma physics (Saha ionization, Lorentz force), radiation (Stefan-Boltzmann,
 * Wien's displacement), phase transitions (Clausius-Clapeyron), and thermal
 * energy transfer during chemical reactions.
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
  calculateGibbsFreeEnergy: (electronsTransferred: number, standardPotential: number): number =>
    -(electronsTransferred * PhysicalConstants.FARADAY * standardPotential) / 1000,

  /**
   * Nernst equation: E = E° - (RT/nF) × ln(Q)
   *
   * @param standardPotential Standard cell potential E° (V).
   * @param electronsTransferred Number of electrons (n).
   * @param temperatureK Temperature in Kelvin.
   * @param reactionQuotient Reaction quotient Q.
   * @returns Cell potential under non-standard conditions (V).
   */
  calculateNernstPotential: (
    standardPotential: number,
    electronsTransferred: number,
    temperatureK: number,
    reactionQuotient: number,
  ): number => {
    if (reactionQuotient <= 0) return standardPotential;
    const nernstTerm = (PhysicalConstants.GAS_CONSTANT * temperatureK) /
      (electronsTransferred * PhysicalConstants.FARADAY);
    return standardPotential - nernstTerm * Math.log(reactionQuotient);
  },

  // ── Gas Laws ────────────────────────────────────────────────────

  /**
   * Ideal Gas Law: V = nRT/P
   *
   * @param moles Number of moles.
   * @param temperatureK Temperature in Kelvin.
   * @param pressureAtm Pressure in atmospheres.
   * @returns Volume in liters.
   */
  calculateIdealGasVolume: (moles: number, temperatureK: number, pressureAtm: number = 1.0): number =>
    (moles * PhysicalConstants.GAS_CONSTANT_L_ATM * temperatureK) / pressureAtm,

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
  calculateVanDerWaalsPressure: (
    moles: number,
    volume: number,
    temperatureK: number,
    vanDerWaalsA: number,
    vanDerWaalsB: number,
  ): number => {
    const idealTerm = (moles * PhysicalConstants.GAS_CONSTANT_L_ATM * temperatureK) /
      (volume - moles * vanDerWaalsB);
    const correctionTerm = (vanDerWaalsA * moles * moles) / (volume * volume);
    return idealTerm - correctionTerm;
  },

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
  calculateSahaIonization: (
    ionizationEnergy: number,
    temperatureK: number,
    electronDensity: number = 1e20,
  ): number => {
    const kT = PhysicalConstants.BOLTZMANN_EV * temperatureK;
    const thermalWavelength = Math.pow(
      2 * Math.PI * PhysicalConstants.ELECTRON_MASS *
      kT * PhysicalConstants.ELEMENTARY_CHARGE /
      (PhysicalConstants.PLANCK * PhysicalConstants.PLANCK),
      1.5
    );
    const ionizationRatio = (2 / electronDensity) * thermalWavelength * Math.exp(-ionizationEnergy / kT);
    return ionizationRatio / (1 + ionizationRatio);
  },

  /**
   * Lorentz Force: F = q(E + v × B)
   *
   * @param charge Particle charge (C).
   * @param velocity Velocity vector [vx, vy, vz] (m/s).
   * @param electricField Electric field vector [Ex, Ey, Ez] (V/m).
   * @param magneticField Magnetic field vector [Bx, By, Bz] (T).
   * @returns Force vector [Fx, Fy, Fz] (N).
   */
  calculateLorentzForce: (
    charge: number,
    velocity: [number, number, number],
    electricField: [number, number, number],
    magneticField: [number, number, number],
  ): [number, number, number] => {
    const crossProduct: [number, number, number] = [
      velocity[1] * magneticField[2] - velocity[2] * magneticField[1],
      velocity[2] * magneticField[0] - velocity[0] * magneticField[2],
      velocity[0] * magneticField[1] - velocity[1] * magneticField[0],
    ];
    return [
      charge * (electricField[0] + crossProduct[0]),
      charge * (electricField[1] + crossProduct[1]),
      charge * (electricField[2] + crossProduct[2]),
    ];
  },

  // ── Radiation ───────────────────────────────────────────────────

  /**
   * Stefan-Boltzmann Law: P = εσAT⁴
   *
   * @param temperatureK Temperature in Kelvin.
   * @param surfaceArea Surface area (m²).
   * @param emissivity Emissivity (0–1).
   * @returns Radiated power (W).
   */
  calculateRadiativePower: (temperatureK: number, surfaceArea: number, emissivity: number = 0.9): number =>
    emissivity * PhysicalConstants.STEFAN_BOLTZMANN * surfaceArea * Math.pow(temperatureK, 4),

  /**
   * Wien's Displacement Law: λ_max = b/T
   *
   * @param temperatureK Temperature in Kelvin.
   * @returns Peak emission wavelength (nm).
   */
  calculatePeakWavelength: (temperatureK: number): number =>
    (PhysicalConstants.WIEN_DISPLACEMENT / temperatureK) * 1e9,

  // ── Phase Transitions ───────────────────────────────────────────

  /**
   * Clausius-Clapeyron relation: ln(P₂/P₁) = (ΔHvap/R) × (1/T₁ - 1/T₂)
   *
   * @param normalBoilingPointC Boiling point at 1 atm (°C).
   * @param enthalpyOfVaporization Enthalpy of vaporization (kJ/mol).
   * @param pressureAtm Current pressure (atm).
   * @returns Boiling point at given pressure (°C).
   */
  calculateBoilingPointAtPressure: (
    normalBoilingPointC: number,
    enthalpyOfVaporization: number,
    pressureAtm: number,
  ): number => {
    const T1 = normalBoilingPointC + PhysicalConstants.ABSOLUTE_ZERO_OFFSET;
    const dHvap = enthalpyOfVaporization * 1000;
    const lnPressureRatio = Math.log(pressureAtm / PhysicalConstants.STANDARD_PRESSURE_ATM);
    const inverseT2 = 1 / T1 - (PhysicalConstants.GAS_CONSTANT / dHvap) * lnPressureRatio;
    if (inverseT2 <= 0) return normalBoilingPointC;
    const T2 = 1 / inverseT2;
    return T2 - PhysicalConstants.ABSOLUTE_ZERO_OFFSET;
  },

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
