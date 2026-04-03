import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GameArena.css';
import LoadingScreen from '../components/LoadingScreen';
import useSound from '../hooks/useSound';
import { useAudio } from '../context/AudioContext';

// Power-up economy config
const POWERUP_CONFIG = {
  timeWarp: { unlockAt: 80, cost: 80, icon: '⏳', name: 'WARP', key: '1', title: 'Time Warp (+15s)' },
  shield: { unlockAt: 100, cost: 150, icon: '🛡️', name: 'SHIELD', key: '2', title: 'Shield (Block All Penalties)' },
  sabotage: { unlockAt: 150, cost: 120, icon: '💣', name: 'SABOTAGE', key: '3', title: 'Sabotage (−30s Enemy)' },
};

export default function Game() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { unlockAudio, globalVolume } = useAudio();

  // Players
  const player1 = localStorage.getItem('player1') || 'Player 1';
  const player2 = localStorage.getItem('player2') || 'Player 2';

  // Multi-round context
  const roundCount = parseInt(localStorage.getItem('roundCount') || '3');
  const currentRound = parseInt(localStorage.getItem('currentRound') || '1');

  // Restore scores from previous rounds (persisted in localStorage)
  // Note: Timers reset each round — only scores carry over
  const savedScores = (() => { try { return JSON.parse(localStorage.getItem('scores')); } catch { return null; } })();

  // Game state
  const [questions, setQuestions] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roundOver, setRoundOver] = useState(false);
  const [quizMeta, setQuizMeta] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(1);
  const [timers, setTimers] = useState({ 1: 120, 2: 120 });
  const [scores, setScores] = useState(savedScores || { 1: 0, 2: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [combo, setCombo] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [shake, setShake] = useState(null);

  // Stats tracking
  const [correctCounts, setCorrectCounts] = useState({ 1: 0, 2: 0 });
  const [wrongCounts, setWrongCounts] = useState({ 1: 0, 2: 0 });
  const [maxCombo, setMaxCombo] = useState({ 1: 0, 2: 0 });
  const [streakMilestone, setStreakMilestone] = useState(null);

  // Power-ups are now reusable — no "used" tracking
  const [speedBonus, setSpeedBonus] = useState(null);
  const [shieldActive, setShieldActive] = useState(false);

  const [powerUpFlash, setPowerUpFlash] = useState(null);

  // Round transition state
  const [showTransition, setShowTransition] = useState(false);

  // Audio Hooks
  const { play: playCorrect } = useSound('/sounds/correct.mp3');
  const { play: playWrong } = useSound('/sounds/wrong.mp3');
  const { play: playTickTock, stop: stopTickTock } = useSound('/sounds/tick-tock-31883.mp3', { loop: true });
  const { play: playCountdown } = useSound('/sounds/countdown.mp3');
  const { play: playGo } = useSound('/sounds/go.mp3');
  const { play: playAmbient, stop: stopAmbient } = useSound('/sounds/ambient.mp3', { volume: 0.5, loop: true });

  // Refs
  const intervalRef = useRef(null);
  const questionStartTimeRef = useRef(Date.now());
  const stateRef = useRef({
    currentUser: 1,
    isPaused: false,
    isAnswerShown: false,
    roundOver: false,
    timers: { 1: 120, 2: 120 },
    scores: savedScores || { 1: 0, 2: 0 },
    questions: [],
    currentIndex: 0,
    combo: 0,
    correctCounts: { 1: 0, 2: 0 },
    wrongCounts: { 1: 0, 2: 0 },
    maxCombo: { 1: 0, 2: 0 },
    shieldActive: false,
  });

  // Keep ref in sync
  useEffect(() => {
    stateRef.current = {
      currentUser, isPaused, isAnswerShown, roundOver,
      timers, scores, questions, currentIndex, combo,
      shieldActive,
      correctCounts, wrongCounts, maxCombo,
    };
  }, [currentUser, isPaused, isAnswerShown, roundOver, timers, scores, questions, currentIndex, combo, shieldActive, correctCounts, wrongCounts, maxCombo]);

  // Initialize audio removal/cleanup
  useEffect(() => {
    // Occasional glitch disruption
    const glitchInterval = setInterval(() => {
      const s = stateRef.current;
      if (!s.isPaused && !s.roundOver && !s.isAnswerShown && Math.random() > 0.7) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 800);
      }
    }, 5000);

    return () => {
      stopTickTock();
      stopAmbient();
      clearInterval(intervalRef.current);
      clearInterval(glitchInterval);
    };
  }, [stopTickTock, stopAmbient]);

  // Fetch questions
  useEffect(() => {
    fetch(`/api/quiz/${quizId}`, { cache: 'no-store' })
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

  // Handle round end — persist state and navigate
  const roundHandledRef = useRef(false);
  useEffect(() => {
    if (!roundOver || roundHandledRef.current) return;
    roundHandledRef.current = true;
    stopAmbient();
    stopTickTock();
    clearInterval(intervalRef.current);

    const s = stateRef.current;
    const roundCategory = localStorage.getItem('roundCategory') || quizMeta?.category || '';
    const roundSubcategory = localStorage.getItem('roundSubcategory') || quizMeta?.subcategory || '';

    // Calculate who won this round (by score gained THIS round)
    const prevScores = savedScores || { 1: 0, 2: 0 };
    const roundScore1 = s.scores[1] - prevScores[1];
    const roundScore2 = s.scores[2] - prevScores[2];
    const roundWinner = roundScore1 >= roundScore2 ? 1 : 2;

    // Save cumulative scores (timers reset each round)
    localStorage.setItem('scores', JSON.stringify(s.scores));

    // Append round result
    const roundScores = JSON.parse(localStorage.getItem('roundScores') || '[]');
    roundScores.push({
      round: currentRound,
      category: roundCategory,
      subcategory: roundSubcategory,
      score1: roundScore1,
      score2: roundScore2,
      winner: roundWinner,
    });
    localStorage.setItem('roundScores', JSON.stringify(roundScores));

    if (currentRound < roundCount) {
      // More rounds: winner picks next category
      localStorage.setItem('currentRound', (currentRound + 1).toString());
      localStorage.setItem('roundPicker', roundWinner.toString());
      navigate('/round-select', { replace: true });
    } else {
      // Final round — save to leaderboard and go to GameOver
      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1,
          player2,
          score1: s.scores[1],
          score2: s.scores[2],
          category: roundCategory,
          subcategory: roundSubcategory,
          quizId,
        }),
      }).catch(err => console.error('Failed to save scores:', err));

      navigate('/gameover', {
        state: {
          player1,
          player2,
          scores: s.scores,
          correctCounts: s.correctCounts,
          wrongCounts: s.wrongCounts,
          maxCombo: s.maxCombo,
          timers: s.timers,
          totalQuestions: s.questions.length,
          category: roundCategory,
          subcategory: roundSubcategory,
          roundScores,
        },
        replace: true
      });
    }
  }, [roundOver]);

  // Start timer
  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      const s = stateRef.current;
      if (s.isPaused || s.isAnswerShown || s.roundOver) return;

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
          setTimeout(() => setRoundOver(true), 0);
          return { ...prev, [user]: 0 };
        }

        return { ...prev, [user]: newTime };
      });
    }, 1000);
  }, []);

  // Start game with Countdown (no briefing — handled by RoundSelect)
  useEffect(() => {
    if (!loading && dataLoaded && questions.length > 0 && !gameStarted && countdown === null) {
      setCountdown(4);
      const cdInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(cdInterval);
            setGameStarted(true);
            startTimer();
            playGo();
            playAmbient();
            return 0;
          }
          playCountdown();
          return prev - 1;
        });
      }, 1000);
    }
  }, [loading, dataLoaded, questions, gameStarted, startTimer, countdown, playAmbient, playCountdown, playGo]);

  // Host Intel: Secretly log the target answer to the developer console
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      console.log(
        `%c[HOST INTEL] Target ${currentIndex + 1} Answer: %c${questions[currentIndex].answer}`,
        'color: #00ffff; font-weight: bold; font-size: 14px;',
        'color: #ffffff; background: #222222; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 14px;'
      );
    }
  }, [currentIndex, questions]);

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
      setRoundOver(true);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setIsAnswerShown(false);
    setAnswerResult(null);

    questionStartTimeRef.current = Date.now();
    startTimer();
  }, [startTimer]);

  const showAnswer = useCallback((isCorrect) => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsAnswerShown(true);


    const s = stateRef.current;
    const answer = s.questions[s.currentIndex]?.answer || 'Unknown';
    setAnswerResult({ text: answer, isCorrect });

    // Show answer result for 2s, then cinematic transition for 1.5s
    setTimeout(() => {
      if (isCorrect) {
        switchUser();
      }
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
    if (s.isAnswerShown || s.roundOver || s.isPaused) return;
    
    // Proactive unlock on interaction
    unlockAudio();
    playCorrect();

    const newCombo = s.combo + 1;
    const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;

    setShake('correct');
    setTimeout(() => setShake(null), 600);
    setCombo(newCombo);

    // Track stats
    setCorrectCounts(prev => ({ ...prev, [s.currentUser]: prev[s.currentUser] + 1 }));
    setMaxCombo(prev => ({
      ...prev,
      [s.currentUser]: Math.max(prev[s.currentUser], newCombo)
    }));

    // Streak milestones
    if (newCombo === 3) {
      setStreakMilestone('🔥 ON FIRE!');
      setTimeout(() => setStreakMilestone(null), 1500);
    } else if (newCombo === 5) {
      setStreakMilestone('⚡ UNSTOPPABLE!');
      setTimeout(() => setStreakMilestone(null), 1500);
    } else if (newCombo === 7) {
      setStreakMilestone('💀 GODLIKE!');
      setTimeout(() => setStreakMilestone(null), 1500);
    }

    // Speed bonus: +5 if answered within 3 seconds
    const elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
    const speedPts = elapsed <= 3 ? 5 : 0;
    if (speedPts > 0) {
      setSpeedBonus('⚡ QUICK DRAW +5');
      setTimeout(() => setSpeedBonus(null), 1200);
    }

    setScores(prev => ({
      ...prev,
      [s.currentUser]: prev[s.currentUser] + (10 * multiplier) + speedPts
    }));

    setTimers(prev => ({
      ...prev,
      [s.currentUser]: prev[s.currentUser] + 5
    }));

    showAnswer(true);
  }, [showAnswer]);

  const wrongAnswer = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.roundOver || s.isPaused) return;
    
    // Proactive unlock on interaction
    unlockAudio();
    playWrong();

    setShake('wrong');
    setTimeout(() => setShake(null), 600);
    setCombo(0);

    // Track stats
    setWrongCounts(prev => ({ ...prev, [s.currentUser]: prev[s.currentUser] + 1 }));

    // Shield blocks the penalty (persists for the entire game)
    if (s.shieldActive) {
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
    if (s.isAnswerShown || s.roundOver) return;
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

  // Power-up helpers
  const canAfford = (player, powerUpKey) => {
    const cfg = POWERUP_CONFIG[powerUpKey];
    return scores[player] >= cfg.unlockAt && scores[player] >= cfg.cost;
  };

  const isUnlocked = (player, powerUpKey) => {
    return scores[player] >= POWERUP_CONFIG[powerUpKey].unlockAt;
  };

  // Power-up activation functions (reusable, cost points)
  const activateTimeWarp = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.roundOver || s.isPaused) return;
    const cfg = POWERUP_CONFIG.timeWarp;
    if (s.scores[s.currentUser] < cfg.unlockAt || s.scores[s.currentUser] < cfg.cost) return;
    setScores(prev => ({ ...prev, [s.currentUser]: prev[s.currentUser] - cfg.cost }));
    setTimers(prev => ({ ...prev, [s.currentUser]: prev[s.currentUser] + 15 }));
    setPowerUpFlash('timeWarp');
    setTimeout(() => setPowerUpFlash(null), 800);
  }, []);



  const activateShield = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.roundOver || s.isPaused) return;
    const cfg = POWERUP_CONFIG.shield;
    if (s.scores[s.currentUser] < cfg.unlockAt || s.scores[s.currentUser] < cfg.cost) return;
    setScores(prev => ({ ...prev, [s.currentUser]: prev[s.currentUser] - cfg.cost }));
    setShieldActive(true);
    setPowerUpFlash('shield');
    setTimeout(() => setPowerUpFlash(null), 800);
  }, []);

  const activateSabotage = useCallback(() => {
    const s = stateRef.current;
    if (s.isAnswerShown || s.roundOver || s.isPaused) return;
    const cfg = POWERUP_CONFIG.sabotage;
    if (s.scores[s.currentUser] < cfg.unlockAt || s.scores[s.currentUser] < cfg.cost) return;
    const opponent = s.currentUser === 1 ? 2 : 1;
    setScores(prev => ({ ...prev, [s.currentUser]: prev[s.currentUser] - cfg.cost }));
    setTimers(prev => ({ ...prev, [opponent]: Math.max(0, prev[opponent] - 30) }));
    setPowerUpFlash('sabotage');
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
      else if (e.key === '2') activateShield();
      else if (e.key === '3') activateSabotage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wrongAnswer, correctAnswer, togglePause, activateTimeWarp, activateShield, activateSabotage]);

  // (round-end navigation is handled by the roundOver useEffect above)

  // --- HOST REMOTE POLLING ---
  useEffect(() => {
    if (loading || !dataLoaded || roundOver) return;

    const currentQuestion = questions[currentIndex];
    const getImgUrl = (imgPath) => {
      if (!imgPath) return undefined;
      return imgPath.startsWith('http') || imgPath.startsWith('/media') ? imgPath : `/images/${imgPath}`;
    };
    const imageUrl = getImgUrl(currentQuestion?.image);
    const nextImageUrl = currentIndex + 1 < questions.length ? getImgUrl(questions[currentIndex + 1]?.image) : null;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      const s = stateRef.current;
      const payload = {
        state_data: {
          status: s.showTransition ? 'TRANSITION' : 'ACTIVE',
          round: s.currentRound,
          target: s.currentIndex + 1,
          total_targets: s.questions.length,
          scores: s.scores,
          player1: s.player1,
          player2: s.player2,
          current_user: s.currentUser,
          is_paused: s.isPaused,
          image: imageUrl,
          preload_image: nextImageUrl,
          answer: currentQuestion?.answer
        }
      };

      try {
        const res = await fetch('/api/remote/client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (isSubscribed && data.command) {
          console.log('[HOST COMMAND RECEIVED]:', data.command);
          if (data.command === 'CORRECT') correctAnswer();
          if (data.command === 'WRONG') wrongAnswer();
          if (data.command === 'PAUSE') togglePause();
        }
      } catch (e) {
        console.error('Remote sync error:', e);
      }
    }, 300);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [loading, dataLoaded, roundOver, questions, currentIndex, correctAnswer, wrongAnswer, togglePause]);

  useEffect(() => {
    // Gracefully wipe the remote session when the game unmounts (ABORT or Round End)
    return () => {
      fetch('/api/remote/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state_data: { status: 'GAMEOVER' } }),
        keepalive: true
      }).catch(e => console.error('Failed to clear session:', e));
    };
  }, []);

  if (loading || !dataLoaded) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  // Helper to render a power-up button for a given player
  const renderPowerUpBtn = (playerNum, key, activateFn) => {
    const cfg = POWERUP_CONFIG[key];
    const unlocked = isUnlocked(playerNum, key);
    const affordable = canAfford(playerNum, key);
    const isActive = currentUser === playerNum;
    return (
      <button
        key={key}
        className={`powerup-btn ${key} ${!unlocked ? 'locked' : ''} ${!affordable ? 'too-expensive' : ''}`}
        onClick={isActive && affordable ? activateFn : undefined}
        disabled={!isActive || !affordable}
        title={unlocked ? `${cfg.title} (Cost: ${cfg.cost} pts)` : `Unlocks at ${cfg.unlockAt} pts`}
      >
        <span className="powerup-icon">{unlocked ? cfg.icon : '🔒'}</span>
        <span className="powerup-name">{cfg.name}</span>
        <span className="powerup-cost">{unlocked ? `${cfg.cost}p` : `${cfg.unlockAt}p`}</span>
      </button>
    );
  };

  const currentQuestion = questions[currentIndex];
  const imagePath = currentQuestion?.image;
  const imageUrl = imagePath?.startsWith('http') || imagePath?.startsWith('/media')
    ? imagePath
    : `/images/${imagePath}`;

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
            <div className="energy-label">ENERGY <span className={`hud-timer-val ${timers[1] <= 10 ? 'critical' : timers[1] <= 30 ? 'warning' : ''}`}>{formatTime(timers[1])}</span></div>
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
            <div className="energy-label">STABILITY <span className={`hud-status-tag ${timers[1] <= 20 ? 'critical' : ''}`}>{timers[1] > 20 ? 'NOMINAL' : 'CRITICAL'}</span></div>
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
              {renderPowerUpBtn(1, 'timeWarp', activateTimeWarp)}
              {renderPowerUpBtn(1, 'shield', activateShield)}
              {renderPowerUpBtn(1, 'sabotage', activateSabotage)}
            </div>
          </div>
        </div>

        {/* Central Arena */}
        <div className="combat-node">
          <div className="combat-data-bar">
            <span>ROUND {currentRound}/{roundCount} — {quizMeta?.category?.toUpperCase()}</span>
            <div className="combat-data-center">
              <span>TARGET: {currentIndex + 1} / {questions.length}</span>
              <span className="audio-status-icon" title={`System Volume: ${Math.round(globalVolume * 100)}%`}>
                {globalVolume > 0 ? '🔊' : '🔇'}
              </span>
            </div>
            <span>OPS: ACTIVE</span>
          </div>

          <div className={`holo-viewport ${glitchActive ? 'glitch-active' : ''} ${shake === 'correct' ? 'pulse-correct' : shake === 'wrong' ? 'pulse-wrong' : ''}`}>
            <img src={imageUrl} alt="Target" className="question-img-premium" />

            <div className="target-aim-overlay"></div>
            <div className={`combo-display ${combo >= 3 ? 'show' : ''}`}>
              🔥 COMBO x{combo >= 5 ? '3' : '2'}
            </div>

            {/* Streak Milestone Banner */}
            {streakMilestone && (
              <div className="streak-milestone-banner" key={streakMilestone}>
                <span className="streak-milestone-text">{streakMilestone}</span>
              </div>
            )}

            {/* Speed Bonus Flash */}
            {speedBonus && (
              <div className="speed-bonus-flash" key={speedBonus + Date.now()}>
                <span className="speed-bonus-text">{speedBonus}</span>
              </div>
            )}

            <div className="scanning-overlay"></div>
            <div className="scanning-line"></div>

            {/* Shield Active Indicator */}
            {shieldActive && (
              <div className="shield-active-indicator">
                <span>🛡️ SHIELD ACTIVE</span>
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
              <button className="btn-hud" onClick={() => navigate('/')}>ABORT</button>
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
            <div className="energy-label">ENERGY <span className={`hud-timer-val ${timers[2] <= 10 ? 'critical' : timers[2] <= 30 ? 'warning' : ''}`}>{formatTime(timers[2])}</span></div>
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
            <div className="energy-label">STABILITY <span className={`hud-status-tag ${timers[2] <= 20 ? 'critical' : ''}`}>{timers[2] > 20 ? 'NOMINAL' : 'CRITICAL'}</span></div>
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
              {renderPowerUpBtn(2, 'timeWarp', activateTimeWarp)}
              {renderPowerUpBtn(2, 'shield', activateShield)}
              {renderPowerUpBtn(2, 'sabotage', activateSabotage)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
