/**
 * Properties defining a chemical atom.
 */
export interface AtomProps {
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

  constructor(props: AtomProps) {
    this.name = props.name;
    this.symbol = props.symbol;
    this.protonCount = props.protonCount;
    this.mass = props.mass;
    this.charge = props.charge ?? 0;
    this.valence = props.valence;
    this.oxidationStates = props.oxidationStates;
    this.coordinationNumbers = props.coordinationNumbers;
    this.ionizationEnergy = props.ionizationEnergy;
    this.vanDerWaalsRadius = props.vanDerWaalsRadius;
  }

  getNeutrons(): number {
    return Math.round(this.mass - this.protonCount);
  }
}
