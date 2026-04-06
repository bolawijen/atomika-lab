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

  constructor(props: AtomProps) {
    this.name = props.name;
    this.symbol = props.symbol;
    this.protonCount = props.protonCount;
    this.mass = props.mass;
    this.charge = props.charge ?? 0;
    this.valence = props.valence;
  }

  getNeutrons(): number {
    return Math.round(this.mass - this.protonCount);
  }
}
