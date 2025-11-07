import { Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import AdminPage from './pages/AdminPage';
import TVPage from './pages/TVPage';
import PlayerPage from './pages/PlayerPage';

function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/tv" element={<TVPage />} />
        <Route path="/spelare" element={<PlayerPage />} />
        <Route path="/" element={<TVPage />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;
