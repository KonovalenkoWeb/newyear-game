// Datamodeller enligt README-GPT.md
export interface Player {
  id: string;
  name: string;
  photoDataUrl: string;
  score: number;
  joinedAt: Date;
  isConnected: boolean;
}

export interface Message {
  id: string;
  playerId: string;
  player?: Player;
  text: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface GameState {
  id: number;
  isStarted: boolean;
  currentGameKey?: string;
}

// Socket Events enligt README-GPT.md
export interface SocketEvents {
  // Client -> Server events
  'player:register': (data: { name: string; photoDataUrl: string }) => void;
  
  // Admin -> Server events  
  'admin:start': () => void;
  'admin:stop': () => void;
  'admin:selectGame': (gameKey: string) => void;
  'admin:score:add': (data: { playerId: string; points: number }) => void;
  'admin:score:set': (data: { playerId: string; score: number }) => void;
  'admin:message:send': (data: { playerId: string; message: string; expiresAt?: Date }) => void;
  'admin:player:remove': (playerId: string) => void;
  
  // Server -> Client events
  'player:joined': (player: Player) => void;
  'game:started': (gameState: GameState) => void;
  'game:reset': () => void;
  'game:selected': (gameKey: string) => void;
  'score:updated': (data: { playerId: string; score: number; change?: number }) => void;
  'secret:message': (message: Message) => void;
  'player:removed': (playerId: string) => void;
  
  // Broadcast events
  'players:list': (players: Player[]) => void;
  'game:state': (gameState: GameState) => void;
  'error': (message: string) => void;
}

// Socket Rooms
export type SocketRooms = 'lobby' | 'admin' | 'tv' | `player:${string}`;

// Game types
export interface GameConfig {
  key: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedTime: string;
}

// Frontend route types
export type AppRoute = '/admin' | '/tv' | '/spelare';