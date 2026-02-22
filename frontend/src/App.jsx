import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CategorySelect from './pages/CategorySelect';
import SubcategorySelect from './pages/SubcategorySelect';
import Registration from './pages/Registration';
import Game from './pages/Game';
import GameOver from './pages/GameOver';
import Leaderboard from './pages/Leaderboard';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  return (
    <Router>
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categories" element={<CategorySelect />} />
        <Route path="/categories/:categoryId" element={<SubcategorySelect />} />
        <Route path="/register/:quizId" element={<Registration />} />
        <Route path="/game/:quizId" element={<Game />} />
        <Route path="/gameover" element={<GameOver />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}


export default App;

