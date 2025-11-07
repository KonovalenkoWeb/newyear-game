import { useSocket } from '../contexts/SocketContext';

function AdminPage() {
  const { socket, connected, players, gameState } = useSocket();

  const handleStartGame = () => {
    socket?.emit('admin:start');
  };

  const handleStopGame = () => {
    socket?.emit('admin:stop');
  };

  const handleKickPlayer = (playerId: string) => {
    socket?.emit('admin:player:remove', playerId);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🎮 Admin Panel</h1>
        
        <div className="mb-6 flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Game Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🕹️ Game Controls</h2>
            <div className="space-y-3">
              <button
                onClick={handleStartGame}
                disabled={!connected || gameState?.isStarted}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
              >
                Start Game
              </button>
              <button
                onClick={handleStopGame}
                disabled={!connected || !gameState?.isStarted}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded"
              >
                Stop Game
              </button>
            </div>
            <div className="mt-4 p-4 bg-gray-700 rounded">
              <p className="text-sm">Game Status: {gameState?.isStarted ? '🟢 Running' : '🔴 Stopped'}</p>
              {gameState?.currentGameKey && (
                <p className="text-sm">Current Game: {gameState.currentGameKey}</p>
              )}
            </div>
          </div>

          {/* Player List */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">👥 Players ({players.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                  <div className="flex items-center gap-3">
                    <img 
                      src={player.photoDataUrl} 
                      alt={player.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{player.name}</p>
                      <p className="text-sm text-gray-400">Score: {player.score}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleKickPlayer(player.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                  >
                    Kick
                  </button>
                </div>
              ))}
              {players.length === 0 && (
                <p className="text-gray-400 text-center py-4">No players yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
