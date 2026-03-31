import { useNavigate, useLocation } from 'react-router-dom';
import useSound from '../hooks/useSound';
import './Instructions.css';

export default function Instructions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.4 });

  const handleAcknowledge = () => {
    playClick();
    if (location.state?.fromHome) {
      navigate(-1);
    } else {
      navigate('/round-select');
    }
  };

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
              <li><strong>Target Identification:</strong> Identify visual targets under extreme time pressure.</li>
              <li><strong>Dual Piloting:</strong> Operations are strictly 2-player alternate competitive.</li>
              <li><strong>Timer Mechanics:</strong> Correct identifies boost timer (+5s). Fails drain it (-5s).</li>
            </ul>
          </section>

          {/* Scoring & Bonuses */}
          <section className="inst-card">
            <div className="inst-card-accent cyan-accent" />
            <h2 className="inst-card-title">
              <span className="inst-icon">⚡</span> NEURAL SCORING
            </h2>
            <ul className="inst-list">
              <li><strong>Identification:</strong> +10 points. <strong>Penalty:</strong> -5 points.</li>
              <li><strong>Quick Draw Bonus:</strong> Intercepting within 3 seconds grants +5 pts.</li>
              <li><strong>Combo Multipliers:</strong> Build consecutive streaks for x2 and x3 multipliers.</li>
            </ul>
          </section>

          {/* Tactical Power-Ups */}
          <section className="inst-card full-width inst-powerups-card">
            <div className="inst-card-accent magenta-accent" />
            <h2 className="inst-card-title">
              <span className="inst-icon">🛡️</span> TACTICAL SYSTEMS (POWER-UPS)
            </h2>
            <p className="inst-desc">Expend Neural Points to activate advanced tactical advantage options:</p>

            <div className="inst-powerups-grid">
              <div className="inst-powerup">
                <div className="inst-pu-header">
                  <span className="inst-pu-icon">⏳</span>
                  <span className="inst-pu-name">TIME WARP</span>
                </div>
                <div className="inst-pu-cost">COST: 80 PTS</div>
                <div className="inst-pu-desc">Injects +15 seconds into your Neural Energy (Timer). Essential for surviving long rounds.</div>
              </div>

              <div className="inst-powerup">
                <div className="inst-pu-header">
                  <span className="inst-pu-icon">🛡️</span>
                  <span className="inst-pu-name">SHIELD</span>
                </div>
                <div className="inst-pu-cost">COST: 150 PTS</div>
                <div className="inst-pu-desc">Deploys a permanent barrier that blocks all point/time penalties from wrong answers for the entire game.</div>
              </div>

              <div className="inst-powerup">
                <div className="inst-pu-header">
                  <span className="inst-pu-icon">💣</span>
                  <span className="inst-pu-name">SABOTAGE</span>
                </div>
                <div className="inst-pu-cost">COST: 120 PTS</div>
                <div className="inst-pu-desc">Disrupts enemy uplink, stripping -30 seconds from opponent's timer. A devastating tactical strike.</div>
              </div>
            </div>
          </section>
        </div>

        {/* Action Button */}
        <button
          className="inst-back-btn"
          onMouseEnter={playHover}
          onClick={handleAcknowledge}
        >
          <span>✔</span> {location.state?.fromHome ? 'ACKNOWLEDGE & RETURN' : 'ACKNOWLEDGE & PROCEED'}
        </button>

      </div>
    </div>
  );
}
