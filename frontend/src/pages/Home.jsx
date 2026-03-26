import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import useSound from '../hooks/useSound';
import './Landing.css';
import stsLogo from '../assets/logo_sts.png';

/* ── Scrambled text (unchanged) ── */
const ScrambledText = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = '!@#$%^&*()_+~`|}{[]:;?><,./-=ABCDEFアイウ01';
  useEffect(() => {
    let timeout; let frame = 0; const totalFrames = 18;
    timeout = setTimeout(() => {
      const iv = setInterval(() => {
        if (frame >= totalFrames) { setDisplayText(text); clearInterval(iv); return; }
        setDisplayText(text.split('').map((c, i) => {
          if (c === ' ') return ' ';
          if (i < (frame / totalFrames) * text.length) return c;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join(''));
        frame++;
      }, 38);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);
  return <span>{displayText}</span>;
};

/* ── EKG waveform ── */
function EkgLine({ spike }) {
  const pts = spike
    ? '0,24 30,24 38,4 44,44 50,24 60,24 68,14 74,34 80,24 200,24'
    : '0,24 200,24';
  return (
    <svg className="ekg-svg" viewBox="0 0 200 48" preserveAspectRatio="none">
      <polyline className="ekg-line" points={pts} />
      {spike && <circle className="ekg-dot" cx="44" cy="4" r="2" />}
    </svg>
  );
}

/* ── Hex node ── */
function HexNode({ progress }) {
  const pct = Math.round(progress);
  const locked = pct >= 100;
  return (
    <div className={`hx-wrap ${locked ? 'hx-wrap--locked' : ''}`}>
      {/* outer rotating dashes */}
      <div className="hx-orbit" />
      {/* middle counter ring */}
      <div className="hx-ring" />
      {/* hex body */}
      <div className="hx-body">
        <svg className="hx-svg" viewBox="0 0 100 100">
          <polygon
            className="hx-polygon-bg"
            points="50,3 94,26 94,74 50,97 6,74 6,26"
          />
          <polygon
            className="hx-polygon-border"
            points="50,3 94,26 94,74 50,97 6,74 6,26"
            strokeDasharray="230"
            strokeDashoffset={230 - (230 * progress) / 100}
          />
        </svg>
        <div className="hx-inner">
          <div className="hx-pct">{pct.toString().padStart(2, '0')}</div>
          <div className="hx-sub">{locked ? 'LOCKED' : 'BREACH'}</div>
        </div>
      </div>
      {/* corner tick marks */}
      <div className="hx-tick hx-tick--t" />
      <div className="hx-tick hx-tick--b" />
      <div className="hx-tick hx-tick--tl" />
      <div className="hx-tick hx-tick--tr" />
    </div>
  );
}

/* ── Circuit traces (SVG, drawn on mount) ── */
function CircuitBoard() {
  return (
    <svg className="circuit-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
      {/* horizontal traces */}
      <line className="ct ct--a" x1="0" y1="80" x2="800" y2="80" />
      <line className="ct ct--b" x1="0" y1="420" x2="800" y2="420" />
      <line className="ct ct--c" x1="0" y1="250" x2="260" y2="250" />
      <line className="ct ct--c" x1="540" y1="250" x2="800" y2="250" />
      {/* vertical traces */}
      <line className="ct ct--d" x1="120" y1="0" x2="120" y2="500" />
      <line className="ct ct--e" x1="680" y1="0" x2="680" y2="500" />
      <line className="ct ct--f" x1="400" y1="0" x2="400" y2="160" />
      <line className="ct ct--f" x1="400" y1="340" x2="400" y2="500" />
      {/* diagonal accent */}
      <line className="ct ct--g" x1="120" y1="80" x2="200" y2="160" />
      <line className="ct ct--g" x1="680" y1="80" x2="600" y2="160" />
      <line className="ct ct--g" x1="120" y1="420" x2="200" y2="340" />
      <line className="ct ct--g" x1="680" y1="420" x2="600" y2="340" />
      {/* nodes at intersections */}
      {[[120, 80], [680, 80], [120, 420], [680, 420], [120, 250], [680, 250], [400, 80], [400, 420]].map(([x, y], i) => (
        <circle key={i} className={`cn cn--${i % 3 === 0 ? 'a' : i % 3 === 1 ? 'b' : 'c'}`} cx={x} cy={y} r="4" />
      ))}
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [showContent, setShow] = useState(false);
  const [spike, setSpike] = useState(false);
  const { unlockAudio, isUnlocked } = useAudio();

  const { play: playTerminal, stop: stopTerminal } = useSound('/sounds/terminal.mp3', { volume: 1.0, loop: true });
  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.4 });

  // Hide shared cyber-grid on home screen
  useEffect(() => {
    document.body.classList.add('home-active');
    return () => document.body.classList.remove('home-active');
  }, []);

  useEffect(() => {
    const handleFirstClick = () => {
      unlockAudio();
      playTerminal();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);

    // If already unlocked, play immediately
    if (isUnlocked) {
      playTerminal();
    }

    const sequence = [
      { text: "ESTABLISHING SECURE CONNECTION...", tag: "NET", delay: 0 },
      { text: "BYPASSING NEURAL FIREWALLS...", tag: "FWL", delay: 800 },
      { text: "INJECTING COMBAT OVERLAY...", tag: "SYS", delay: 1600 },
      { text: "CALIBRATING ANATOMICAL SENSORS...", tag: "BIO", delay: 2400 },
      { text: "SYNCHRONIZING WITH COMMAND...", tag: "CMD", delay: 3200 },
      { text: "ACCESS GRANTED. WELCOME, OPERATIVE.", tag: "RDY", delay: 4000 },
    ];

    sequence.forEach((item, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, item]);
        setProgress(((index + 1) / sequence.length) * 100);
        setSpike(true);
        setTimeout(() => setSpike(false), 600);
        if (index === sequence.length - 1) {
          setTimeout(() => { setShow(true); stopTerminal(); }, 1200);
        }
      }, item.delay);
    });
  }, []);

  return (
    <div className="page-wrapper landing-premium">

      {/* ══ NEURAL BREACH LOADER ══ */}
      <div className={`nb-shell ${showContent ? 'nb-shell--exit' : ''}`}>

        {/* Layers */}
        <div className="nb-bg" />
        <CircuitBoard />
        <div className="nb-scanline" />
        <div className="nb-sweep" />
        <div className="nb-vignette" />

        {/* Corner brackets */}
        <span className="nb-corner nb-corner--tl" />
        <span className="nb-corner nb-corner--tr" />
        <span className="nb-corner nb-corner--bl" />
        <span className="nb-corner nb-corner--br" />

        {/* Top bar */}
        <div className="nb-topbar">
          <div className="nb-topbar__brand">
            <span className="nb-topbar__sigil">◈</span>
            <span className="nb-topbar__id">AEP // NEURAL BREACH v4.2</span>
          </div>
          <div className="nb-topbar__right">
            <span className="nb-topbar__blink" />
            <span className="nb-topbar__status">UPLINK ACTIVE</span>
          </div>
        </div>

        {/* Main panel */}
        <div className="nb-main">

          {/* Left col — hex node + meta */}
          <div className="nb-left">
            <HexNode progress={progress} />
            <div className="nb-left__meta">
              <div className="nb-meta-row"><span className="nb-meta-key">NODE</span><span className="nb-meta-val">ALPHA-7</span></div>
              <div className="nb-meta-row"><span className="nb-meta-key">ENC</span><span className="nb-meta-val">AES-256</span></div>
              <div className="nb-meta-row"><span className="nb-meta-key">LAT</span><span className="nb-meta-val">4ms</span></div>
            </div>
          </div>

          {/* Center col — EKG + log */}
          <div className="nb-center">

            {/* System title */}
            <div className="nb-sys-title">
              <span className="nb-sys-title__tag">[ SYS ]</span>
              <h2 className="nb-sys-title__text">SYSTEM <em>INITIALIZE</em></h2>
            </div>

            {/* EKG waveform */}
            <div className="nb-ekg">
              <div className="nb-ekg__label">BIO-SIGNAL</div>
              <EkgLine spike={spike} />
            </div>

            {/* Active status */}
            <div className="nb-status">
              <div className="nb-status__head">
                <span className="nb-status__dot" />
                <span className="nb-status__label">ACTIVE PROCESS</span>
              </div>
              <div className="nb-status__line">
                {logs.length > 0 && (
                  <>
                    <span className="nb-status__tag">[{logs[logs.length - 1].tag}]</span>
                    <ScrambledText text={logs[logs.length - 1].text} />
                  </>
                )}
                {!showContent && <span className="nb-cursor" />}
              </div>
            </div>

            {/* Log */}
            <div className="nb-log">
              {logs.slice(0, -1).map((log, i) => (
                <div key={i} className="nb-log__row">
                  <span className="nb-log__tag">[{log.tag}]</span>
                  <span className="nb-log__msg">{log.text}</span>
                  <span className="nb-log__ok">✓ OK</span>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="nb-progress">
              <div className="nb-progress__head">
                <span>ACCESS INTEGRITY</span>
                <span className="nb-progress__pct">{Math.round(progress)}%</span>
              </div>
              <div className="nb-progress__track">
                <div className="nb-progress__fill" style={{ width: `${progress}%` }}>
                  <div className="nb-progress__glint" />
                </div>
                <div className="nb-progress__segments" />
              </div>
            </div>

          </div>

          {/* Right col — vertical data stream */}
          <div className="nb-right">
            <div className="nb-stream">
              {Array.from({ length: 18 }, (_, i) => (
                <div key={i} className="nb-stream__row" style={{ animationDelay: `${i * 0.12}s` }}>
                  <span>{Math.random() > 0.5 ? '1' : '0'}</span>
                  <span>{Math.random() > 0.5 ? '1' : '0'}</span>
                  <span>{Math.random() > 0.5 ? '1' : '0'}</span>
                  <span>{Math.random() > 0.5 ? '1' : '0'}</span>
                </div>
              ))}
            </div>
            <div className="nb-right__label">DATA STREAM</div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="nb-bottombar">
          <span>UPTIME: 99.99%</span>
          <span className="nb-bottombar__center">◆ SECURED CHANNEL ◆</span>
          <span>OS: NEURAL-KERNEL-01</span>
        </div>

      </div>

      {/* ══ HOME-ONLY FLASHY BACKGROUND ══ */}
      <div className={`home-bg-layer ${showContent ? 'home-bg-layer--active' : ''}`}>
        {/* Dark base to cover shared grid */}
        <div className="hbg-base" />

        {/* Plasma morphing blobs */}
        <div className="hbg-plasma" />

        {/* Aurora blobs */}
        <div className="hbg-aurora hbg-aurora--1" />
        <div className="hbg-aurora hbg-aurora--2" />
        <div className="hbg-aurora hbg-aurora--3" />
        <div className="hbg-aurora hbg-aurora--4" />

        {/* Energy rings */}
        <div className="hbg-ring hbg-ring--1" />
        <div className="hbg-ring hbg-ring--2" />
        <div className="hbg-ring hbg-ring--3" />

        {/* Floating orbs */}
        <div className="hbg-orb hbg-orb--cyan" />
        <div className="hbg-orb hbg-orb--magenta" />
        <div className="hbg-orb hbg-orb--gold" />
        <div className="hbg-orb hbg-orb--cyan2" />
        <div className="hbg-orb hbg-orb--magenta2" />
        <div className="hbg-orb hbg-orb--gold2" />
        <div className="hbg-orb hbg-orb--white1" />
        <div className="hbg-orb hbg-orb--white2" />

        {/* Electric arcs */}
        <svg className="hbg-arc-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <path className="hbg-arc hbg-arc--1" d="M0,300 Q150,100 300,280 T600,200 T900,320 T1000,250" />
          <path className="hbg-arc hbg-arc--2" d="M0,400 Q200,200 400,350 T700,250 T1000,400" />
          <path className="hbg-arc hbg-arc--3" d="M100,500 Q250,300 500,450 T800,350 T1000,500" />
        </svg>

        {/* Starfield */}
        <div className="hbg-stars">
          {Array.from({ length: 60 }, (_, i) => (
            <div key={i} className="hbg-star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }} />
          ))}
        </div>

        {/* Light beams */}
        <div className="hbg-beam hbg-beam--1" />
        <div className="hbg-beam hbg-beam--2" />
        <div className="hbg-beam hbg-beam--3" />
        <div className="hbg-beam hbg-beam--4" />

        {/* Radial burst */}
        <div className="hbg-burst" />

        {/* Horizontal sweep lines */}
        <div className="hbg-sweep hbg-sweep--1" />
        <div className="hbg-sweep hbg-sweep--2" />
        <div className="hbg-sweep hbg-sweep--3" />
      </div>

      {/* ══ HERO CONTENT — REDESIGNED ══ */}
      <div className={`hero-content ${showContent ? 'fade-in' : ''}`}>

        {/* Holographic Emblem */}
        <div className="hero-emblem">
          <div className="hero-emblem__ring" />
          <div className="hero-emblem__ring hero-emblem__ring--2" />
          <div className="hero-emblem__icon">◈</div>
          <div className="hero-emblem__pulse" />
        </div>

        {/* Title Block */}
        <div className="hero-title-block">
          <div className="hero-title-deco hero-title-deco--left">
            <span /><span /><span />
          </div>
          <div className="hero-glitch-wrapper">
            <h1 className="glitch-text" data-text="SECONDS TO SURVIVE">SECONDS TO SURVIVE</h1>
            <div className="title-underline" />
          </div>
          <div className="hero-title-deco hero-title-deco--right">
            <span /><span /><span />
          </div>
        </div>

        {/* Subtitle with tag */}
        <div className="hero-tagline">
          <span className="hero-tagline__dash" />
          <span className="hero-tagline__text">TACTICAL ANATOMY COMBAT</span>
          <span className="hero-tagline__dot" />
          <span className="hero-tagline__text">AEP COMMAND</span>
          <span className="hero-tagline__dash" />
        </div>

        {/* Holo Data Panels */}
        <div className="holo-panels">
          <div className="holo-panel holo-panel--1">
            <div className="holo-panel__corner holo-panel__corner--tl" />
            <div className="holo-panel__corner holo-panel__corner--tr" />
            <div className="holo-panel__corner holo-panel__corner--bl" />
            <div className="holo-panel__corner holo-panel__corner--br" />
            <div className="holo-panel__accent" />
            <div className="holo-panel__icon">⬡</div>
            <div className="holo-panel__data">
              <div className="holo-panel__label">OPERATIVES</div>
              <div className="holo-panel__value">02</div>
              <div className="holo-panel__sub">DUAL PLAYER</div>
            </div>
            <div className="holo-panel__scanline" />
          </div>

          <div className="holo-panel holo-panel--2">
            <div className="holo-panel__corner holo-panel__corner--tl" />
            <div className="holo-panel__corner holo-panel__corner--tr" />
            <div className="holo-panel__corner holo-panel__corner--bl" />
            <div className="holo-panel__corner holo-panel__corner--br" />
            <div className="holo-panel__accent holo-panel__accent--magenta" />
            <div className="holo-panel__icon">◎</div>
            <div className="holo-panel__data">
              <div className="holo-panel__label">COUNTDOWN</div>
              <div className="holo-panel__value">120<span className="holo-panel__unit">SEC</span></div>
              <div className="holo-panel__sub">TIME LIMIT</div>
            </div>
            <div className="holo-panel__scanline" />
          </div>

          <div className="holo-panel holo-panel--3">
            <div className="holo-panel__corner holo-panel__corner--tl" />
            <div className="holo-panel__corner holo-panel__corner--tr" />
            <div className="holo-panel__corner holo-panel__corner--bl" />
            <div className="holo-panel__corner holo-panel__corner--br" />
            <div className="holo-panel__accent holo-panel__accent--gold" />
            <div className="holo-panel__icon">◇</div>
            <div className="holo-panel__data">
              <div className="holo-panel__label">MISSION</div>
              <div className="holo-panel__value">ID</div>
              <div className="holo-panel__sub">ANATOMY LOCK</div>
            </div>
            <div className="holo-panel__scanline" />
          </div>
        </div>

        {/* Status Readout */}
        <div className="hero-readout">
          <span className="hero-readout__dot" />
          <span className="hero-readout__text">SYS_READY</span>
          <span className="hero-readout__sep">|</span>
          <span className="hero-readout__text">UPLINK: <em>ACTIVE</em></span>
          <span className="hero-readout__sep">|</span>
          <span className="hero-readout__text">ARENA: <em>ONLINE</em></span>
          <span className="hero-readout__dot" />
        </div>

        <div className="hero-cta">
          <button className="hero-cta__btn"
            onClick={() => { playClick(); navigate('/dashboard'); }}
            onMouseEnter={playHover}>
            <span className="hero-cta__ring" />
            <span className="hero-cta__shimmer" />
            <span className="hero-cta__text">INITIALIZE ARENA</span>
          </button>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="hero-cta__secondary"
              onClick={() => { playClick(); navigate('/leaderboard'); }}
              onMouseEnter={playHover}>
              <span className="hero-cta__sec-icon">◆</span>
              VIEW GLOBAL HALL OF FAME
            </button>
            <button className="hero-cta__secondary"
              onClick={() => { playClick(); navigate('/instructions'); }}
              onMouseEnter={playHover}>
              <span className="hero-cta__sec-icon">📖</span>
              OPERATIONAL MANUAL
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="hero-footer">
          <span className="hero-footer__dash" />
          <span>SECURED CONNECTION // ENCRYPTED PROTOCOL v4.2</span>
          <span className="hero-footer__dash" />
        </div>
      </div>

    </div>
  );
}