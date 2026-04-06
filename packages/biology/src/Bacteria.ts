import { Enzyme } from "@atomika-lab/biochem";

/**
 * A bacterial cell hosting enzymatic machinery.
 *
 * Manages a collection of enzymes and tracks the organism's
 * viability under pharmacological stress.
 */
export class Bacteria {
  /**
   * Enzymatic machinery available within the cell.
   */
  private enzymes: Enzyme[] = [];

  /**
   * Viability fraction (0–1). 1.0 = fully viable, 0.0 = non-viable.
   */
  private viability = 1.0;

  /**
   * Registers an enzyme within the bacterial cell.
   */
  addEnzyme(enzyme: Enzyme): void {
    this.enzymes.push(enzyme);
  }

  /**
   * Returns all enzymes currently expressed by the bacterium.
   */
  getEnzymes(): ReadonlyArray<Enzyme> {
    return this.enzymes;
  }

  /**
   * Updates viability based on cumulative enzymatic inhibition.
   */
  updateViability(): void {
    const activeFraction = this.enzymes.filter(e => !("isDenatured" in e && e.isDenatured)).length /
      Math.max(this.enzymes.length, 1);
    this.viability = activeFraction;
  }

  /**
   * Current viability fraction.
   */
  getViability(): number {
    return this.viability;
  }

  /**
   * Whether the bacterium is still viable (viability > 0.1).
   */
  isAlive(): boolean {
    return this.viability > 0.1;
  }
}
