import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AudioProvider } from './context/AudioContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CategorySelect from './pages/CategorySelect';
import SubcategorySelect from './pages/SubcategorySelect';
import Registration from './pages/Registration';
import RoundSelect from './pages/RoundSelect';
import Game from './pages/Game';
import GameOver from './pages/GameOver';
import Leaderboard from './pages/Leaderboard';
import Instructions from './pages/Instructions';
import AnimatedBackground from './components/AnimatedBackground';

import HostDashboard from './pages/HostDashboard';

function App() {
  return (
    <AudioProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/categories" element={<CategorySelect />} />
          <Route path="/categories/:categoryId" element={<SubcategorySelect />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/register/:quizId" element={<Registration />} />
          <Route path="/round-select" element={<RoundSelect />} />
          <Route path="/game/:quizId" element={<Game />} />
          <Route path="/gameover" element={<GameOver />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/host" element={<HostDashboard />} />
        </Routes>
        <AnimatedBackground />
      </Router>
    </AudioProvider>
  );
}

export default App;
