/**
 * Fundamental physical quantity types for @atomika-lab/core.
 *
 * Branded types prevent accidental unit mismatches in calculations.
 * Each type carries its unit as a phantom type at compile time.
 */

/**
 * Molar energy — capacity to perform work during chemical transformations per amount of substance.
 *
 * Measured in kilojoules per mole (kJ/mol). Used for bond dissociation energy,
 * reaction enthalpy, and activation energy barriers.
 */
export type MolarEnergy = number & { readonly __unit: "kJ/mol" };

/**
 * Ionization energy — work required to remove an electron from an isolated atom or molecule.
 *
 * Measured in electronvolts (eV). Used for atomic ionization potentials.
 */
export type IonizationEnergy = number & { readonly __unit: "eV" };

/**
 * Thermal energy — kinetic energy of particles due to random motion.
 *
 * Measured in joules (J). Used for Brownian motion and heat transfer.
 */
export type ThermalEnergy = number & { readonly __unit: "J" };

/**
 * Atomic mass — mass of a single atom or molecule relative to carbon-12.
 *
 * Measured in daltons (Da), where 1 Da = 1/12 the mass of a carbon-12 atom.
 */
export type AtomicMass = number & { readonly __unit: "Da" };

/**
 * Molar mass — mass per amount of substance.
 *
 * Measured in grams per mole (g/mol). Used for molecular weight calculations.
 */
export type MolarMass = number & { readonly __unit: "g/mol" };

/**
 * Macroscopic mass — total mass of a bulk sample.
 *
 * Measured in kilograms (kg). Used for laboratory-scale quantities.
 */
export type Mass = number & { readonly __unit: "kg" };

/**
 * Bond length — equilibrium distance between bonded nuclei.
 *
 * Measured in ångströms (Å), where 1 Å = 10⁻¹⁰ m.
 */
export type BondLength = number & { readonly __unit: "Å" };

/**
 * Molecular length — characteristic size of a molecule or intermolecular distance.
 *
 * Measured in nanometers (nm).
 */
export type MolecularLength = number & { readonly __unit: "nm" };

/**
 * Macroscopic length — laboratory-scale distance.
 *
 * Measured in meters (m). Used for vessel dimensions and path lengths.
 */
export type Length = number & { readonly __unit: "m" };

/**
 * Thermodynamic temperature — absolute measure of average particle kinetic energy.
 *
 * Measured in kelvins (K), where 0 K is absolute zero.
 */
export type ThermodynamicTemperature = number & { readonly __unit: "K" };

/**
 * Celsius temperature — temperature relative to water's freezing point.
 *
 * Measured in degrees Celsius (°C). Used for laboratory and physiological conditions.
 */
export type CelsiusTemperature = number & { readonly __unit: "°C" };

/**
 * Duration — extent of time over which a process occurs.
 *
 * Measured in seconds (s). Used for reaction kinetics and simulation time steps.
 */
export type Duration = number & { readonly __unit: "s" };

/**
 * Amount of substance — number of elementary entities (atoms, molecules, ions).
 *
 * Measured in moles (mol), where 1 mol = 6.022 × 10²³ entities.
 */
export type AmountOfSubstance = number & { readonly __unit: "mol" };

/**
 * Atmospheric pressure — force per unit area exerted by the atmosphere.
 *
 * Measured in atmospheres (atm), where 1 atm = standard sea-level pressure.
 */
export type AtmosphericPressure = number & { readonly __unit: "atm" };

/**
 * Pressure — force per unit area in SI units.
 *
 * Measured in pascals (Pa), where 1 Pa = 1 N/m².
 */
export type Pressure = number & { readonly __unit: "Pa" };

/**
 * Diffusivity — rate at which particles spread through a medium.
 *
 * Measured in square meters per second (m²/s).
 */
export type Diffusivity = number & { readonly __unit: "m²/s" };
