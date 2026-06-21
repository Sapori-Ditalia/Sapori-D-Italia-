/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MacroRegion = 'Nord' | 'Centro' | 'Sud';

export type Difficulty = 'Facile' | 'Media' | 'Difficile';

export interface Recipe {
  id: string;
  name: string;
  region: string;
  macroRegion: MacroRegion;
  image: string;
  prepTime: string;
  difficulty: Difficulty;
  ingredients: string[];
  instructions: string[];
  description: string;
  featured: boolean;
  servings: number;
  isAiGenerated?: boolean;
}

export interface RegionInfo {
  name: string;
  macroRegion: MacroRegion;
  description: string;
  capital: string;
  image: string;
}
