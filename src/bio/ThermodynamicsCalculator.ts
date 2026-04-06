/**
 * Calculates temperature changes resulting from reaction enthalpy.
 *
 * Exothermic reactions (ΔH < 0) release heat, raising the mixture temperature.
 * Endothermic reactions (ΔH > 0) absorb heat, lowering it.
 */
export class ThermodynamicsCalculator {
  /**
   * Specific heat capacity of water in J/(g·°C).
   */
  private static readonly SPECIFIC_HEAT_WATER = 4.184;

  /**
   * Density of water in g/L.
   */
  private static readonly WATER_DENSITY = 1000;

  /**
   * Avogadro's number — molecules per mole.
   */
  private static readonly AVOGADRO = 6.022e23;

  /**
   * Calculates the temperature change caused by a reaction.
   *
   * @param bondsChanged Number of bonds cleaved (positive) or formed (negative).
   * @param deltaH Enthalpy of reaction in kJ/mol (negative for exothermic).
   * @param volumeInLiters Volume of the reaction vessel in liters.
   * @returns Temperature change in °C (positive for heating, negative for cooling).
   */
  static calculateTemperatureChange(
    bondsChanged: number,
    deltaH: number,
    volumeInLiters: number,
  ): number {
    if (bondsChanged === 0) return 0;

    // Mass of water in the vessel
    const waterMass = volumeInLiters * this.WATER_DENSITY;

    // Energy released or absorbed: bonds × |ΔH| converted from kJ/mol to J
    const energyJoules = bondsChanged * Math.abs(deltaH) * 1000 / this.AVOGADRO;

    // Temperature change: Q / (m × Cp)
    const temperatureChange = energyJoules / (waterMass * this.SPECIFIC_HEAT_WATER);

    // Exothermic (ΔH < 0) raises temperature; endothermic lowers it
    return deltaH < 0 ? temperatureChange : -temperatureChange;
  }
}
