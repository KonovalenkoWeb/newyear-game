import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { SocketEvents, Player, GameState } from '@murderbox/shared';

interface SocketContextValue {
  socket: Socket<SocketEvents> | null;
  connected: boolean;
  players: Player[];
  gameState: GameState | null;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  players: [],
  gameState: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<SocketEvents> | null>(null);
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3003', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    // Listen to player updates
    newSocket.on('players:list', (playerList: Player[]) => {
      setPlayers(playerList);
    });

    newSocket.on('player:joined', (player: Player) => {
      setPlayers((prev) => [...prev, player]);
    });

    newSocket.on('player:removed', (data: { playerId: string }) => {
      setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
    });

    // Listen to game state updates
    newSocket.on('game:started', (state: GameState) => {
      setGameState(state);
    });

    newSocket.on('game:reset', (state: GameState) => {
      setGameState(state);
      setPlayers([]);
    });

    newSocket.on('game:selected', (data: { gameKey: string }) => {
      setGameState((prev) => prev ? { ...prev, currentGameKey: data.gameKey } : null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, players, gameState }}>
      {children}
    </SocketContext.Provider>
  );
};
