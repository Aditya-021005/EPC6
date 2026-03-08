import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSound from '../hooks/useSound';
import './Registration.css';

export default function Registration() {
  const { quizId } = useParams();
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.3 });

  const handleStartGame = () => {
    if (!player1.trim() || !player2.trim()) {
      return;
    }
    playClick();
    localStorage.setItem('player1', player1.trim());
    localStorage.setItem('player2', player2.trim());
    setFadeOut(true);
    setTimeout(() => navigate(`/game/${quizId}`), 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleStartGame();
  };

  const bothFilled = player1.trim() && player2.trim();

  return (
    <div className="page-wrapper reg-page">
      <div
        className={`reg-container ${fadeOut ? 'fade-out' : ''}`}
      >
        {/* Decorative top bar */}
        <div className="reg-top-bar">
          <div className="reg-bar-segment cyan" />
          <div className="reg-bar-segment magenta" />
          <div className="reg-bar-segment gold" />
        </div>

        {/* Header */}
        <div className="reg-header">
          <div className="reg-protocol-badge">
            <span className="protocol-dot" />
            <span>PROTOCOL ACTIVE</span>
          </div>
          <h1 className="reg-title">
            NEURAL LINK <span>CALIBRATION</span>
          </h1>
          <p className="reg-subtitle">SYNCHRONIZE PILOT IDENTIFIERS BEFORE INITIATING COMBAT SEQUENCE</p>
        </div>

        {/* Player Cards */}
        <div className="reg-players-grid">
          {/* Player 1 Card */}
          <div className={`pilot-card ${focusedField === 1 ? 'focused' : ''} ${player1.trim() ? 'filled' : ''}`}>
            <div className="pilot-card-header">
              <div className="pilot-avatar cyan-avatar">
                <span className="avatar-icon">{player1.trim() ? player1[0].toUpperCase() : '?'}</span>
                <div className="avatar-ring" />
              </div>
              <div className="pilot-meta">
                <span className="pilot-tag">PILOT 01</span>
                <span className={`pilot-status ${player1.trim() ? 'linked' : ''}`}>
                  {player1.trim() ? '● LINKED' : '○ AWAITING'}
                </span>
              </div>
            </div>

            <div className="pilot-input-wrap">
              <input
                className="pilot-input"
                type="text"
                placeholder="ENTER CALLSIGN"
                value={player1}
                onChange={e => setPlayer1(e.target.value)}
                onFocus={() => setFocusedField(1)}
                onBlur={() => setFocusedField(null)}
                onKeyDown={handleKeyDown}
                autoFocus
                maxLength={16}
              />
              <div className="input-glow-line cyan-line" />
              <div className="input-corner tl" />
              <div className="input-corner tr" />
              <div className="input-corner bl" />
              <div className="input-corner br" />
            </div>

            {player1.trim() && (
              <div className="pilot-readout">
                <span className="readout-label">NEURAL SYNC</span>
                <div className="readout-bar">
                  <div className="readout-fill cyan-fill" style={{ width: '100%' }} />
                </div>
                <span className="readout-value">READY</span>
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="vs-divider">
            <div className="vs-line" />
            <div className="vs-badge">
              <span>VS</span>
            </div>
            <div className="vs-line" />
          </div>

          {/* Player 2 Card */}
          <div className={`pilot-card ${focusedField === 2 ? 'focused' : ''} ${player2.trim() ? 'filled' : ''}`}>
            <div className="pilot-card-header">
              <div className="pilot-avatar magenta-avatar">
                <span className="avatar-icon">{player2.trim() ? player2[0].toUpperCase() : '?'}</span>
                <div className="avatar-ring" />
              </div>
              <div className="pilot-meta">
                <span className="pilot-tag">PILOT 02</span>
                <span className={`pilot-status ${player2.trim() ? 'linked' : ''}`}>
                  {player2.trim() ? '● LINKED' : '○ AWAITING'}
                </span>
              </div>
            </div>

            <div className="pilot-input-wrap">
              <input
                className="pilot-input"
                type="text"
                placeholder="ENTER CALLSIGN"
                value={player2}
                onChange={e => setPlayer2(e.target.value)}
                onFocus={() => setFocusedField(2)}
                onBlur={() => setFocusedField(null)}
                onKeyDown={handleKeyDown}
                maxLength={16}
              />
              <div className="input-glow-line magenta-line" />
              <div className="input-corner tl" />
              <div className="input-corner tr" />
              <div className="input-corner bl" />
              <div className="input-corner br" />
            </div>

            {player2.trim() && (
              <div className="pilot-readout">
                <span className="readout-label">NEURAL SYNC</span>
                <div className="readout-bar">
                  <div className="readout-fill magenta-fill" style={{ width: '100%' }} />
                </div>
                <span className="readout-value">READY</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="reg-actions">
          <button
            className="reg-btn-abort"
            onClick={() => { playClick(); navigate(-1); }}
            onMouseEnter={playHover}
          >
            <span className="abort-icon">←</span>
            <span>ABORT</span>
          </button>

          <button
            className={`reg-btn-launch ${bothFilled ? 'ready' : 'disabled'}`}
            onClick={handleStartGame}
            onMouseEnter={bothFilled ? playHover : undefined}
            disabled={!bothFilled}
          >
            <span className="launch-text">INITIATE NEURAL LINK</span>
            <span className="launch-arrow">→</span>
            <div className="launch-glow" />
          </button>
        </div>

        {/* Footer hint */}
        <div className="reg-footer-hint">
          <span className="key-hint">ENTER</span> to initiate • <span className="key-hint">ESC</span> to abort
        </div>

        {/* Decorative scanner */}
        <div className="reg-scanner-line" />
      </div>
    </div>
  );
}
