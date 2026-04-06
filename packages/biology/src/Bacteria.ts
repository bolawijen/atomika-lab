import { Enzyme } from "@atomika-lab/biochem";
import { Polymerase } from "./Polymerase";
import { Rifampicin } from "@atomika-lab/pharmacology";

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

  /**
   * Responds to drug exposure through passive diffusion and target binding.
   *
   * The drug molecule is a passive data source; the biological system
   * drives the pharmacological process through thermodynamic interactions.
   *
   * @param drug The medicinal substance present in the environment.
   */
  exposedTo(drug: Rifampicin): void {
    // Passive diffusion driven by lipophilicity (LogP > 0 implies membrane permeability)
    if (drug.logP <= 0) return;

    // Target recognition — structural complementarity
    const polymerase = this.enzymes.find(e => e instanceof Polymerase) as Polymerase | undefined;
    if (!polymerase) return;

    // Reversible binding — driven by binding affinity (Kd)
    polymerase.bindLigand(drug, drug.dissociationConstant);

    this.updateViability();
  }
}
