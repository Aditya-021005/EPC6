import { useState, useEffect, useRef } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [hide, setHide] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [glitchText, setGlitchText] = useState(false);
  const completedRef = useRef(false);

  const statusMessages = [
    { text: "BOOTING NEURAL INTERFACE", icon: "◈", sys: "SYS" },
    { text: "SYNCING SATELLITE UPLINK", icon: "◎", sys: "NET" },
    { text: "SCANNING BIOMETRIC SIGNATURES", icon: "◉", sys: "BIO" },
    { text: "DECRYPTING MISSION PACKETS", icon: "◆", sys: "SEC" },
    { text: "CALIBRATING COMBAT HUD", icon: "◇", sys: "HUD" },
    { text: "BYPASSING FIREWALLS", icon: "◈", sys: "FWL" },
    { text: "LOADING TACTICAL ASSETS", icon: "◊", sys: "AST" },
    { text: "ALL SYSTEMS NOMINAL", icon: "●", sys: "RDY" },
  ];

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => {
        if (prev < statusMessages.length - 1) {
          setGlitchText(true);
          setTimeout(() => setGlitchText(false), 200);
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 5 + 2;
        if (next >= 100) {
          clearInterval(progressInterval);
          clearInterval(statusInterval);
          setStatusIndex(statusMessages.length - 1);
          if (!completedRef.current) {
            completedRef.current = true;
            setTimeout(() => {
              setHide(true);
              setTimeout(() => onComplete?.(), 700);
            }, 500);
          }
          return 100;
        }
        return next;
      });
    }, 100);

    return () => {
      clearInterval(statusInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const currentStatus = statusMessages[statusIndex];

  return (
    <div className={`loading-screen ${hide ? 'hide' : ''}`}>
      {/* Ambient effects */}
      <div className="loader-ambient-grid" />
      <div className="loader-scan-line" />

      <div className="loader-main">

        {/* Core spinner */}
        <div className="loader-core-wrap">
          <div className="hex-spinner">
            <div className="hex-ring outer" />
            <div className="hex-ring middle" />
            <div className="hex-ring inner" />
            <div className="hex-core">
              <span className="hex-percent">{Math.round(progress)}</span>
            </div>
          </div>
          {/* Orbital dots */}
          <div className="orbital-ring">
            <div className="orbital-dot d1" />
            <div className="orbital-dot d2" />
            <div className="orbital-dot d3" />
          </div>
        </div>

        {/* Title */}
        <div className="loader-brand">
          <div className="loader-brand-title">SECONDS TO <span>SURVIVE</span></div>
          <div className="loader-brand-sub">COMBAT SYSTEMS v2.0</div>
        </div>

        {/* Status panel */}
        <div className="loader-panel">
          <div className={`loader-current-status ${glitchText ? 'glitch' : ''}`}>
            <span className="status-sys-tag">[{currentStatus.sys}]</span>
            <span className="status-icon">{currentStatus.icon}</span>
            <span className="status-text">{currentStatus.text}</span>
          </div>

          {/* Terminal log */}
          <div className="loader-log">
            {statusMessages.slice(0, statusIndex).map((msg, i) => (
              <div key={i} className="loader-log-line">
                <span className="log-tag">[{msg.sys}]</span>
                <span className="log-msg">{msg.text}</span>
                <span className="log-ok">OK</span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="loader-progress-wrap">
            <div className="loader-prog-header">
              <span>UPLINK PROGRESS</span>
              <span className="loader-prog-pct">{Math.round(progress)}%</span>
            </div>
            <div className="loader-prog-track">
              <div
                className="loader-prog-fill"
                style={{ width: `${progress}%` }}
              />
              <div
                className="loader-prog-glow"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
