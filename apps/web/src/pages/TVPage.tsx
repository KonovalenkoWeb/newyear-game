import { useSocket } from '../contexts/SocketContext';

function TVPage() {
  const { connected, players, gameState } = useSocket();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">🎭 Murderbox</h1>
          <div className="flex items-center justify-center gap-3">
            <div className={`w-4 h-4 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-2xl">{gameState?.isStarted ? 'Game Running' : 'Waiting to Start'}</p>
          </div>
        </div>

        {/* QR Code to join */}
        {!gameState?.isStarted && (
          <div className="bg-white/10 backdrop-blur rounded-lg p-8 mb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Join the Game!</h2>
            <p className="text-xl mb-4">Scan QR or visit:</p>
            <p className="text-2xl font-mono bg-black/30 px-6 py-3 rounded inline-block">
              http://localhost:5173/spelare
            </p>
          </div>
        )}

        {/* Player Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Players ({players.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((player) => (
              <div 
                key={player.id}
                className={`bg-white/10 backdrop-blur rounded-lg p-4 text-center ${
                  !player.isConnected ? 'opacity-50' : ''
                }`}
              >
                <img 
                  src={player.photoDataUrl} 
                  alt={player.name}
                  className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-white/30"
                />
                <h3 className="font-bold text-lg mb-1">{player.name}</h3>
                <p className="text-2xl font-bold text-yellow-400">{player.score} pts</p>
                {!player.isConnected && (
                  <p className="text-sm text-red-400 mt-2">Offline</p>
                )}
              </div>
            ))}
          </div>
          {players.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-2xl">Waiting for players to join...</p>
            </div>
          )}
        </div>

        {/* Current Game */}
        {gameState?.currentGameKey && (
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-8 text-center">
            <h2 className="text-4xl font-bold mb-2">Current Game</h2>
            <p className="text-5xl font-bold">{gameState.currentGameKey}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TVPage;
