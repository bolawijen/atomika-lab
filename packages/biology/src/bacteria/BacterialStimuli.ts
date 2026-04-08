/**
 * Environmental events affecting bacterial cells.
 *
 * Stimuli that trigger regulatory response pathways in living organisms.
 */

/**
 * Base interface for all environmental events.
 */
export interface EnvironmentalEvent {
  /**
   * Event classification.
   */
  readonly type: string;
}

/**
 * Damage to the peptidoglycan cell wall.
 *
 * Caused by beta-lactam antibiotics, lysozyme, or osmotic shock.
 */
export interface CellWallDamageEvent extends EnvironmentalEvent {
  readonly type: "cellWallDamage";
  /**
   * Damage severity (0–1).
   */
  readonly severity: number;
  /**
   * Whether damage is irreversible.
   */
  readonly isIrreversible: boolean;
}

/**
 * Damage to the cell membrane lipid bilayer.
 *
 * Caused by polymyxins, detergents, or oxidative stress.
 */
export interface MembraneDamageEvent extends EnvironmentalEvent {
  readonly type: "membraneDamage";
  /**
   * Damage severity (0–1).
   */
  readonly severity: number;
  /**
   * Whether damage is irreversible.
   */
  readonly isIrreversible: boolean;
}

/**
 * Damage to chromosomal DNA.
 *
 * Caused by UV radiation, reactive oxygen species, or DNA-damaging agents.
 */
export interface DnaDamageEvent extends EnvironmentalEvent {
  readonly type: "dnaDamage";
  /**
   * Damage severity (0–1).
   */
  readonly severity: number;
  /**
   * Whether damage is irreversible.
   */
  readonly isIrreversible: boolean;
}

/**
 * Denaturation of cellular proteins.
 *
 * Caused by heat, extreme pH, or heavy metals.
 */
export interface ProteinDenaturationEvent extends EnvironmentalEvent {
  readonly type: "proteinDenaturation";
  /**
   * Denaturation severity (0–1).
   */
  readonly severity: number;
  /**
   * Whether damage is irreversible.
   */
  readonly isIrreversible: boolean;
}

/**
 * Inhibition of ribosomal protein synthesis.
 *
 * Caused by aminoglycosides, tetracyclines, or macrolides.
 */
export interface RibosomeInhibitionEvent extends EnvironmentalEvent {
  readonly type: "ribosomeInhibition";
  /**
   * Inhibition severity (0–1).
   */
  readonly severity: number;
  /**
   * Whether inhibition is irreversible.
   */
  readonly isIrreversible: boolean;
}

/**
 * Inhibition of metabolic pathways.
 *
 * Caused by sulfonamides or antimetabolites.
 */
export interface MetabolicInhibitionEvent extends EnvironmentalEvent {
  readonly type: "metabolicInhibition";
  /**
   * Inhibition severity (0–1).
   */
  readonly severity: number;
  /**
   * Whether inhibition is irreversible.
   */
  readonly isIrreversible: boolean;
}

/**
 * Change in environmental conditions.
 *
 * Triggers homeostatic response pathways.
 */
export interface EnvironmentalChangeEvent extends EnvironmentalEvent {
  readonly type: "environmentalChange";
  /**
   * Temperature change in Celsius.
   */
  readonly temperatureDelta?: number;
  /**
   * New environmental pH.
   */
  readonly newPh?: number;
  /**
   * Oxygen availability.
   */
  readonly oxygenAvailable?: boolean;
  /**
   * Nutrient concentration change.
   */
  readonly nutrientChange?: number;
}
