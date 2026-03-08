import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import useSound from '../hooks/useSound';
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
  const { unlockAudio } = useAudio();
  const audioContextRef = useRef(null);

  const { play: playTerminal, stop: stopTerminal } = useSound('/sounds/terminal.mp3', { volume: 0.4, loop: true });
  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.4 });

  useEffect(() => {
    const handleFirstClick = () => {
      unlockAudio();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);

    playTerminal();
    const sequence = [
      { text: "ESTABLISHING SECURE CONNECTION...", tag: "NET", delay: 0 },
      { text: "BYPASSING NEURAL FIREWALLS...", tag: "FWL", delay: 800 },
      { text: "INJECTING COMBAT OVERLAY...", tag: "SYS", delay: 1600 },
      { text: "CALIBRATING ANATOMICAL SENSORS...", tag: "BIO", delay: 2400 },
      { text: "SYNCHRONIZING WITH COMMAND...", tag: "CMD", delay: 3200 },
      { text: "ACCESS GRANTED. WELCOME, OPERATIVE.", tag: "RDY", delay: 4000 }
    ];

    sequence.forEach((item, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, item]);
        setProgress(((index + 1) / sequence.length) * 100);

        if (index === sequence.length - 1) {
          setTimeout(() => {
            setShowContent(true);
            stopTerminal();
          }, 1200);
        }
      }, item.delay);
    });

  }, []);

  return (
    <div className="page-wrapper landing-premium">
      {/* Terminal Sequence */}
      <div className={`terminal-loader ${showContent ? 'fade-out' : ''}`}>
        <div className="scanline"></div>

        {/* Ambient grid */}
        <div className="term-ambient-grid" />
        {/* Horizontal sweep */}
        <div className="term-sweep-line" />

        <div className="terminal-content">
          {/* Title badge */}
          <div className="term-badge-row">
            <div className="term-badge">
              <span className="term-badge-dot" />
              <span>AEP SYSTEMS</span>
            </div>
            <span className="term-ver">v4.2.0-STABLE</span>
          </div>

          <div className="term-title-block">
            <h2 className="term-main-title">SYSTEM <span>INIT</span></h2>
          </div>

          {/* Spinner + status */}
          <div className="term-status-area">
            <div className="term-spinner">
              <div className="term-ring outer" />
              <div className="term-ring inner" />
              <div className="term-core">
                <span className="term-pct">{Math.round(progress)}</span>
              </div>
            </div>

            <div className="term-log-panel">
              <div className="term-current-line">
                {logs.length > 0 && (
                  <>
                    <span className="term-tag">[{logs[logs.length - 1].tag}]</span>
                    <ScrambledText text={logs[logs.length - 1].text} />
                  </>
                )}
                {!showContent && <span className="terminal-cursor" />}
              </div>
              <div className="term-log-history">
                {logs.slice(0, -1).map((log, i) => (
                  <div key={i} className="term-log-entry">
                    <span className="term-log-tag">[{log.tag}]</span>
                    <span className="term-log-text">{log.text}</span>
                    <span className="term-log-ok">✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="term-progress-wrap">
            <div className="term-prog-bar-bg">
              <div className="term-prog-bar-fill" style={{ width: `${progress}%` }} />
              <div className="term-prog-glow" style={{ left: `${progress}%` }} />
            </div>
            <div className="term-prog-meta">
              <span>UPLINK INTEGRITY</span>
              <span className="term-prog-pct">{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="terminal-status">
            <span>UPTIME: 99.99%</span>
            <span>OS: NEURAL-KERNEL-01</span>
            <span>ENCRYPTION: AES-256</span>
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div className={`hero-content ${showContent ? 'fade-in' : ''}`}>
        <div className="hero-glitch-wrapper">
          <h1 className="glitch-text" data-text="SECONDS TO SURVIVE">SECONDS TO SURVIVE</h1>
          <div className="title-underline"></div>
        </div>

        <p className="hero-subtitle">BY AEP OPERATIONAL COMMAND</p>

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
          <button
            className="btn-primary-glitch"
            onClick={() => { playClick(); navigate('/dashboard'); }}
            onMouseEnter={playHover}
          >
            <span className="btn-text">INITIALIZE ARENA</span>
            <span className="btn-glitch-effect"></span>
          </button>
          <button
            className="btn-text-only"
            onClick={() => { playClick(); navigate('/leaderboard'); }}
            onMouseEnter={playHover}
          >
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
