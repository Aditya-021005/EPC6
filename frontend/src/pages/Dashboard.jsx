import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSound from '../hooks/useSound';
import './Dashboard.css';

const STAT_THEMES = ['cyan', 'magenta', 'gold'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.4 });

  useEffect(() => {
    fetch('/api/dashboard-data', { cache: 'no-store' })
      .then(res => res.json())
      .then(dashboardData => {
        setData(dashboardData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch dashboard data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="dash-container">
          <div className="dash-header">
            <div className="dash-badge">
              <span className="dash-badge-dot" />
              <span>OPERATIONS CENTER</span>
            </div>
            <h1 className="dash-title">COMMAND <span>HUB</span></h1>
          </div>
          <div className="sel-empty">
            <div className="sel-loading-pulse" />
            <span>AUTHENTICATING...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentMatches, mvp, systemStatus, config } = data;

  return (
    <div className="page-wrapper">
      <div className="dash-container">

        {/* Header */}
        <div className="dash-header">
          <div className="dash-badge">
            <span className="dash-badge-dot" />
            <span>OPERATIONS CENTER</span>
          </div>
          <h1 className="dash-title">{config.headerTitle} <span>{config.headerSubtitle}</span></h1>
          <p className="dash-desc">{config.userGreeting}</p>
        </div>

        {/* Launch Button */}
        <button
          className="dash-launch-btn"
          onClick={() => { playClick(); navigate('/categories'); }}
          onMouseEnter={playHover}
        >
          <span className="dash-launch-icon">⚔</span>
          <span className="dash-launch-text">BATTLE NOW</span>
          <span className="dash-launch-arrow">→</span>
        </button>

        {/* Stats Grid */}
        <div className="dash-stats-grid">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`dash-stat-card theme-${STAT_THEMES[idx % STAT_THEMES.length]}`}
              style={{ animationDelay: `${idx * 0.08}s` }}
              onMouseEnter={playHover}
            >
              <div className="dash-stat-accent" />
              <div className="dash-stat-header">
                <span className="dash-stat-icon">{stat.icon}</span>
                <span className="dash-stat-id">STAT-{(idx + 1).toString().padStart(2, '0')}</span>
              </div>
              <div className="dash-stat-value">{stat.value}</div>
              <div className="dash-stat-label">{stat.label}</div>
              <div className="dash-stat-bar">
                <div className="dash-stat-fill" style={{ width: `${stat.progress}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid: Operations + Side */}
        <div className="dash-main-grid">

          {/* Recent Operations */}
          <div className="dash-panel dash-ops-panel">
            <div className="dash-panel-header">
              <div className="dash-panel-title-group">
                <span className="dash-panel-dot" />
                <h2 className="dash-panel-title">RECENT <span>OPERATIONS</span></h2>
              </div>
              <button
                className="dash-view-all"
                onClick={() => { playClick(); navigate('/leaderboard'); }}
                onMouseEnter={playHover}
              >
                VIEW ALL →
              </button>
            </div>

            <div className="dash-ops-list">
              {recentMatches.length === 0 ? (
                <div className="dash-ops-empty">
                  <span>NO RECENT OPERATIONS RECORDED</span>
                </div>
              ) : (
                recentMatches.map((m, i) => (
                  <div
                    key={i}
                    className="dash-op-item"
                    style={{ animationDelay: `${i * 0.06}s` }}
                    onMouseEnter={playHover}
                  >
                    <div className="dash-op-accent" />
                    <div className="dash-op-info">
                      <div className="dash-op-players">
                        <span className={m.score >= m.opponentScore ? 'dash-winner' : ''}>{m.player}</span>
                        <span className="dash-op-vs">VS</span>
                        <span className={m.opponentScore > m.score ? 'dash-winner' : ''}>{m.opponent}</span>
                      </div>
                      <div className="dash-op-meta">{m.category} • {new Date(m.date).toLocaleDateString()}</div>
                    </div>
                    <div className="dash-op-scores">
                      <span className="dash-score-primary">{m.score}</span>
                      <span className="dash-score-sep">:</span>
                      <span className="dash-score-secondary">{m.opponentScore}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Side Panels */}
          <div className="dash-side">

            {/* MVP Card */}
            <div className="dash-panel dash-mvp-panel">
              <div className="dash-panel-title-group">
                <span className="dash-panel-dot gold-dot" />
                <h3 className="dash-panel-title-sm">LAST OP <span>MVP</span></h3>
              </div>
              {mvp ? (
                <div className="dash-mvp-content">
                  <div className="dash-mvp-ring">
                    <span className="dash-mvp-medal">🥇</span>
                  </div>
                  <div className="dash-mvp-name">{mvp.name}</div>
                  <div className="dash-mvp-stats">{mvp.score} PTS • {mvp.category}</div>
                </div>
              ) : (
                <div className="dash-mvp-empty">AWAITING NEXT HERO</div>
              )}
            </div>

            {/* System Status */}
            <div className="dash-panel dash-status-panel">
              <div className="dash-panel-title-group">
                <span className="dash-panel-dot" />
                <h3 className="dash-panel-title-sm">SYSTEM <span>STATUS</span></h3>
              </div>
              <div className="dash-status-list">
                {systemStatus.map((s, idx) => (
                  <div key={idx} className="dash-status-item">
                    <span className={`dash-status-dot ${s.status}`} />
                    <span className="dash-status-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Back Button */}
        <button
          className="sel-back-btn"
          onMouseEnter={playHover}
          onClick={() => { playClick(); navigate('/'); }}
        >
          <span>←</span> RETURN TO BASE
        </button>

      </div>
    </div>
  );
}
