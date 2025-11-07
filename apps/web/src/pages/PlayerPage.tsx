import { useState, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';

function PlayerPage() {
  const { socket, connected } = useSocket();
  const [step, setStep] = useState<'name' | 'photo' | 'waiting'>('name');
  const [name, setName] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      alert('Could not access camera');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setPhotoDataUrl(dataUrl);
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleRegister = () => {
    if (socket && name && photoDataUrl) {
      socket.emit('player:register', { name, photoDataUrl });
      setStep('waiting');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-teal-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">🎮 Join Game</h1>

        <div className="bg-white/10 backdrop-blur rounded-lg p-6">
          {!connected && (
            <div className="text-center py-8">
              <p className="text-xl">Connecting to server...</p>
            </div>
          )}

          {connected && step === 'name' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">What's your name?</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded bg-white/20 text-white placeholder-white/50 mb-4"
                maxLength={20}
              />
              <button
                onClick={() => {
                  if (name.trim()) {
                    setStep('photo');
                    setTimeout(startCamera, 100);
                  }
                }}
                disabled={!name.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-3 rounded font-bold"
              >
                Next →
              </button>
            </div>
          )}

          {connected && step === 'photo' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Take a photo!</h2>
              
              {!photoDataUrl && (
                <div className="mb-4">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    className="w-full rounded-lg mb-4"
                  />
                  <button
                    onClick={capturePhoto}
                    disabled={!cameraActive}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-3 rounded font-bold"
                  >
                    📸 Capture Photo
                  </button>
                </div>
              )}

              {photoDataUrl && (
                <div>
                  <img 
                    src={photoDataUrl} 
                    alt="Your photo"
                    className="w-full rounded-lg mb-4"
                  />
                  <div className="space-y-2">
                    <button
                      onClick={handleRegister}
                      className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded font-bold"
                    >
                      ✓ Join Game
                    </button>
                    <button
                      onClick={() => {
                        setPhotoDataUrl('');
                        startCamera();
                      }}
                      className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-3 rounded font-bold"
                    >
                      ↻ Retake
                    </button>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {connected && step === 'waiting' && (
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold mb-4">You're in! 🎉</h2>
              <p className="text-xl">Welcome, {name}!</p>
              <p className="text-gray-300 mt-4">Watch the TV screen for the game to start...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerPage;
