import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Registration.css';

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
        <div className="calibration-header">
          <h2 className="section-title">NEURAL LINK <span>CALIBRATION</span></h2>
          <div className="calibration-info">
            <span className="calibration-step">PROTOCOL: SYNC_USER_ID</span>
          </div>
        </div>

        <div className="neural-input-group">
          <input
            className="form-input"
            type="text"
            placeholder="PILOT 01 IDENTIFIER"
            value={player1}
            onChange={e => setPlayer1(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="input-scanner"></div>
        </div>

        <div className="neural-input-group">
          <input
            className="form-input"
            type="text"
            placeholder="PILOT 02 IDENTIFIER"
            value={player2}
            onChange={e => setPlayer2(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="input-scanner"></div>
        </div>

        <div className="button-row" style={{ marginTop: 20 }}>
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← ABORT
          </button>
          <button className="btn-primary-glitch" onClick={handleStartGame}>
            <span className="btn-text">INITIATE LINK</span>
            <span className="btn-glitch-effect"></span>
          </button>
        </div>
      </div>
    </div>
  );
}
