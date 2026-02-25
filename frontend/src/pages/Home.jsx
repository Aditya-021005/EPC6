import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const ScrambledText = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  useEffect(() => {
    let timeout;
    let frame = 0;
    const totalFrames = 15;

    timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (frame >= totalFrames) {
          setDisplayText(text);
          clearInterval(interval);
          return;
        }

        const scrambled = text.split('').map((char, i) => {
          if (char === ' ') return ' ';
          if (i < (frame / totalFrames) * text.length) return text[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');

        setDisplayText(scrambled);
        frame++;
      }, 40);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span>{displayText}</span>;
};

export default function Home() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const audioContextRef = useRef(null);

  useEffect(() => {
    const sequence = [
      { text: "ESTABLISHING SECURE CONNECTION...", delay: 0 },
      { text: "BYPASSING NEURAL FIREWALLS...", delay: 800 },
      { text: "INJECTING COMBAT OVERLAY...", delay: 1600 },
      { text: "CALIBRATING ANATOMICAL SENSORS...", delay: 2400 },
      { text: "SYNCHRONIZING WITH COMMAND...", delay: 3200 },
      { text: "ACCESS GRANTED. WELCOME, OPERATIVE.", delay: 4000 }
    ];

    sequence.forEach((item, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, item]);
        setProgress(((index + 1) / sequence.length) * 100);

        if (index === sequence.length - 1) {
          setTimeout(() => setShowContent(true), 1200);
        }
      }, item.delay);
    });

  }, []);

  return (
    <div className="page-wrapper landing-premium">
      {/* Terminal Sequence */}
      <div className={`terminal-loader ${showContent ? 'fade-out' : ''}`}>
        <div className="scanline"></div>
        <div className="terminal-content">
          <div className="terminal-header">
            <span className="terminal-title">AEP // SYSTEM_INIT</span>
            <span className="terminal-version">v4.2.0-STABLE</span>
          </div>

          <div className="terminal-body">
            {logs.map((log, i) => (
              <div key={i} className="terminal-line">
                <span className="prompt">{'>'}</span>
                <ScrambledText text={log.text} />
              </div>
            ))}
            {!showContent && <div className="terminal-cursor" />}
          </div>

          <div className="terminal-progress-container">
            <div className="terminal-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="terminal-status">
            <span>UPTIME: 99.99%</span>
            <span>OS: NEURAL-KERNEL-01</span>
            <span>LOAD: {Math.round(progress)}%</span>
          </div>
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
