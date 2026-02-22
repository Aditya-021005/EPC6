import { useState, useEffect } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [hide, setHide] = useState(false);

  const [statusIndex, setStatusIndex] = useState(0);
  const statusMessages = [
    "SYNCING SATELLITE UPLINK...",
    "ESTABLISHING NEURAL CONNECTION...",
    "SCANNING AREA FOR BIOMETRIC TRACES...",
    "DECRYPTING MISSION DATA PACKETS...",
    "CALIBRATING COMBAT HUD...",
    "BYPASSING SECURITY FIREWALLS...",
    "NEURAL LINK ESTABLISHED."
  ];

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev < statusMessages.length - 1 ? prev + 1 : prev));
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 8 + 2;
        if (next >= 100) {
          clearInterval(progressInterval);
          clearInterval(statusInterval);
          setStatusIndex(statusMessages.length - 1);
          setTimeout(() => {
            setHide(true);
            setTimeout(() => onComplete?.(), 800);
          }, 500);
          return 100;
        }
        return next;
      });
    }, 150);

    return () => {
      clearInterval(statusInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className={`loading-screen ${hide ? 'hide' : ''}`}>
      <div className="tactical-loader-container">
        {/* Radar Scanner */}
        <div className="neural-radar">
          <div className="radar-sweep"></div>

          {/* Extra Rotating Rings */}
          <div className="radar-rings-extra">
            <div className="radar-ring cw" style={{ width: '85%', height: '85%', borderStyle: 'dotted' }}></div>
            <div className="radar-ring ccw" style={{ width: '50%', height: '50%', opacity: 0.4 }}></div>
          </div>

          <div className="radar-circles">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
          <div className="radar-dots">
            <div className="dot" style={{ top: '20%', left: '30%' }}></div>
            <div className="dot" style={{ top: '60%', left: '70%' }}></div>
            <div className="dot" style={{ top: '40%', left: '80%' }}></div>
            <div className="dot" style={{ top: '75%', left: '20%', animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* Status Readout */}
        <div className="loader-hud">
          <div className="loader-header">MISSION INITIALIZATION</div>
          <div className="loader-status">
            <span className="status-blink"></span>
            {statusMessages[statusIndex]}
          </div>

          <div className="loader-terminal-log">
            {statusMessages.slice(0, statusIndex).map((msg, i) => (
              <div key={i} className="log-entry">{'>'} {msg} [OK]</div>
            ))}
          </div>

          <div className="loader-progress-module">
            <div className="loader-progress-labels">
              <span>UPLINK DATA</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="loader-progress-track">
              <div className="loader-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
