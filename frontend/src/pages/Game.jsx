import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GameArena.css';
import LoadingScreen from '../components/LoadingScreen';

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
  const [combo, setCombo] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);

  // Refs
  const intervalRef = useRef(null);
  const tickTockRef = useRef(null);
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
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
  });

  // Keep ref in sync
  useEffect(() => {
    stateRef.current = {
      currentUser, isPaused, isAnswerShown, gameOver,
      timers, scores, questions, currentIndex, combo
    };
  }, [currentUser, isPaused, isAnswerShown, gameOver, timers, scores, questions, currentIndex, combo]);

  // Initialize audio once
  useEffect(() => {
    tickTockRef.current = new Audio('/sounds/tick-tock-31883.mp3');
    tickTockRef.current.loop = true;
    correctSoundRef.current = new Audio('/sounds/correct.mp3');
    wrongSoundRef.current = new Audio('/sounds/wrong.mp3');

    // Occasional glitch disruption
    const glitchInterval = setInterval(() => {
      const s = stateRef.current;
      if (!s.isPaused && !s.gameOver && !s.isAnswerShown && Math.random() > 0.7) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 800);
      }
    }, 5000);

    return () => {
      tickTockRef.current?.pause();
      clearInterval(intervalRef.current);
      clearInterval(glitchInterval);
    };
  }, []);

  // Fetch questions
  useEffect(() => {
    console.log(`[SYS] Initiating fetch for QuizID: ${quizId}`);
    fetch(`/api/quiz/${quizId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log(`[SYS] Data received for ${quizId}:`, data);
        if (!data.questions || data.questions.length === 0) {
          console.error(`[SYS] No questions found for QuizID: ${quizId}`);
        }
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
        console.warn("[SYS] Loading hang detected. Forcing transition.");
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
          tickTockRef.current?.play().catch(() => { });
        }

        if (newTime <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          tickTockRef.current?.pause();
          if (tickTockRef.current) tickTockRef.current.currentTime = 0;
          setTimeout(() => setGameOver(true), 0);
          return { ...prev, [user]: 0 };
        }

        return { ...prev, [user]: newTime };
      });
    }, 1000);
  }, []);

  // Start game
  useEffect(() => {
    if (!loading && dataLoaded && questions.length > 0 && !gameStarted) {
      setGameStarted(true);
      startTimer();
    }
  }, [loading, dataLoaded, questions, gameStarted, startTimer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const switchUser = useCallback(() => {
    tickTockRef.current?.pause();
    if (tickTockRef.current) tickTockRef.current.currentTime = 0;
    setCurrentUser(prev => prev === 1 ? 2 : 1);
  }, []);

  const nextQuestion = useCallback(() => {
    const s = stateRef.current;
    if (s.currentIndex + 1 >= s.questions.length) {
      setGameOver(true);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setIsAnswerShown(false);
    setAnswerResult(null);
    startTimer();
  }, [startTimer]);

  const showAnswer = useCallback((isCorrect) => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsAnswerShown(true);

    const s = stateRef.current;
    const answer = s.questions[s.currentIndex]?.answer || 'Unknown';
    setAnswerResult({ text: answer, isCorrect });

    setTimeout(() => {
      switchUser();
      nextQuestion();
    }, 2000);
  }, [switchUser, nextQuestion]);

  const correctAnswer = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.gameOver) return;
    correctSoundRef.current?.play().catch(() => { });

    const newCombo = s.combo + 1;
    const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;

    setCombo(newCombo);
    setScores(prev => ({
      ...prev,
      [s.currentUser]: prev[s.currentUser] + (10 * multiplier)
    }));

    // Time Siphon: Restore 5s
    setTimers(prev => ({
      ...prev,
      [s.currentUser]: prev[s.currentUser] + 5
    }));

    showAnswer(true);
  }, [showAnswer]);

  const wrongAnswer = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.gameOver) return;
    wrongSoundRef.current?.play().catch(() => { });

    setCombo(0);
    setScores(prev => ({
      ...prev,
      [s.currentUser]: Math.max(0, prev[s.currentUser] - 5)
    }));
    setTimers(prev => ({
      ...prev,
      [s.currentUser]: Math.max(0, prev[s.currentUser] - 5)
    }));
    showAnswer(false);
  }, [showAnswer]);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.gameOver) return;
    setIsPaused(prev => {
      const newPaused = !prev;
      if (newPaused) {
        tickTockRef.current?.pause();
      } else if (s.timers[s.currentUser] <= 30) {
        tickTockRef.current?.play().catch(() => { });
      }
      return newPaused;
    });
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
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wrongAnswer, correctAnswer, togglePause]);

  if (loading || !dataLoaded) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
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

  // Handle Fetch Error or No Questions
  if (quizMeta?.error || questions.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="glass-panel" style={{ textAlign: 'center', maxWidth: 500 }}>
          <h2 style={{ color: quizMeta?.error ? 'var(--red)' : 'var(--cyan)' }}>
            {quizMeta?.error ? 'UPLINK FAILURE' : 'NO TARGETS FOUND'}
          </h2>
          <p className="card-subtitle" style={{ margin: '20px 0' }}>
            {quizMeta?.error ? quizMeta.message : 'THIS SECTOR APPEARS TO BE DEVOID OF INTELLIGENCE TARGETS.'}
          </p>
          <div className="button-row" style={{ flexDirection: 'column', gap: 10 }}>
            {quizMeta?.error && (
              <button className="btn-primary" onClick={() => window.location.reload()}>
                RETRY CONNECTION
              </button>
            )}
            <button className="btn-back" onClick={() => navigate('/categories')}>
              ABORT MISSION
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const imageUrl = `/images/${currentQuestion?.image}`;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="page-wrapper">
      <div className="arena-layout">

        {/* Left Wing: Player 1 Neural State */}
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

          <div className="energy-label" style={{ marginTop: 10 }}>UPLINK STABILITY <span>98.4%</span></div>
        </div>

        {/* Central Combat Node */}
        <div className="combat-node">
          <div className="combat-data-bar">
            <span>SECTOR: {quizMeta?.category?.toUpperCase()}</span>
            <span>TARGET: {currentIndex + 1} / {questions.length}</span>
            <span>OPS: ACTIVE</span>
          </div>

          <div className={`holo-viewport ${glitchActive ? 'glitch-active' : ''}`}>
            <img src={imageUrl} alt="Target" className="question-img-premium" />

            <div className="target-aim-overlay"></div>

            {/* Combo Multiplier */}
            <div className={`combo-display ${combo >= 3 ? 'show' : ''}`} style={{ top: '20px', right: '20px' }}>
              COMBO x{combo >= 5 ? '3' : '2'}
            </div>

            <div className="scanning-overlay"></div>
            <div className="scanning-line"></div>

            <div className="corner-detail tl"></div>
            <div className="corner-detail tr"></div>
            <div className="corner-detail bl"></div>
            <div className="corner-detail br"></div>

            {/* Answer Result Overlay */}
            <div className={`feedback-container ${isAnswerShown ? 'show' : ''}`}>
              {answerResult && (
                <div className={`feedback-message ${answerResult.isCorrect ? 'correct-msg' : 'wrong-msg'}`}>
                  {answerResult.isCorrect ? 'VALIDATED' : 'ERR: ' + answerResult.text}
                </div>
              )}
            </div>

            {/* Pause Overlay */}
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

          <div className="arena-actions-bar">
            {/* Desktop Keyboard Hints (Hidden on mobile via CSS) */}
            <div className="hud-keyboard-hints desktop-only">
              <div className="hint-item"><span className="key-cap">←</span> NO MATCH</div>
              <div className="hint-item"><span className="key-cap">→</span> IDENTIFIED</div>
              <div className="hint-item"><span className="key-cap">SPACE</span> PAUSE</div>
            </div>

            {/* Mobile Touch Controls (Visible only on mobile via CSS) */}
            <div className="mobile-touch-controls">
              <button className="btn-hud touch-btn reject" onClick={wrongAnswer}>
                <span className="btn-icon">✖</span>
                <span className="btn-label">REJECT</span>
              </button>
              <button className="btn-hud touch-btn identify" onClick={correctAnswer}>
                <span className="btn-icon">✔</span>
                <span className="btn-label">IDENTIFY</span>
              </button>
            </div>

            <div className="hud-utility-btns">
              <button className="btn-hud" onClick={togglePause}>{isPaused ? 'RESUME' : 'PAUSE'}</button>
              <button className="btn-hud" onClick={() => {
                clearInterval(intervalRef.current);
                tickTockRef.current?.pause();
                navigate('/categories');
              }}>ABORT</button>
            </div>
          </div>
        </div>

        {/* Right Wing: Player 2 Neural State */}
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

          <div className="energy-label" style={{ marginTop: 10 }}>UPLINK STABILITY <span>98.4%</span></div>
        </div>

      </div>
    </div>
  );
}
