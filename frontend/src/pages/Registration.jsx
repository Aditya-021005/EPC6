import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Registration() {
  const { quizId } = useParams();
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  const handleStartGame = () => {
    if (!player1.trim() || !player2.trim()) {
      alert('Please enter both player names!');
      return;
    }
    localStorage.setItem('player1', player1.trim());
    localStorage.setItem('player2', player2.trim());
    setFadeOut(true);
    setTimeout(() => navigate(`/game/${quizId}`), 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleStartGame();
  };

  return (
    <div className="page-wrapper">
      <div
        className="glass-container"
        style={{
          maxWidth: 480,
          width: '90%',
          opacity: fadeOut ? 0 : 1,
          transform: fadeOut ? 'scale(0.96)' : 'scale(1)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <h2 className="section-title">Player Setup</h2>
        <input
          className="form-input"
          type="text"
          placeholder="Player 1"
          value={player1}
          onChange={e => setPlayer1(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <input
          className="form-input"
          type="text"
          placeholder="Player 2"
          value={player2}
          onChange={e => setPlayer2(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="button-row">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <button className="btn-primary" onClick={handleStartGame}>
            START GAME
          </button>
        </div>
      </div>
    </div>
  );
}
