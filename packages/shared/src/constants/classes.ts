import type { CharacterClass, CharacterClassId } from '../types/game.js';

/**
 * Character classes. The original three (TITAN, WRAITH, PRISM) are preserved;
 * ORACLE and VOID are added. Flavor only — no unbalanced gameplay effects.
 */
export const CHARACTER_CLASSES: readonly CharacterClass[] = [
  {
    id: 'TITAN',
    name: 'Titan',
    description: 'Heavy-grid bruiser. Built to hold lanes and absorb pressure.',
    defaultColor: '#00f3ff',
    markerShape: 'square',
  },
  {
    id: 'WRAITH',
    name: 'Wraith',
    description: 'Aggressive infiltrator. Lives for the bump and the purge.',
    defaultColor: '#f27d26',
    markerShape: 'diamond',
  },
  {
    id: 'PRISM',
    name: 'Prism',
    description: 'Refractive tactician. Splits the signal across every lane.',
    defaultColor: '#a855f7',
    markerShape: 'triangle',
  },
  {
    id: 'ORACLE',
    name: 'Oracle',
    description: 'Predictive analyst. Reads the grid two moves ahead.',
    defaultColor: '#22c55e',
    markerShape: 'circle',
  },
  {
    id: 'VOID',
    name: 'Void',
    description: 'Null operator. Erases progress and bends the odds.',
    defaultColor: '#ef4444',
    markerShape: 'hex',
  },
] as const;

export const CHARACTER_CLASS_IDS: readonly CharacterClassId[] = CHARACTER_CLASSES.map((c) => c.id);

export const getCharacterClass = (id: CharacterClassId): CharacterClass =>
  CHARACTER_CLASSES.find((c) => c.id === id) ?? CHARACTER_CLASSES[0]!;

export const AURA_COLORS: readonly string[] = [
  '#00f3ff',
  '#f27d26',
  '#a855f7',
  '#22c55e',
  '#ef4444',
  '#eab308',
  '#ec4899',
  '#3b82f6',
];
