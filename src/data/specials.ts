export interface PLSpecialPrediction {
  playerId: string;
  goldenBoot: string;
  goldenGlove: string;
  pfaPlayer: string;
  submittedAt: string; // ISO8601
  isLocked: boolean;
}

export interface PLSpecialResolution {
  goldenBootWinners: string[];  // e.g. ['Erling Haaland']
  goldenGloveWinners: string[]; // e.g. ['David Raya']
  pfaPlayerWinners: string[];   // e.g. ['Cole Palmer']
  resolvedAt: string;           // ISO8601
}

// Deadline: Aug 26, 2026 00:00:00 IST (which is UTC 2026-08-25T18:30:00.000Z)
export const SPECIAL_DEADLINE_ISO = '2026-08-25T18:30:00.000Z';
export const SPECIAL_CATEGORY_POINTS = 500;
export const SPECIAL_TOTAL_POINTS = 1500;

export function isSpecialDeadlinePassed(): boolean {
  return new Date() >= new Date(SPECIAL_DEADLINE_ISO);
}

export function formatDeadlineIST(): string {
  return '26 Aug 2026, 00:00 IST';
}

// Player name suggestions for easy 1-tap selection or text input
export const GOLDEN_BOOT_SUGGESTIONS = [
  'Erling Haaland',
  'Bukayo Saka',
  'Mohamed Salah',
  'Alexander Isak',
  'Cole Palmer',
  'Ollie Watkins',
  'Kai Havertz',
  'Heung-min Son',
  'Nicolas Jackson',
  'Jean-Philippe Mateta',
];

export const GOLDEN_GLOVE_SUGGESTIONS = [
  'David Raya',
  'Alisson Becker',
  'Ederson',
  'Nick Pope',
  'Jordan Pickford',
  'Guglielmo Vicario',
  'Emiliano Martínez',
  'Robert Sánchez',
  'André Onana',
  'Dean Henderson',
];

export const PFA_PLAYER_SUGGESTIONS = [
  'Bukayo Saka',
  'Cole Palmer',
  'Erling Haaland',
  'Rodri',
  'Mohamed Salah',
  'Phil Foden',
  'Declan Rice',
  'Martin Ødegaard',
  'Alexander Isak',
  'Virgil van Dijk',
];
