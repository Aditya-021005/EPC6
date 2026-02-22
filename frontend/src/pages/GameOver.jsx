import { useNavigate, useLocation } from 'react-router-dom';
import './GameOver.css';

export default function GameOver() {
  const navigate = useNavigate();
  const location = useLocation();
  const { player1, player2, scores } = location.state || {};

  if (!scores) {
    return (
      <div className="page-wrapper">
        <div className="glass-container winner-container" style={{ maxWidth: 560, width: '90%' }}>
          <h1>GAME OVER</h1>
          <div className="button-row">
            <button className="winner-btn" onClick={() => navigate('/')}>
              PLAY AGAIN
            </button>
            <button className="btn-game" onClick={() => navigate('/leaderboard')}>
              🏆 Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const winner = scores[1] > scores[2]
    ? player1
    : scores[2] > scores[1]
      ? player2
      : null;

  return (
    <div className="page-wrapper">
      <div className="glass-container winner-container" style={{ maxWidth: 560, width: '90%' }}>
        <h1>GAME OVER</h1>
        <h2>
          {winner ? `🏆 ${winner} Wins!` : "🤝 It's a Tie!"}
        </h2>
        <div className="scores">
          <div><strong>{player1}</strong> — {scores[1]} pts</div>
          <div><strong>{player2}</strong> — {scores[2]} pts</div>
        </div>
        <div className="button-row">
          <button className="winner-btn" onClick={() => navigate('/')}>
            PLAY AGAIN
          </button>
          <button className="btn-game" onClick={() => navigate('/leaderboard')}>
            🏆 Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
