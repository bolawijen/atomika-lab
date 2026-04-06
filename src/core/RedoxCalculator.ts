/**
 * Faraday constant — charge per mole of electrons (C/mol).
 */
const FARADAY = 96485;

/**
 * Universal gas constant (J/(mol·K)).
 */
const GAS_CONSTANT = 8.314;

/**
 * Calculates the Gibbs Free Energy change for a redox reaction.
 *
 * ΔG = -nFE°
 *
 * A negative ΔG indicates a spontaneous reaction under standard conditions.
 *
 * @param electronsTransferred Number of electrons transferred (n).
 * @param standardPotential Standard cell potential E° in volts (E°cathode - E°anode).
 * @returns Gibbs Free Energy change in kJ/mol.
 */
export function calculateGibbsFreeEnergy(electronsTransferred: number, standardPotential: number): number {
  return -(electronsTransferred * FARADAY * standardPotential) / 1000;
}

/**
 * Calculates the cell potential under non-standard conditions using the Nernst equation.
 *
 * E = E° - (RT/nF) × ln(Q)
 *
 * @param standardPotential Standard cell potential E° in volts.
 * @param electronsTransferred Number of electrons transferred (n).
 * @param temperature Temperature in Kelvin.
 * @param reactionQuotient Reaction quotient Q (product activities / reactant activities).
 * @returns Cell potential in volts under the given conditions.
 */
export function calculateNernstPotential(
  standardPotential: number,
  electronsTransferred: number,
  temperature: number,
  reactionQuotient: number,
): number {
  if (reactionQuotient <= 0) return standardPotential;
  const nernstTerm = (GAS_CONSTANT * temperature) / (electronsTransferred * FARADAY);
  return standardPotential - nernstTerm * Math.log(reactionQuotient);
}

/**
 * Determines whether a redox reaction is spontaneous under the given conditions.
 *
 * @param electronsTransferred Number of electrons transferred (n).
 * @param standardPotential Standard cell potential E° in volts.
 * @returns True if ΔG < 0 (spontaneous).
 */
export function isRedoxSpontaneous(electronsTransferred: number, standardPotential: number): boolean {
  return calculateGibbsFreeEnergy(electronsTransferred, standardPotential) < 0;
}
