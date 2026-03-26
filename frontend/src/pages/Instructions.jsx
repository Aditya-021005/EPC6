import { useNavigate } from 'react-router-dom';
import useSound from '../hooks/useSound';
import './Instructions.css';

export default function Instructions() {
  const navigate = useNavigate();
  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.4 });

  return (
    <div className="page-wrapper inst-page">
      <div className="inst-container">

        {/* Header */}
        <div className="inst-header">
          <div className="inst-badge">
            <span className="inst-badge-dot" />
            <span>TRAINING PROTOCOL</span>
          </div>
          <h1 className="inst-title">OPERATIONAL <span>MANUAL</span></h1>
          <p className="inst-subtitle">REVIEW COMBAT MECHANICS BEFORE ENGAGING</p>
        </div>

        <div className="inst-grid">
          {/* Core Objectives */}
          <section className="inst-card">
            <div className="inst-card-accent" />
            <h2 className="inst-card-title">
              <span className="inst-icon">🎯</span> CORE DIRECTIVES
            </h2>
            <ul className="inst-list">
              <li><strong>Target Identification:</strong> You are tasked with identifying targets from various sectors.</li>
              <li><strong>Dual Piloting:</strong> Operations are strictly 2-player alternate competitive.</li>
              <li><strong>Timer Mechanics:</strong> Base uplink stability is strictly monitored. Correctly identifying targets boosts timer (+5s). Failing incurs a penalty (-5s).</li>
            </ul>
          </section>

          {/* Scoring & Bonuses */}
          <section className="inst-card">
            <div className="inst-card-accent cyan-accent" />
            <h2 className="inst-card-title">
              <span className="inst-icon">⚡</span> NEURAL SCORING
            </h2>
            <ul className="inst-list">
              <li><strong>Identification:</strong> +10 points (Base).</li>
              <li><strong>Penalty:</strong> -5 points for incorrect identification or failing to intercept.</li>
              <li><strong>Quick Draw Bonus:</strong> Intercepting a target within 3 seconds grants an instant +5 speed bonus.</li>
              <li><strong>Combo Multipliers:</strong> Build consecutive unbroken streaks for x2 (3+ hits) and x3 (5+ hits) multipliers.</li>
            </ul>
          </section>

          {/* Controls */}
          <section className="inst-card full-width">
            <div className="inst-card-accent gold-accent" />
            <h2 className="inst-card-title">
              <span className="inst-icon">⌨️</span> HOST COMMANDS
            </h2>
            <div className="inst-controls-grid">
              <div className="inst-key-item">
                <kbd>←</kbd>
                <span>REJECT (WRONG)</span>
              </div>
              <div className="inst-key-item">
                <kbd>→</kbd>
                <span>IDENTIFY (CORRECT)</span>
              </div>
              <div className="inst-key-item">
                <kbd>SPACE</kbd>
                <span>SYSTEM PAUSE</span>
              </div>
            </div>
            <p className="inst-note">Note: Host initiates commands via keyboard on laptop or touch controls on mobile.</p>
          </section>

          {/* Tactical Power-Ups */}
          <section className="inst-card full-width inst-powerups-card">
            <div className="inst-card-accent magenta-accent" />
            <h2 className="inst-card-title">
              <span className="inst-icon">🛡️</span> TACTICAL SYSTEMS (POWER-UPS)
            </h2>
            <p className="inst-desc">Expending your Neural Points allows activation of advanced tactical support:</p>

            <div className="inst-powerups-grid">
              <div className="inst-powerup">
                <div className="inst-pu-header">
                  <span className="inst-pu-icon">⏳</span>
                  <span className="inst-pu-name">TIME WARP</span>
                  <kbd>1</kbd>
                </div>
                <div className="inst-pu-cost">COST: 80 PTS</div>
                <div className="inst-pu-desc">Injects +15 seconds directly into your Neural Energy (Timer). Essential for surviving long rounds or clutch moments when you're running out of time.</div>
              </div>

              <div className="inst-powerup">
                <div className="inst-pu-header">
                  <span className="inst-pu-icon">🧠</span>
                  <span className="inst-pu-name">NEURAL HACK</span>
                  <kbd>2</kbd>
                </div>
                <div className="inst-pu-cost">COST: 150 PTS</div>
                <div className="inst-pu-desc">The ultimate tactical advantage. Instantly decodes and reveals the correct target answer directly on the main screen, allowing for a guaranteed hit.</div>
              </div>

              <div className="inst-powerup">
                <div className="inst-pu-header">
                  <span className="inst-pu-icon">🛡️</span>
                  <span className="inst-pu-name">SHIELD</span>
                  <kbd>3</kbd>
                </div>
                <div className="inst-pu-cost">COST: 100 PTS</div>
                <div className="inst-pu-desc">Deploys a protective barrier that absorbs the point (-5 pts) and time (-5s) penalty of your very next incorrect answer.</div>
              </div>

              <div className="inst-powerup">
                <div className="inst-pu-header">
                  <span className="inst-pu-icon">💣</span>
                  <span className="inst-pu-name">SABOTAGE</span>
                  <kbd>4</kbd>
                </div>
                <div className="inst-pu-cost">COST: 120 PTS</div>
                <div className="inst-pu-desc">An offensive measure that disrupts the enemy's uplink, stripping exactly -5 seconds from your opponent's timer to apply heavy pressure.</div>
              </div>
            </div>
          </section>
        </div>

        {/* Back Button */}
        <button
          className="inst-back-btn"
          onMouseEnter={playHover}
          onClick={() => { playClick(); navigate(-1); }}
        >
          <span>←</span> ACKNOWLEDGE & RETURN
        </button>

      </div>
    </div>
  );
}
