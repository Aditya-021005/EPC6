import React, { useState, useEffect } from 'react';
import './HostDashboard.css';

export default function HostDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('hostAuth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [gameState, setGameState] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  // Poll global state
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchState = async () => {
      try {
        const res = await fetch('/api/remote/host');
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setGameState(data.state_data);
        setConnectionError(false);
      } catch (err) {
        console.error('Host sync error:', err);
        setConnectionError(true);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const sendCommand = async (cmd) => {
    try {
      await fetch('/api/remote/host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      // Optionally trigger an immediate fetch so UI feels responsive
    } catch (err) {
      console.error('Command dispatch error:', err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'EPC6-ADMIN') {
      setIsAuthenticated(true);
      sessionStorage.setItem('hostAuth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasswordInput('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="host-wrapper login-mode">
        <div className="host-login-box">
          <div className="host-brand" style={{ justifyContent: 'center', marginBottom: 20 }}>
            <span className="host-dot pulse"></span>
            <span>RESTRICTED ACCESS</span>
          </div>
          <form onSubmit={handleLogin} className="host-login-form">
            <p>ENTER OVERRIDE CLEARANCE CODE</p>
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
            {authError && <div className="host-auth-error">ACCESS DENIED</div>}
            <button type="submit" className="host-btn-login">AUTHENTICATE</button>
          </form>
        </div>
      </div>
    );
  }

  const isIdle = !gameState || !gameState.status || gameState.status === 'GAMEOVER';

  return (
    <div className="host-wrapper">
      <div className="host-header">
        <div className="host-brand">
          <span className="host-dot pulse"></span>
          <span>HOST UPLINK</span>
        </div>
        <div className={`host-status ${connectionError ? 'error' : 'ok'}`}>
          {connectionError ? 'OFFLINE' : 'CONNECTED'}
        </div>
      </div>

      {isIdle ? (
        <div className="host-idle-screen">
          <div className="idle-ring"></div>
          <h2>AWAITING MATCH DATA</h2>
          <p>The main screen is currently not running an active session.</p>
        </div>
      ) : (
        <div className="host-active-screen">
          <div className="host-stats-bar">
            <span>ROUND {gameState.round}</span>
            <span>TARGET {gameState.target} / {gameState.total_targets}</span>
          </div>

          <div className="host-players">
            <div className={`host-player ${gameState.current_user === 1 ? 'active' : ''}`}>
              <span className="p-name">{gameState.player1 || 'ID: 1'}</span>
              <span className="p-score">{gameState.scores?.[1] || 0}</span>
            </div>
            <div className="host-vs">VS</div>
            <div className={`host-player ${gameState.current_user === 2 ? 'active' : ''}`}>
              <span className="p-name">{gameState.player2 || 'ID: 2'}</span>
              <span className="p-score">{gameState.scores?.[2] || 0}</span>
            </div>
          </div>

          <div className="host-answer-box">
            <div className="answer-label">CURRENT TARGET INTEL</div>
            <div className="answer-value">
              {gameState.answer || '???'}
            </div>
            {gameState.image && (
              <img src={gameState.image} alt="Target" className="host-thumb" />
            )}
          </div>

          {gameState.is_paused && (
            <div className="host-paused-banner">
              SYSTEM PAUSED
            </div>
          )}

          <div className="host-controls">
            <button
              className="host-btn reject"
              onClick={() => sendCommand('WRONG')}
            >
              <span className="btn-icon">✖</span>
              NO MATCH
            </button>
            <button
              className="host-btn identify"
              onClick={() => sendCommand('CORRECT')}
            >
              <span className="btn-icon">✔</span>
              IDENTIFIED
            </button>
          </div>

          <div className="host-util-controls">
            <button
              className="host-btn-util"
              onClick={() => sendCommand('PAUSE')}
            >
              {gameState.is_paused ? '▶ RESUME' : '❚❚ PAUSE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
