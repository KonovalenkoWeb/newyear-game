// Exportera alla typer och interfaces
export * from './types';
import type { GameState } from './types';

// Utility funktioner för socket events
export const createSocketEvent = <T>(eventName: string, data: T) => ({
  event: eventName,
  data,
  timestamp: new Date().toISOString(),
});

// Validering av speldata
export const isValidPlayerName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 20;
};

export const isValidScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 0;
};

// Game state helpers
export const createInitialGameState = (): GameState => ({
  id: 1,
  isStarted: false,
});

// Socket room helpers
export const getPlayerRoom = (playerId: string): `player:${string}` => `player:${playerId}`;

export const SOCKET_ROOMS = {
  LOBBY: 'lobby' as const,
  ADMIN: 'admin' as const,
  TV: 'tv' as const,
} as const;