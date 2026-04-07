/**
 * Fundamental physical quantity types for @atomika-lab/core.
 *
 * Branded types prevent accidental unit mismatches in calculations.
 * Each type carries its unit as a phantom type at compile time.
 */

export type MolarEnergy = number & { readonly __unit: "kJ/mol" };
export type IonizationEnergy = number & { readonly __unit: "eV" };
export type ThermalEnergy = number & { readonly __unit: "J" };
export type AtomicMass = number & { readonly __unit: "Da" };
export type MolarMass = number & { readonly __unit: "g/mol" };
export type Mass = number & { readonly __unit: "kg" };
export type BondLength = number & { readonly __unit: "Å" };
export type MolecularLength = number & { readonly __unit: "nm" };
export type Length = number & { readonly __unit: "m" };
export type ThermodynamicTemperature = number & { readonly __unit: "K" };
export type CelsiusTemperature = number & { readonly __unit: "°C" };
export type Duration = number & { readonly __unit: "s" };
export type AmountOfSubstance = number & { readonly __unit: "mol" };
export type AtmosphericPressure = number & { readonly __unit: "atm" };
export type Pressure = number & { readonly __unit: "Pa" };
export type Diffusivity = number & { readonly __unit: "m²/s" };
