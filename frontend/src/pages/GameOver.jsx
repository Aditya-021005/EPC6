import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import useSound from '../hooks/useSound';
import './GameOver.css';

// Confetti Particle System
function ConfettiCanvas({ active }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext('2d');
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const colors = ['#00f0ff', '#ff00e5', '#ffcc00', '#00ff88', '#ff3355', '#ffffff'];
    const particles = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h - h,
        w: Math.random() * 10 + 4,
        h: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: Math.random() * 0.6 + 0.4,
      });
    }
    particlesRef.current = particles;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particlesRef.current.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.vy += 0.02; // gravity

        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
          p.vy = Math.random() * 3 + 2;
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="go-confetti-canvas" />;
}

// Animated Counter Hook
function useAnimatedCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

export default function GameOver() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    player1, player2, scores,
    correctCounts, wrongCounts, maxCombo,
    timers, totalQuestions,
    category, subcategory
  } = location.state || {};

  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.4 });

  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Animated score counters
  const animScore1 = useAnimatedCounter(scores?.[1] || 0, 1500);
  const animScore2 = useAnimatedCounter(scores?.[2] || 0, 1500);

  if (!scores) {
    return (
      <div className="page-wrapper">
        <div className="go-container">
          <h1 className="go-title">MATCH <span>TERMINATED</span></h1>
          <p className="go-subtitle">NO DATA RECOVERED</p>
          <div className="go-actions">
            <button className="go-btn-primary" onClick={() => navigate('/')}>
              <span>⚔</span> RETURN TO BASE
            </button>
          </div>
        </div>
      </div>
    );
  }

  const winner = scores[1] > scores[2] ? player1 : scores[2] > scores[1] ? player2 : null;
  const isDraw = !winner;
  const winnerScore = winner === player1 ? scores[1] : scores[2];
  const winnerColor = winner === player1 ? 'cyan' : 'magenta';

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="page-wrapper go-page">
      <ConfettiCanvas active={revealed && !isDraw} />

      <div className={`go-container ${revealed ? 'revealed' : ''}`}>
        {/* Top accent bar */}
        <div className="go-accent-bar">
          <div className="go-accent cyan" />
          <div className="go-accent magenta" />
          <div className="go-accent gold" />
        </div>

        {/* Header */}
        <div className="go-header">
          <div className="go-badge">
            <span className="go-badge-dot" />
            <span>MATCH CONCLUDED</span>
          </div>
          <h1 className="go-title">
            {isDraw ? (
              <>NEURAL <span>DEADLOCK</span></>
            ) : (
              <>VICTORY <span>ACHIEVED</span></>
            )}
          </h1>
          {category && (
            <p className="go-sector">{category.toUpperCase()} — {subcategory?.toUpperCase()}</p>
          )}
        </div>

        {/* Winner Spotlight */}
        <div className={`go-spotlight ${isDraw ? 'draw' : winnerColor}`}>
          <div className="go-spotlight-ring">
            <div className="go-spotlight-inner">
              <span className="go-spotlight-icon">
                {isDraw ? '🤝' : '🏆'}
              </span>
            </div>
          </div>
          <div className="go-spotlight-name">
            {isDraw ? 'DRAW' : winner.toUpperCase()}
          </div>
          {!isDraw && (
            <div className="go-spotlight-label">OPERATIONS WINNER</div>
          )}
        </div>

        {/* Score Showdown */}
        <div className="go-score-showdown">
          <div className="go-player-score p1">
            <div className="go-player-label">{player1}</div>
            <div className="go-score-value cyan-score">{animScore1}</div>
            <div className="go-score-pts">PTS</div>
          </div>
          <div className="go-vs-divider">
            <span>VS</span>
          </div>
          <div className="go-player-score p2">
            <div className="go-player-label">{player2}</div>
            <div className="go-score-value magenta-score">{animScore2}</div>
            <div className="go-score-pts">PTS</div>
          </div>
        </div>

        {/* Stats Grid */}
        {correctCounts && (
          <div className="go-stats-section">
            <div className="go-stats-header">
              <span className="go-stats-dot" />
              <span>COMBAT ANALYTICS</span>
            </div>
            <div className="go-stats-grid">
              {/* Player 1 Stats */}
              <div className="go-stat-card">
                <div className="go-stat-card-accent cyan-accent" />
                <div className="go-stat-player">{player1}</div>
                <div className="go-stat-rows">
                  <div className="go-stat-row">
                    <span className="go-stat-icon">✔</span>
                    <span className="go-stat-label">CORRECT</span>
                    <span className="go-stat-val">{correctCounts[1]}</span>
                  </div>
                  <div className="go-stat-row">
                    <span className="go-stat-icon">✖</span>
                    <span className="go-stat-label">WRONG</span>
                    <span className="go-stat-val">{wrongCounts[1]}</span>
                  </div>
                  <div className="go-stat-row">
                    <span className="go-stat-icon">🔥</span>
                    <span className="go-stat-label">BEST STREAK</span>
                    <span className="go-stat-val">{maxCombo[1]}x</span>
                  </div>
                  <div className="go-stat-row">
                    <span className="go-stat-icon">⏱</span>
                    <span className="go-stat-label">TIME LEFT</span>
                    <span className="go-stat-val">{formatTime(timers[1])}</span>
                  </div>
                </div>
              </div>

              {/* Player 2 Stats */}
              <div className="go-stat-card">
                <div className="go-stat-card-accent magenta-accent" />
                <div className="go-stat-player">{player2}</div>
                <div className="go-stat-rows">
                  <div className="go-stat-row">
                    <span className="go-stat-icon">✔</span>
                    <span className="go-stat-label">CORRECT</span>
                    <span className="go-stat-val">{correctCounts[2]}</span>
                  </div>
                  <div className="go-stat-row">
                    <span className="go-stat-icon">✖</span>
                    <span className="go-stat-label">WRONG</span>
                    <span className="go-stat-val">{wrongCounts[2]}</span>
                  </div>
                  <div className="go-stat-row">
                    <span className="go-stat-icon">🔥</span>
                    <span className="go-stat-label">BEST STREAK</span>
                    <span className="go-stat-val">{maxCombo[2]}x</span>
                  </div>
                  <div className="go-stat-row">
                    <span className="go-stat-icon">⏱</span>
                    <span className="go-stat-label">TIME LEFT</span>
                    <span className="go-stat-val">{formatTime(timers[2])}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="go-actions">
          <button
            className="go-btn-primary"
            onClick={() => { playClick(); navigate('/categories'); }}
            onMouseEnter={playHover}
          >
            <span>⚔</span> BATTLE AGAIN
          </button>
          <button
            className="go-btn-secondary"
            onClick={() => { playClick(); navigate('/leaderboard'); }}
            onMouseEnter={playHover}
          >
            <span>🏆</span> HALL OF FAME
          </button>
          <button
            className="go-btn-ghost"
            onClick={() => { playClick(); navigate('/'); }}
            onMouseEnter={playHover}
          >
            ← RETURN TO BASE
          </button>
        </div>

        {/* Scanner line */}
        <div className="go-scanner-line" />
      </div>
    </div>
  );
}
