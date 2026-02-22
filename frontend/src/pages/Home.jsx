import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const sequence = [
      "INITIALIZING NEURAL LINK...",
      "AUTHENTICATING COMBATANT...",
      "FETCHING MISSION PARAMETERS...",
      "LOADING ANATOMICAL DATASETS...",
      "ACCESS GRANTED."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < sequence.length) {
        setLogs(prev => [...prev, sequence[current]]);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowContent(true), 500);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-wrapper landing-premium">
      {/* Terminal Sequence */}
      <div className={`terminal-loader ${showContent ? 'fade-out' : ''}`}>
        <div className="terminal-content">
          {logs.map((log, i) => (
            <div key={i} className="terminal-line">
              <span className="prompt">{'>'}</span> {log}
            </div>
          ))}
          {!showContent && <div className="terminal-cursor" />}
        </div>
      </div>

      {/* Hero Content */}
      <div className={`hero-content ${showContent ? 'fade-in' : ''}`}>
        <div className="hero-glitch-wrapper">
          <h1 className="glitch-text" data-text="SECONDS TO SURVIVE">SECONDS TO SURVIVE</h1>
          <div className="title-underline"></div>
        </div>

        <p className="hero-subtitle">BY AEP <span>&</span> ELAS OPERATIONAL COMMAND</p>

        {/* Mission Specs */}
        <div className="mission-specs">
          <div className="spec-card">
            <div className="spec-label">PERSONNEL</div>
            <div className="spec-value">2 PLAYERS</div>
          </div>
          <div className="spec-card">
            <div className="spec-label">DURATION</div>
            <div className="spec-value">120 SECONDS</div>
          </div>
          <div className="spec-card">
            <div className="spec-label">OBJECTIVE</div>
            <div className="spec-value">ANATOMY IDENT</div>
          </div>
        </div>

        <div className="button-group-premium">
          <button className="btn-primary-glitch" onClick={() => navigate('/dashboard')}>
            <span className="btn-text">INITIALIZE ARENA</span>
            <span className="btn-glitch-effect"></span>
          </button>
          <button className="btn-text-only" onClick={() => navigate('/leaderboard')}>
            VIEW GLOBAL HALL OF FAME
          </button>
        </div>

        <div className="branding-footer">
          SECURED CONNECTION // ENCRYPTED PROTOCOL v4.2
        </div>
      </div>
    </div>
  );
}
