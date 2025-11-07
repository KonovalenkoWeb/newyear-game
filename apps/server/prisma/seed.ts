import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Skapa initial GameState
  await prisma.gameState.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      isStarted: false,
      currentGameKey: null,
    },
  });

  // Skapa några test-spelare för development
  if (process.env.NODE_ENV === 'development') {
    // Skapa test-spelare individuellt för att undvika duplicates
    await prisma.player.upsert({
      where: { id: 'test-player-1' },
      update: {},
      create: {
        id: 'test-player-1',
        name: 'Test Player 1',
        photoDataUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNmZjZkMDAiLz4KPHN2Zz4=',
        score: 0,
        isConnected: true,
      },
    });

    await prisma.player.upsert({
      where: { id: 'test-player-2' },
      update: {},
      create: {
        id: 'test-player-2', 
        name: 'Test Player 2',
        photoDataUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiMwMDhkZmYiLz4KPHN2Zz4=',
        score: 0,
        isConnected: false,
      },
    });

    console.log('✅ Development test data seeded');
  }

  console.log('🎯 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });