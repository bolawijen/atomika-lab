/**
 * Physical and chemical parameters defining an atomic species.
 */
export interface AtomicParameters {
  name: string;
  symbol: string;
  protonCount: number;
  mass: number;
  charge?: number;
  valence?: number;
  /**
   * Possible oxidation states for this element.
   * E.g., Iron: [-2, -1, 0, 1, 2, 3, 4, 5, 6], common: [2, 3].
   */
  oxidationStates?: number[];
  /**
   * Common coordination numbers for this element.
   * E.g., Iron: [4, 6], Copper: [4, 6].
   */
  coordinationNumbers?: number[];
  /**
   * First ionization energy in electron volts (eV).
   * Energy required to remove the most loosely bound electron.
   * E.g., Hydrogen: 13.6 eV, Carbon: 11.3 eV, Iron: 7.9 eV.
   */
  ionizationEnergy?: number;
  /**
   * Van der Waals radius (Ångströms).
   * Defines the effective spatial extent of the atom for steric calculations.
   * E.g., Hydrogen: 1.20 Å, Carbon: 1.70 Å, Oxygen: 1.52 Å.
   */
  vanDerWaalsRadius?: number;
}

/**
 * A chemical atom, the fundamental building block of matter.
 * Characterized by name, symbol, proton count, mass, charge, and valence.
 */
export class Atom {
  name: string;
  symbol: string;
  protonCount: number;
  mass: number;
  charge: number;
  valence?: number;
  /** Possible oxidation states for this element. */
  readonly oxidationStates?: number[];
  /** Common coordination numbers for this element. */
  readonly coordinationNumbers?: number[];
  /** First ionization energy in electron volts (eV). */
  readonly ionizationEnergy?: number;
  /** Van der Waals radius (Ångströms). */
  readonly vanDerWaalsRadius?: number;

  constructor(params: AtomicParameters) {
    this.name = params.name;
    this.symbol = params.symbol;
    this.protonCount = params.protonCount;
    this.mass = params.mass;
    this.charge = params.charge ?? 0;
    this.valence = params.valence;
    this.oxidationStates = params.oxidationStates;
    this.coordinationNumbers = params.coordinationNumbers;
    this.ionizationEnergy = params.ionizationEnergy;
    this.vanDerWaalsRadius = params.vanDerWaalsRadius;
  }

  /** Number of neutrons, derived from mass minus proton count. */
  get neutronCount(): number {
    return Math.round(this.mass - this.protonCount);
  }
}
