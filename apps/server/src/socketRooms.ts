import { Server as SocketIOServer } from 'socket.io';

export const SOCKET_ROOMS = {
  LOBBY: 'lobby' as const,
  ADMIN: 'admin' as const,
  TV: 'tv' as const,
} as const;

export const getPlayerRoom = (playerId: string): `player:${string}` => `player:${playerId}`;

/**
 * Setupar Socket.IO rooms enligt README-GPT.md specifikation:
 * - lobby: Allmän lobby för alla anslutna
 * - admin: Admin-panel kontroller
 * - tv: TV-display
 * - player:<id>: Individuella spelarerum för privata meddelanden
 */
export function setupSocketRooms(io: SocketIOServer) {
  console.log('🏠 Setupar Socket.IO rooms...');

  io.on('connection', (socket) => {
    console.log(`🔌 Ny anslutning: ${socket.id}`);
    
    // Joina lobby automatiskt för alla nya anslutningar
    socket.join(SOCKET_ROOMS.LOBBY);
    console.log(`👥 ${socket.id} joinade lobby`);

    // Hantera room-joining
    socket.on('join:room', (roomType: 'admin' | 'tv' | string) => {
      if (roomType === 'admin') {
        socket.join(SOCKET_ROOMS.ADMIN);
        console.log(`🛡️ ${socket.id} joinade admin room`);
        
        // Skicka aktuell status till admin
        socket.emit('admin:connected', {
          message: 'Admin panel ansluten',
          timestamp: new Date().toISOString()
        });
        
      } else if (roomType === 'tv') {
        socket.join(SOCKET_ROOMS.TV);
        console.log(`📺 ${socket.id} joinade TV room`);
        
        // Skicka aktuell status till TV
        socket.emit('tv:connected', {
          message: 'TV display ansluten',
          timestamp: new Date().toISOString()
        });
        
      } else if (roomType.startsWith('player:')) {
        // Individuellt spelare-rum
        socket.join(roomType);
        console.log(`🎮 ${socket.id} joinade ${roomType}`);
      }
    });

    // Hantera room-leaving
    socket.on('leave:room', (roomType: string) => {
      socket.leave(roomType);
      console.log(`🚪 ${socket.id} lämnade ${roomType}`);
    });

    // När någon disconnectar
    socket.on('disconnect', (reason) => {
      console.log(`🔌 ${socket.id} disconnected: ${reason}`);
      
      // Notifiera andra i lobby om disconnect
      socket.to(SOCKET_ROOMS.LOBBY).emit('user:disconnected', {
        socketId: socket.id,
        reason,
        timestamp: new Date().toISOString()
      });
    });

    // Room debug info
    socket.on('rooms:list', () => {
      const rooms = Array.from(socket.rooms);
      socket.emit('rooms:current', rooms);
      console.log(`📋 ${socket.id} rooms:`, rooms);
    });
  });

  // Utility för att broadcast till specifika rooms
  io.broadcastToLobby = (event: string, data: any) => {
    io.to(SOCKET_ROOMS.LOBBY).emit(event, data);
  };

  io.broadcastToAdmin = (event: string, data: any) => {
    io.to(SOCKET_ROOMS.ADMIN).emit(event, data);
  };

  io.broadcastToTV = (event: string, data: any) => {
    io.to(SOCKET_ROOMS.TV).emit(event, data);
  };

  io.broadcastToPlayer = (playerId: string, event: string, data: any) => {
    io.to(getPlayerRoom(playerId)).emit(event, data);
  };

  console.log('✅ Socket.IO rooms setup komplett');
}

// Type augmentation för Socket.IO Server
declare module 'socket.io' {
  interface Server {
    broadcastToLobby(event: string, data: any): void;
    broadcastToAdmin(event: string, data: any): void;
    broadcastToTV(event: string, data: any): void;
    broadcastToPlayer(playerId: string, event: string, data: any): void;
  }
}