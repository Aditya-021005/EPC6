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
            <span>CLASSIFIED BRIEFING</span>
          </div>
          <h1 className="inst-title">COMBAT <span>PROTOCOL</span></h1>
          <div className="inst-header-line" />
        </div>

        {/* Rules Section */}
        <div className="inst-rules">
          <div className="inst-rule">
            <div className="inst-rule-num">01</div>
            <div className="inst-rule-body">
              <div className="inst-rule-label">TARGET IDENTIFICATION</div>
              <div className="inst-rule-text">Identify visual targets under extreme time pressure. Two operators compete in alternating turns.</div>
            </div>
          </div>
          <div className="inst-rule">
            <div className="inst-rule-num">02</div>
            <div className="inst-rule-body">
              <div className="inst-rule-label">SCORING SYSTEM</div>
              <div className="inst-rule-text">+10 pts per correct ID. -5 pts per fail. Answer within 3s for a +5 Quick Draw bonus. Streaks unlock x2 and x3 combo multipliers.</div>
            </div>
          </div>
          <div className="inst-rule">
            <div className="inst-rule-num">03</div>
            <div className="inst-rule-body">
              <div className="inst-rule-label">TIMER MECHANICS</div>
              <div className="inst-rule-text">Each operator has 60s of Neural Energy. Correct IDs grant +5s. Fails drain -5s. When your timer hits zero, the round ends.</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="inst-divider">
          <span className="inst-divider-text">TACTICAL SYSTEMS</span>
        </div>

        {/* Power-Ups */}
        <div className="inst-powerups">
          <div className="inst-pu-card inst-pu-warp">
            <div className="inst-pu-glow" />
            <div className="inst-pu-icon-wrap">⏳</div>
            <div className="inst-pu-info">
              <div className="inst-pu-name">TIME WARP</div>
              <div className="inst-pu-cost">80 PTS</div>
            </div>
            <div className="inst-pu-desc">Injects +15 seconds into your Neural Energy timer.</div>
            <div className="inst-pu-key">KEY: 1</div>
          </div>

          <div className="inst-pu-card inst-pu-shield">
            <div className="inst-pu-glow" />
            <div className="inst-pu-icon-wrap">🛡️</div>
            <div className="inst-pu-info">
              <div className="inst-pu-name">SHIELD</div>
              <div className="inst-pu-cost">150 PTS</div>
            </div>
            <div className="inst-pu-desc">Permanent barrier — blocks all wrong answer penalties for the entire game.</div>
            <div className="inst-pu-key">KEY: 2</div>
          </div>

          <div className="inst-pu-card inst-pu-sabotage">
            <div className="inst-pu-glow" />
            <div className="inst-pu-icon-wrap">💣</div>
            <div className="inst-pu-info">
              <div className="inst-pu-name">SABOTAGE</div>
              <div className="inst-pu-cost">120 PTS</div>
            </div>
            <div className="inst-pu-desc">Strips -30 seconds from your opponent's timer. Devastating.</div>
            <div className="inst-pu-key">KEY: 3</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="inst-proceed-btn"
          onMouseEnter={playHover}
          onClick={handleAcknowledge}
        >
          <span className="inst-btn-inner">
            <span className="inst-btn-icon">▶</span>
            {location.state?.fromHome ? 'ACKNOWLEDGE & RETURN' : 'ENGAGE COMBAT'}
          </span>
          <span className="inst-btn-glow" />
        </button>

      </div>
    </div>
  );
}
