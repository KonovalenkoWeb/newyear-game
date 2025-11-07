import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import type { SocketEvents } from '@murderbox/shared';
import { setupSocketHandlers } from './socketHandlers';
import { setupSocketRooms } from './socketRooms';

// Ladda environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const prisma = new PrismaClient();

// CORS konfiguration för development
const io = new SocketIOServer<SocketEvents>(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Express middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'murderbox-server'
  });
});

// API endpoints för debugging
app.get('/api/players', async (_req, res) => {
  try {
    const players = await prisma.player.findMany({
      orderBy: { joinedAt: 'desc' }
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

app.get('/api/game-state', async (_req, res) => {
  try {
    const gameState = await prisma.gameState.findUnique({
      where: { id: 1 }
    });
    res.json(gameState);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game state' });
  }
});

// Socket.IO setup
setupSocketRooms(io);
setupSocketHandlers(io, prisma);

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3003;

server.listen(PORT, () => {
  console.log(`🚀 Murderbox server körs på port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Socket.IO server redo för anslutningar`);
});

export { app, server, io, prisma };