import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GameArena.css';
import LoadingScreen from '../components/LoadingScreen';
import useSound from '../hooks/useSound';

export default function Game() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // Players
  const player1 = localStorage.getItem('player1') || 'Player 1';
  const player2 = localStorage.getItem('player2') || 'Player 2';

  // Game state
  const [questions, setQuestions] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [quizMeta, setQuizMeta] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(1);
  const [timers, setTimers] = useState({ 1: 120, 2: 120 });
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [combo, setCombo] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [shake, setShake] = useState(null);

  // Power-up state
  const [powerUps, setPowerUps] = useState({
    1: { timeWarp: false, neuralHack: false, shield: false },
    2: { timeWarp: false, neuralHack: false, shield: false },
  });
  const [shieldActive, setShieldActive] = useState(false);
  const [hackRevealed, setHackRevealed] = useState(false);
  const [powerUpFlash, setPowerUpFlash] = useState(null);

  // Round transition state
  const [showTransition, setShowTransition] = useState(false);

  // Audio Hooks
  const { play: playCorrect } = useSound('/sounds/correct.mp3');
  const { play: playWrong } = useSound('/sounds/wrong.mp3');
  const { play: playTickTock, stop: stopTickTock } = useSound('/sounds/tick-tock-31883.mp3', { loop: true });
  const { play: playCountdown } = useSound('/sounds/countdown.mp3');
  const { play: playGo } = useSound('/sounds/go.mp3');

  // Refs
  const intervalRef = useRef(null);
  const stateRef = useRef({
    currentUser: 1,
    isPaused: false,
    isAnswerShown: false,
    gameOver: false,
    timers: { 1: 120, 2: 120 },
    scores: { 1: 0, 2: 0 },
    questions: [],
    currentIndex: 0,
    combo: 0,
    powerUps: {
      1: { timeWarp: false, neuralHack: false, shield: false },
      2: { timeWarp: false, neuralHack: false, shield: false },
    },
    shieldActive: false,
  });

  // Keep ref in sync
  useEffect(() => {
    stateRef.current = {
      currentUser, isPaused, isAnswerShown, gameOver,
      timers, scores, questions, currentIndex, combo,
      powerUps, shieldActive,
    };
  }, [currentUser, isPaused, isAnswerShown, gameOver, timers, scores, questions, currentIndex, combo, powerUps, shieldActive]);

  // Initialize audio removal/cleanup
  useEffect(() => {
    // Occasional glitch disruption
    const glitchInterval = setInterval(() => {
      const s = stateRef.current;
      if (!s.isPaused && !s.gameOver && !s.isAnswerShown && Math.random() > 0.7) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 800);
      }
    }, 5000);

    return () => {
      stopTickTock();
      clearInterval(intervalRef.current);
      clearInterval(glitchInterval);
    };
  }, [stopTickTock]);

  // Fetch questions
  useEffect(() => {
    fetch(`/api/quiz/${quizId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setQuestions(data.questions || []);
        setQuizMeta({ category: data.category, subcategory: data.subcategory });
        setDataLoaded(true);
      })
      .catch(err => {
        console.error('[SYS] Failed to load mission data:', err);
        setQuizMeta({ error: true, message: err.message });
        setDataLoaded(true);
      });
  }, [quizId]);

  // Handle initialization hang
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && dataLoaded && questions.length === 0) {
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading, dataLoaded, questions]);

  // Save scores to leaderboard when game ends
  const scoresSavedRef = useRef(false);
  useEffect(() => {
    if (gameOver && !scoresSavedRef.current) {
      scoresSavedRef.current = true;
      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1,
          player2,
          score1: scores[1],
          score2: scores[2],
          category: quizMeta.category,
          subcategory: quizMeta.subcategory,
          quizId,
        }),
      }).catch(err => console.error('Failed to save scores:', err));
    }
  }, [gameOver, player1, player2, scores, quizMeta, quizId]);

  // Start timer
  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      const s = stateRef.current;
      if (s.isPaused || s.isAnswerShown || s.gameOver) return;

      setTimers(prev => {
        const user = s.currentUser;
        const newTime = prev[user] - 1;

        if (newTime === 30) {
          playTickTock();
        }

        if (newTime <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          stopTickTock();
          setTimeout(() => setGameOver(true), 0);
          return { ...prev, [user]: 0 };
        }

        return { ...prev, [user]: newTime };
      });
    }, 1000);
  }, []);

  // Start game with Countdown
  useEffect(() => {
    if (!loading && !showBriefing && dataLoaded && questions.length > 0 && !gameStarted && countdown === null) {
      setCountdown(4);
      const cdInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(cdInterval);
            setGameStarted(true);
            startTimer();
            playGo(); // Final "GO" sound
            return 0;
          }
          playCountdown(); // Sounds for 3, 2, 1
          return prev - 1;
        });
      }, 1000);
    }
  }, [loading, showBriefing, dataLoaded, questions, gameStarted, startTimer, countdown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const switchUser = useCallback(() => {
    stopTickTock();
    setCurrentUser(prev => prev === 1 ? 2 : 1);
  }, [stopTickTock]);

  const nextQuestion = useCallback(() => {
    const s = stateRef.current;
    if (s.currentIndex + 1 >= s.questions.length) {
      setGameOver(true);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setIsAnswerShown(false);
    setAnswerResult(null);
    setHackRevealed(false);
    startTimer();
  }, [startTimer]);

  const showAnswer = useCallback((isCorrect) => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsAnswerShown(true);
    setHackRevealed(false);

    const s = stateRef.current;
    const answer = s.questions[s.currentIndex]?.answer || 'Unknown';
    setAnswerResult({ text: answer, isCorrect });

    // Show answer result for 2s, then cinematic transition for 1.5s
    setTimeout(() => {
      switchUser();
      // Check if this is the last question
      if (s.currentIndex + 1 >= s.questions.length) {
        nextQuestion();
        return;
      }
      setShowTransition(true);
      setTimeout(() => {
        setShowTransition(false);
        nextQuestion();
      }, 1500);
    }, 2000);
  }, [switchUser, nextQuestion]);

  const correctAnswer = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.gameOver || s.isPaused) return;
    playCorrect();

    const newCombo = s.combo + 1;
    const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;

    setShake('correct');
    setTimeout(() => setShake(null), 600);
    setCombo(newCombo);
    setScores(prev => ({
      ...prev,
      [s.currentUser]: prev[s.currentUser] + (10 * multiplier)
    }));

    setTimers(prev => ({
      ...prev,
      [s.currentUser]: prev[s.currentUser] + 5
    }));

    showAnswer(true);
  }, [showAnswer]);

  const wrongAnswer = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.gameOver || s.isPaused) return;
    playWrong();

    setShake('wrong');
    setTimeout(() => setShake(null), 600);
    setCombo(0);

    // Shield blocks the penalty
    if (s.shieldActive) {
      setShieldActive(false);
      setPowerUpFlash('shield-absorb');
      setTimeout(() => setPowerUpFlash(null), 800);
    } else {
      setScores(prev => ({
        ...prev,
        [s.currentUser]: Math.max(0, prev[s.currentUser] - 5)
      }));
      setTimers(prev => ({
        ...prev,
        [s.currentUser]: Math.max(0, prev[s.currentUser] - 5)
      }));
    }
    showAnswer(false);
  }, [showAnswer]);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.gameOver) return;
    setIsPaused(prev => {
      const newPaused = !prev;
      if (newPaused) {
        stopTickTock();
      } else if (s.timers[s.currentUser] <= 30) {
        playTickTock();
      }
      return newPaused;
    });
  }, [stopTickTock, playTickTock]);

  // Power-up activation functions
  const activateTimeWarp = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.gameOver || s.isPaused) return;
    if (s.powerUps[s.currentUser].timeWarp) return; // already used
    setPowerUps(prev => ({
      ...prev,
      [s.currentUser]: { ...prev[s.currentUser], timeWarp: true }
    }));
    setTimers(prev => ({
      ...prev,
      [s.currentUser]: prev[s.currentUser] + 15
    }));
    setPowerUpFlash('timeWarp');
    setTimeout(() => setPowerUpFlash(null), 800);
  }, []);

  const activateNeuralHack = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.gameOver || s.isPaused) return;
    if (s.powerUps[s.currentUser].neuralHack) return;
    setPowerUps(prev => ({
      ...prev,
      [s.currentUser]: { ...prev[s.currentUser], neuralHack: true }
    }));
    setHackRevealed(true);
    setPowerUpFlash('neuralHack');
    setTimeout(() => setPowerUpFlash(null), 800);
    setTimeout(() => setHackRevealed(false), 3000);
  }, []);

  const activateShield = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.gameOver || s.isPaused) return;
    if (s.powerUps[s.currentUser].shield) return;
    setPowerUps(prev => ({
      ...prev,
      [s.currentUser]: { ...prev[s.currentUser], shield: true }
    }));
    setShieldActive(true);
    setPowerUpFlash('shield');
    setTimeout(() => setPowerUpFlash(null), 800);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') wrongAnswer();
      else if (e.key === 'ArrowRight') correctAnswer();
      else if (e.key === ' ') {
        e.preventDefault();
        togglePause();
      }
      else if (e.key === '1') activateTimeWarp();
      else if (e.key === '2') activateNeuralHack();
      else if (e.key === '3') activateShield();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wrongAnswer, correctAnswer, togglePause, activateTimeWarp, activateNeuralHack, activateShield]);

  if (loading || !dataLoaded) {
    return <LoadingScreen onComplete={() => { setLoading(false); setShowBriefing(true); }} />;
  }

  if (showBriefing) {
    return (
      <div className="page-wrapper">
        <div className="briefing-container">
          <div className="briefing-badge">
            <span className="briefing-badge-dot" />
            <span>MISSION BRIEFING</span>
          </div>
          <h1 className="briefing-title">COMBAT <span>PROTOCOL</span></h1>
          <p className="briefing-subtitle">{quizMeta?.category?.toUpperCase()} — {quizMeta?.subcategory?.toUpperCase()}</p>

          <div className="briefing-grid">
            <div className="briefing-card">
              <div className="briefing-card-accent cyan-accent" />
              <div className="briefing-card-icon">⚡</div>
              <div className="briefing-card-title">OBJECTIVE</div>
              <div className="briefing-card-text">
                An image is shown. Identify it correctly to score points. Each player takes turns.
                Your timer counts down — when it hits zero, you're out.
              </div>
            </div>

            <div className="briefing-card">
              <div className="briefing-card-accent magenta-accent" />
              <div className="briefing-card-icon">🎮</div>
              <div className="briefing-card-title">CONTROLS</div>
              <div className="briefing-card-text">
                <div className="briefing-keys">
                  <div className="briefing-key-row"><span className="briefing-key">→</span> Correct / Identified</div>
                  <div className="briefing-key-row"><span className="briefing-key">←</span> Wrong / No Match</div>
                  <div className="briefing-key-row"><span className="briefing-key">SPACE</span> Pause Game</div>
                </div>
              </div>
            </div>

            <div className="briefing-card">
              <div className="briefing-card-accent gold-accent" />
              <div className="briefing-card-icon">🏆</div>
              <div className="briefing-card-title">SCORING</div>
              <div className="briefing-card-text">
                <strong>+10 pts</strong> per correct answer + <strong>5s</strong> bonus time.
                Build combos for <strong>2x—3x</strong> multipliers.
                Wrong answer: <strong>−5 pts</strong> and <strong>−5s</strong> penalty.
              </div>
            </div>

            <div className="briefing-card">
              <div className="briefing-card-accent cyan-accent" />
              <div className="briefing-card-icon">🛡️</div>
              <div className="briefing-card-title">POWER-UPS</div>
              <div className="briefing-card-text">
                <div className="briefing-keys">
                  <div className="briefing-key-row"><span className="briefing-key">1</span> Time Warp (+15s)</div>
                  <div className="briefing-key-row"><span className="briefing-key">2</span> Neural Hack (Reveal)</div>
                  <div className="briefing-key-row"><span className="briefing-key">3</span> Shield (Block Penalty)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="briefing-pilots">
            <div className="briefing-pilot cyan-pilot">
              <span className="briefing-pilot-label">PILOT 1</span>
              <span className="briefing-pilot-name">{player1}</span>
            </div>
            <span className="briefing-vs">VS</span>
            <div className="briefing-pilot magenta-pilot">
              <span className="briefing-pilot-label">PILOT 2</span>
              <span className="briefing-pilot-name">{player2}</span>
            </div>
          </div>

          <button
            className="briefing-start-btn"
            onClick={() => setShowBriefing(false)}
          >
            <span className="briefing-start-icon">▶</span>
            BEGIN MISSION
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="page-wrapper dashboard-wrapper">
        <div className="glass-container winner-container" style={{ maxWidth: 600 }}>
          <h1 className="title-glow">MATCH <span>TERMINATED</span></h1>
          <div className="side-panels" style={{ marginBottom: 30 }}>
            <div className="glass-panel hall-of-fame">
              <h3 className="panel-title-sm">OPERATIONS <span>WINNER</span></h3>
              <div className="mvp-highlight">
                <div className="mvp-avatar">🥇</div>
                <div className="mvp-name">
                  {scores[1] > scores[2] ? player1 : scores[2] > scores[1] ? player2 : 'DRAW'}
                </div>
              </div>
            </div>
          </div>
          <div className="scores-box" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
            fontSize: '18px',
            fontFamily: 'var(--font-display)',
            marginBottom: 40
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ opacity: 0.5, fontSize: '12px' }}>{player1}</div>
              <div style={{ color: 'var(--cyan)', fontSize: '32px', fontWeight: 900 }}>{scores[1]}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ opacity: 0.5, fontSize: '12px' }}>{player2}</div>
              <div style={{ color: 'var(--magenta)', fontSize: '32px', fontWeight: 900 }}>{scores[2]}</div>
            </div>
          </div>
          <div className="button-row">
            <button className="btn-primary-glitch" onClick={() => navigate('/')}>
              <span className="btn-text">RE-ENTER</span>
              <span className="btn-glitch-effect"></span>
            </button>
            <button className="btn-text-only" onClick={() => navigate('/leaderboard')}>ALL RESULTS</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const imageUrl = `/images/${currentQuestion?.image}`;

  return (
    <div className={`page-wrapper ${shake ? 'arena-shake' : ''}`}>
      {/* Power-Up Flash Overlay */}
      {powerUpFlash && (
        <div className={`powerup-flash ${powerUpFlash}`} key={powerUpFlash + Date.now()} />
      )}

      {/* Round Transition Overlay */}
      {showTransition && (
        <div className="round-transition-overlay">
          <div className="transition-scanline" />
          <div className="transition-content">
            <div className="transition-header">
              <span className="transition-glitch-text" data-text="ACQUIRING NEXT TARGET">ACQUIRING NEXT TARGET</span>
            </div>
            <div className="transition-intel">
              <div className="intel-bar">
                <span className="intel-label">TARGET</span>
                <span className="intel-value">{currentIndex + 2} / {questions.length}</span>
              </div>
              <div className="intel-bar">
                <span className="intel-label">SCORES</span>
                <span className="intel-value">{player1}: {scores[1]} — {player2}: {scores[2]}</span>
              </div>
              <div className="intel-bar">
                <span className="intel-label">ACTIVE PILOT</span>
                <span className="intel-value active-pilot">{currentUser === 1 ? player2 : player1}</span>
              </div>
            </div>
            <div className="transition-progress-bar">
              <div className="transition-progress-fill" />
            </div>
          </div>
        </div>
      )}

      {countdown > 0 && (
        <div className="countdown-overlay">
          <div className="countdown-number" key={countdown}>
            {countdown === 1 ? 'GO' : countdown - 1}
          </div>
        </div>
      )}

      <div className="arena-layout">
        {/* Left HUD */}
        <div className={`hud-peripheral left ${currentUser === 1 ? 'active' : ''}`}>
          <div className="calibration-step">NEURAL SIGNATURE: {player1}</div>
          <div className="hud-score-large">{scores[1]} <span style={{ fontSize: '10px', opacity: 0.5 }}>PTS</span></div>

          <div className="energy-cell-group">
            <div className="energy-label">NEURAL ENERGY <span>{formatTime(timers[1])}</span></div>
            <div className="energy-track">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`energy-segment ${timers[1] > (i * 6) ? 'filled' : ''}`}
                  style={{
                    backgroundColor: timers[1] <= 10 ? 'var(--red)' :
                      timers[1] <= 30 ? 'var(--gold)' : 'var(--cyan)'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="energy-cell-group">
            <div className="energy-label">UPLINK STABILITY <span>{timers[1] > 20 ? 'NOMINAL' : 'CRITICAL'}</span></div>
            <div className="energy-track">
              <div
                className="energy-segment filled"
                style={{
                  width: `${Math.min(100, (timers[1] / 120) * 100)}%`,
                  backgroundColor: timers[1] <= 20 ? 'var(--red)' : 'var(--cyan)',
                  boxShadow: `0 0 15px ${timers[1] <= 20 ? 'var(--red)' : 'var(--cyan)'}`
                }}
              />
            </div>
          </div>

          {/* Power-Ups Dock - Player 1 */}
          <div className="powerups-dock">
            <div className="powerups-label">TACTICAL SYSTEMS</div>
            <div className="powerups-grid">
              <button
                className={`powerup-btn timeWarp ${powerUps[1].timeWarp ? 'used' : ''}`}
                onClick={currentUser === 1 ? activateTimeWarp : undefined}
                disabled={powerUps[1].timeWarp || currentUser !== 1}
                title="Time Warp (+15s)"
              >
                <span className="powerup-icon">⏳</span>
                <span className="powerup-name">WARP</span>
                <span className="powerup-key">1</span>
              </button>
              <button
                className={`powerup-btn neuralHack ${powerUps[1].neuralHack ? 'used' : ''}`}
                onClick={currentUser === 1 ? activateNeuralHack : undefined}
                disabled={powerUps[1].neuralHack || currentUser !== 1}
                title="Neural Hack (Reveal Answer)"
              >
                <span className="powerup-icon">🧠</span>
                <span className="powerup-name">HACK</span>
                <span className="powerup-key">2</span>
              </button>
              <button
                className={`powerup-btn shield ${powerUps[1].shield ? 'used' : ''}`}
                onClick={currentUser === 1 ? activateShield : undefined}
                disabled={powerUps[1].shield || currentUser !== 1}
                title="Shield (Block Penalty)"
              >
                <span className="powerup-icon">🛡️</span>
                <span className="powerup-name">SHIELD</span>
                <span className="powerup-key">3</span>
              </button>
            </div>
          </div>
        </div>

        {/* Central Arena */}
        <div className="combat-node">
          <div className="combat-data-bar">
            <span>SECTOR: {quizMeta?.category?.toUpperCase()}</span>
            <span>TARGET: {currentIndex + 1} / {questions.length}</span>
            <span>OPS: ACTIVE</span>
          </div>

          <div className={`holo-viewport ${glitchActive ? 'glitch-active' : ''} ${shake === 'correct' ? 'pulse-correct' : shake === 'wrong' ? 'pulse-wrong' : ''}`}>
            <img src={imageUrl} alt="Target" className="question-img-premium" />

            <div className="target-aim-overlay"></div>
            <div className={`combo-display ${combo >= 3 ? 'show' : ''}`}>
              COMBO x{combo >= 5 ? '3' : '2'}
            </div>

            <div className="scanning-overlay"></div>
            <div className="scanning-line"></div>

            {/* Shield Active Indicator */}
            {shieldActive && (
              <div className="shield-active-indicator">
                <span>🛡️ SHIELD ACTIVE</span>
              </div>
            )}

            {/* Neural Hack Reveal */}
            {hackRevealed && (
              <div className="hack-reveal-overlay">
                <div className="hack-reveal-text">
                  <span className="hack-label">INTEL DECODED:</span>
                  <span className="hack-answer">{questions[currentIndex]?.answer}</span>
                </div>
              </div>
            )}

            {/* Corner Markers */}
            <div className="corner-detail tl"></div>
            <div className="corner-detail tr"></div>
            <div className="corner-detail bl"></div>
            <div className="corner-detail br"></div>

            {/* Result Overlay */}
            <div className={`feedback-container ${isAnswerShown ? 'show' : ''}`}>
              {answerResult && (
                <div className={`feedback-message ${answerResult.isCorrect ? 'correct-msg' : 'wrong-msg'}`}>
                  {answerResult.isCorrect ? 'VALIDATED' : 'ERR: ' + answerResult.text}
                </div>
              )}
            </div>

            {/* Pause Screen */}
            {isPaused && (
              <div className="paused-screen">
                <div className="paused-text">SYSTEM PAUSED</div>
                <button className="btn-primary-glitch" onClick={togglePause}>
                  <span className="btn-text">RESUME</span>
                  <span className="btn-glitch-effect"></span>
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="arena-actions-bar">
            <div className="hud-keyboard-hints">
              <div className="hint-item"><span className="key-cap">←</span> NO MATCH</div>
              <div className="hint-item"><span className="key-cap">→</span> IDENTIFIED</div>
              <div className="hint-item"><span className="key-cap">SPACE</span> PAUSE</div>
            </div>

            <div className="hud-utility-btns">
              <button className="btn-hud" onClick={togglePause}>{isPaused ? 'RESUME' : 'PAUSE'}</button>
              <button className="btn-hud" onClick={() => navigate('/categories')}>ABORT</button>
            </div>

            <div className="mobile-touch-controls">
              <button className="touch-btn reject" onClick={wrongAnswer}>
                <span className="btn-icon">✖</span>
                <span className="btn-label">REJECT</span>
              </button>
              <button className="touch-btn identify" onClick={correctAnswer}>
                <span className="btn-icon">✔</span>
                <span className="btn-label">IDENTIFY</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right HUD */}
        <div className={`hud-peripheral right ${currentUser === 2 ? 'active' : ''}`}>
          <div className="calibration-step">NEURAL SIGNATURE: {player2}</div>
          <div className="hud-score-large">{scores[2]} <span style={{ fontSize: '10px', opacity: 0.5 }}>PTS</span></div>

          <div className="energy-cell-group">
            <div className="energy-label">NEURAL ENERGY <span>{formatTime(timers[2])}</span></div>
            <div className="energy-track">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`energy-segment ${timers[2] > (i * 6) ? 'filled' : ''}`}
                  style={{
                    backgroundColor: timers[2] <= 10 ? 'var(--red)' :
                      timers[2] <= 30 ? 'var(--gold)' : 'var(--cyan)'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="energy-cell-group">
            <div className="energy-label">UPLINK STABILITY <span>{timers[2] > 20 ? 'NOMINAL' : 'CRITICAL'}</span></div>
            <div className="energy-track">
              <div
                className="energy-segment filled"
                style={{
                  width: `${Math.min(100, (timers[2] / 120) * 100)}%`,
                  backgroundColor: timers[2] <= 20 ? 'var(--red)' : 'var(--cyan)',
                  boxShadow: `0 0 15px ${timers[2] <= 20 ? 'var(--red)' : 'var(--cyan)'}`
                }}
              />
            </div>
          </div>

          {/* Power-Ups Dock - Player 2 */}
          <div className="powerups-dock">
            <div className="powerups-label">TACTICAL SYSTEMS</div>
            <div className="powerups-grid">
              <button
                className={`powerup-btn timeWarp ${powerUps[2].timeWarp ? 'used' : ''}`}
                onClick={currentUser === 2 ? activateTimeWarp : undefined}
                disabled={powerUps[2].timeWarp || currentUser !== 2}
                title="Time Warp (+15s)"
              >
                <span className="powerup-icon">⏳</span>
                <span className="powerup-name">WARP</span>
                <span className="powerup-key">1</span>
              </button>
              <button
                className={`powerup-btn neuralHack ${powerUps[2].neuralHack ? 'used' : ''}`}
                onClick={currentUser === 2 ? activateNeuralHack : undefined}
                disabled={powerUps[2].neuralHack || currentUser !== 2}
                title="Neural Hack (Reveal Answer)"
              >
                <span className="powerup-icon">🧠</span>
                <span className="powerup-name">HACK</span>
                <span className="powerup-key">2</span>
              </button>
              <button
                className={`powerup-btn shield ${powerUps[2].shield ? 'used' : ''}`}
                onClick={currentUser === 2 ? activateShield : undefined}
                disabled={powerUps[2].shield || currentUser !== 2}
                title="Shield (Block Penalty)"
              >
                <span className="powerup-icon">🛡️</span>
                <span className="powerup-name">SHIELD</span>
                <span className="powerup-key">3</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
