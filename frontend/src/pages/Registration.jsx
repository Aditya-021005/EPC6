import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useSound from '../hooks/useSound';
import './Registration.css';

// Matrix Rain mini-component
function MatrixRain({ active, color = '#00f0ff' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const columnsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 48, h = 48;
    canvas.width = w * 2; // retina
    canvas.height = h * 2;
    ctx.scale(2, 2);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const fontSize = 7;
    const cols = Math.floor(w / fontSize);
    columnsRef.current = Array(cols).fill(0);

    const draw = () => {
      ctx.fillStyle = `rgba(10, 10, 26, ${active ? 0.15 : 0.4})`;
      ctx.fillRect(0, 0, w, h);

      if (active) {
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px monospace`;
        columnsRef.current.forEach((y, i) => {
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.globalAlpha = 0.6 + Math.random() * 0.4;
          ctx.fillText(char, i * fontSize, y * fontSize);
          ctx.globalAlpha = 1;
          if (y * fontSize > h && Math.random() > 0.96) {
            columnsRef.current[i] = 0;
          } else {
            columnsRef.current[i] = y + 1;
          }
        });
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active, color]);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain-canvas"
      style={{ opacity: active ? 1 : 0 }}
    />
  );
}

const ROUND_OPTIONS = [3, 4, 5];

export default function Registration() {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [roundCount, setRoundCount] = useState(3);
  const [focusedField, setFocusedField] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.3 });
  const { play: playType } = useSound('/sounds/click.mp3', { volume: 0.15 });

  const handleStartGame = () => {
    if (!player1.trim() || !player2.trim()) {
      return;
    }
    playClick();
    localStorage.setItem('player1', player1.trim());
    localStorage.setItem('player2', player2.trim());
    localStorage.setItem('roundCount', roundCount.toString());
    localStorage.setItem('currentRound', '1');
    localStorage.setItem('timers', JSON.stringify({ 1: 120, 2: 120 }));
    localStorage.setItem('scores', JSON.stringify({ 1: 0, 2: 0 }));
    localStorage.setItem('roundScores', JSON.stringify([]));
    localStorage.setItem('roundPicker', '1'); // P1 picks first round
    setFadeOut(true);
    setTimeout(() => navigate('/round-select'), 600);
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
                <MatrixRain active={focusedField === 1 || !!player1.trim()} color="#00f0ff" />
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
                onInput={playType}
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
                <MatrixRain active={focusedField === 2 || !!player2.trim()} color="#ff00e5" />
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
                onInput={playType}
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

        {/* Round Count Selector */}
        <div className="round-selector">
          <div className="round-selector-label">COMBAT ROUNDS</div>
          <div className="round-selector-options">
            {ROUND_OPTIONS.map(n => (
              <button
                key={n}
                className={`round-option ${roundCount === n ? 'active' : ''}`}
                onClick={() => { playClick(); setRoundCount(n); }}
                onMouseEnter={playHover}
              >
                <span className="round-option-number">{n}</span>
                <span className="round-option-label">ROUNDS</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="reg-actions">
          <button
            className="reg-btn-abort"
            onClick={() => { playClick(); navigate('/'); }}
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
