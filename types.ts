
export enum Team {
  Red = 'Red',
  Blue = 'Blue',
}

export enum Role {
  Red = 'Red',
  Blue = 'Blue',
  Bystander = 'Bystander',
  Assassin = 'Assassin',
}

export enum Personality {
  Safe = 'SAFE',
  Aggressive = 'AGGRESSIVE',
}

export enum GamePhase {
  Setup,
  Ready,
  GeneratingClue,
  Guessing,
  GameOver,
}

export interface CardData {
  word: string;
  role: Role;
  isRevealed: boolean;
}

export interface Clue {
  word: string;
  count: number;
}
