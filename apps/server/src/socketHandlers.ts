import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { isValidPlayerName, isValidScore, getPlayerRoom } from '@murderbox/shared';

/**
 * Setupar alla Socket.IO event handlers enligt README-GPT.md:
 * - player:register → player:joined
 * - admin:start / admin:stop → game:started / game:reset
 * - admin:selectGame → game:selected
 * - admin:score:add / admin:score:set → score:updated
 * - admin:message:send → secret:message
 * - admin:player:remove → player:removed
 */
export function setupSocketHandlers(io: SocketIOServer, prisma: PrismaClient) {
  console.log('🎯 Setupar Socket.IO event handlers...');

  io.on('connection', (socket: Socket) => {
    
    // =============================================================================
    // PLAYER EVENTS - Spelare-relaterade händelser
    // =============================================================================
    
    /**
     * player:register - När en spelare registrerar sig
     * Data: { name: string, photoDataUrl: string }
     * Response: player:joined med player-objekt
     */
    socket.on('player:register', async (data: { name: string; photoDataUrl: string }) => {
      try {
        console.log(`🎮 Player registrering:`, data.name);
        
        // Validera input
        if (!isValidPlayerName(data.name)) {
          socket.emit('error', 'Ogiltigt namn. Måste vara 2-20 tecken.');
          return;
        }
        
        if (!data.photoDataUrl || !data.photoDataUrl.startsWith('data:image/')) {
          socket.emit('error', 'Giltig foto krävs.');
          return;
        }

        // Skapa ny spelare i databasen
        const newPlayer = await prisma.player.create({
          data: {
            name: data.name.trim(),
            photoDataUrl: data.photoDataUrl,
            score: 0,
            isConnected: true,
          },
        });

        console.log(`✅ Spelare skapad: ${newPlayer.name} (${newPlayer.id})`);

        // Joina spelare-specifikt rum
        const playerRoom = getPlayerRoom(newPlayer.id);
        socket.join(playerRoom);
        
        // Skicka bekräftelse till spelaren
        socket.emit('player:joined', newPlayer);
        
        // Broadcast till alla i lobby att en ny spelare joinade
        io.broadcastToLobby('player:joined', newPlayer);
        
        // Skicka uppdaterad spellista till admin och TV
        const allPlayers = await prisma.player.findMany({
          where: { isConnected: true },
          orderBy: { joinedAt: 'desc' }
        });
        
        io.broadcastToAdmin('players:list', allPlayers);
        io.broadcastToTV('players:list', allPlayers);

      } catch (error) {
        console.error('❌ Player register error:', error);
        socket.emit('error', 'Kunde inte registrera spelare.');
      }
    });

    // =============================================================================
    // ADMIN EVENTS - Admin-kontroller
    // =============================================================================
    
    /**
     * admin:start - Starta spelet
     * Response: game:started till alla
     */
    socket.on('admin:start', async () => {
      try {
        console.log('🚀 Admin startar spelet');
        
        // Uppdatera game state
        const gameState = await prisma.gameState.update({
          where: { id: 1 },
          data: { isStarted: true },
        });

        // Broadcast till alla
        io.emit('game:started', gameState);
        console.log('✅ Spel startat och broadcast till alla');

      } catch (error) {
        console.error('❌ Admin start error:', error);
        socket.emit('error', 'Kunde inte starta spelet.');
      }
    });

    /**
     * admin:stop - Stoppa/resetta spelet
     * Response: game:reset till alla
     */
    socket.on('admin:stop', async () => {
      try {
        console.log('🛑 Admin stoppar spelet');
        
        // Reset game state och rensa meddelanden
        await prisma.$transaction([
          prisma.message.deleteMany({}),
          prisma.gameState.update({
            where: { id: 1 },
            data: { 
              isStarted: false,
              currentGameKey: null
            },
          }),
        ]);

        // Broadcast reset till alla
        io.emit('game:reset');
        console.log('✅ Spel resettat och broadcast till alla');

      } catch (error) {
        console.error('❌ Admin stop error:', error);
        socket.emit('error', 'Kunde inte stoppa spelet.');
      }
    });

    /**
     * admin:selectGame - Välj vilket spel som ska spelas
     * Data: gameKey (string)
     * Response: game:selected till alla
     */
    socket.on('admin:selectGame', async (gameKey: string) => {
      try {
        console.log(`🎯 Admin väljer spel: ${gameKey}`);
        
        if (!gameKey || typeof gameKey !== 'string') {
          socket.emit('error', 'Ogiltigt spel-ID.');
          return;
        }

        // Uppdatera game state
        const gameState = await prisma.gameState.update({
          where: { id: 1 },
          data: { currentGameKey: gameKey },
        });

        // Broadcast till alla
        io.emit('game:selected', gameKey);
        io.broadcastToTV('game:state', gameState);
        
        console.log(`✅ Spel "${gameKey}" valt och broadcast`);

      } catch (error) {
        console.error('❌ Admin selectGame error:', error);
        socket.emit('error', 'Kunde inte välja spel.');
      }
    });

    /**
     * admin:score:add - Lägg till poäng till spelare
     * Data: { playerId: string, points: number }
     * Response: score:updated till alla
     */
    socket.on('admin:score:add', async (data: { playerId: string; points: number }) => {
      try {
        console.log(`💯 Admin lägger till ${data.points} poäng till ${data.playerId}`);
        
        if (!isValidScore(data.points)) {
          socket.emit('error', 'Ogiltigt poängvärde.');
          return;
        }

        // Uppdatera spelarens poäng
        const updatedPlayer = await prisma.player.update({
          where: { id: data.playerId },
          data: { 
            score: { increment: data.points }
          },
        });

        // Broadcast till alla
        const scoreData = {
          playerId: data.playerId,
          score: updatedPlayer.score,
          change: data.points
        };
        
        io.emit('score:updated', scoreData);
        console.log(`✅ Poäng uppdaterad för ${data.playerId}: ${updatedPlayer.score}`);

      } catch (error) {
        console.error('❌ Admin score:add error:', error);
        socket.emit('error', 'Kunde inte uppdatera poäng.');
      }
    });

    /**
     * admin:score:set - Sätt exakt poäng för spelare
     * Data: { playerId: string, score: number }
     * Response: score:updated till alla
     */
    socket.on('admin:score:set', async (data: { playerId: string; score: number }) => {
      try {
        console.log(`🎯 Admin sätter ${data.score} poäng för ${data.playerId}`);
        
        if (!isValidScore(data.score)) {
          socket.emit('error', 'Ogiltigt poängvärde.');
          return;
        }

        // Sätt spelarens exakta poäng
        const updatedPlayer = await prisma.player.update({
          where: { id: data.playerId },
          data: { score: data.score },
        });

        // Broadcast till alla
        const scoreData = {
          playerId: data.playerId,
          score: updatedPlayer.score
        };
        
        io.emit('score:updated', scoreData);
        console.log(`✅ Poäng satt för ${data.playerId}: ${updatedPlayer.score}`);

      } catch (error) {
        console.error('❌ Admin score:set error:', error);
        socket.emit('error', 'Kunde inte sätta poäng.');
      }
    });

    /**
     * admin:message:send - Skicka hemligt meddelande till spelare
     * Data: { playerId: string, message: string, expiresAt?: Date }
     * Response: secret:message till specifik spelare
     */
    socket.on('admin:message:send', async (data: { playerId: string; message: string; expiresAt?: Date }) => {
      try {
        console.log(`💬 Admin skickar meddelande till ${data.playerId}: "${data.message}"`);
        
        if (!data.message || data.message.trim().length === 0) {
          socket.emit('error', 'Meddelande kan inte vara tomt.');
          return;
        }

        // Skapa meddelande i databasen
        const newMessage = await prisma.message.create({
          data: {
            playerId: data.playerId,
            text: data.message.trim(),
            expiresAt: data.expiresAt || null,
          },
          include: {
            player: true,
          },
        });

        // Skicka till specifik spelare
        io.broadcastToPlayer(data.playerId, 'secret:message', newMessage);
        
        // Bekräfta till admin
        socket.emit('message:sent', {
          messageId: newMessage.id,
          playerId: data.playerId,
          playerName: newMessage.player.name
        });
        
        console.log(`✅ Meddelande skickat till ${newMessage.player.name}`);

      } catch (error) {
        console.error('❌ Admin message:send error:', error);
        socket.emit('error', 'Kunde inte skicka meddelande.');
      }
    });

    /**
     * admin:player:remove - Ta bort spelare från spelet
     * Data: playerId (string)
     * Response: player:removed till alla
     */
    socket.on('admin:player:remove', async (playerId: string) => {
      try {
        console.log(`🚫 Admin tar bort spelare: ${playerId}`);
        
        // Ta bort spelare och relaterade meddelanden
        await prisma.$transaction([
          prisma.message.deleteMany({
            where: { playerId },
          }),
          prisma.player.delete({
            where: { id: playerId },
          }),
        ]);

        // Broadcast till alla
        io.emit('player:removed', playerId);
        
        // Skicka uppdaterad spellista
        const remainingPlayers = await prisma.player.findMany({
          where: { isConnected: true },
          orderBy: { joinedAt: 'desc' }
        });
        
        io.broadcastToAdmin('players:list', remainingPlayers);
        io.broadcastToTV('players:list', remainingPlayers);
        
        console.log(`✅ Spelare ${playerId} borttagen`);

      } catch (error) {
        console.error('❌ Admin player:remove error:', error);
        socket.emit('error', 'Kunde inte ta bort spelare.');
      }
    });

    // =============================================================================
    // UTILITY EVENTS - Hjälpfunktioner
    // =============================================================================
    
    /**
     * Få aktuell game state
     */
    socket.on('game:getState', async () => {
      try {
        const gameState = await prisma.gameState.findUnique({
          where: { id: 1 }
        });
        socket.emit('game:state', gameState);
      } catch (error) {
        socket.emit('error', 'Kunde inte hämta spelstatus.');
      }
    });

    /**
     * Få alla anslutna spelare
     */
    socket.on('players:getAll', async () => {
      try {
        const players = await prisma.player.findMany({
          where: { isConnected: true },
          orderBy: { score: 'desc' }
        });
        socket.emit('players:list', players);
      } catch (error) {
        socket.emit('error', 'Kunde inte hämta spelare.');
      }
    });

    // =============================================================================
    // CONNECTION EVENTS - Anslutningshantering
    // =============================================================================
    
    socket.on('disconnect', async () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      
      // Här skulle vi kunna markera spelare som disconnected
      // men vi behåller dem aktiva för reconnect-funktionalitet
    });
  });

  console.log('✅ Socket.IO event handlers setup komplett');
}