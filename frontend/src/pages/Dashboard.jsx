import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/dashboard-data')
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
      <div className="page-wrapper dashboard-wrapper">
        <div className="page-content" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <h2 className="title-glow">AUTHENTICATING...</h2>
          <div className="dot pulse" style={{ margin: '20px auto' }}></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentMatches, mvp, systemStatus, config } = data;

  return (
    <div className="page-wrapper dashboard-wrapper">
      <div className="page-content" style={{ maxWidth: 1100 }}>

        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="title-glow">{config.headerTitle} <span>{config.headerSubtitle}</span></h1>
            <p className="subtitle">{config.userGreeting}</p>
          </div>
          <div className="header-right">
            <button className="btn-primary-glitch" onClick={() => navigate('/categories')}>
              <span className="btn-text">BATTLE NOW</span>
              <span className="btn-glitch-effect"></span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid-premium">
          {stats.map((stat, idx) => (
            <div key={idx} className={`stat-card-premium ${stat.theme}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
              <div className="stat-progress">
                <div className="progress-fill" style={{ width: `${stat.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-layout-main">
          {/* Recent Operations */}
          <div className="glass-panel activity-panel">
            <div className="panel-header">
              <h2 className="panel-title">RECENT <span>OPERATIONS</span></h2>
              <button className="btn-text-only" onClick={() => navigate('/leaderboard')}>VIEW ALL</button>
            </div>

            <div className="recent-ops-list">
              {recentMatches.length === 0 ? (
                <div className="no-data" style={{ padding: '20px', opacity: 0.5 }}>NO RECENT OPERATIONS RECORDED</div>
              ) : (
                recentMatches.map((m, i) => (
                  <div key={i} className="op-item-premium">
                    <div className="op-status-marker"></div>
                    <div className="op-info">
                      <div className="op-players">
                        <span className={`p-name ${m.score >= m.opponentScore ? 'winner-glow' : ''}`}>{m.player}</span>
                        <span className="vs">VS</span>
                        <span className={`p-name ${m.opponentScore > m.score ? 'winner-glow' : ''}`}>{m.opponent}</span>
                      </div>
                      <div className="op-meta">{m.category} • {new Date(m.date).toLocaleDateString()}</div>
                    </div>
                    <div className="op-scores-box">
                      <div className="score-badge">{m.score}</div>
                      <div className="score-divider">:</div>
                      <div className="score-badge alt">{m.opponentScore}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Info / Hall of Fame */}
          <div className="side-panels">
            <div className="glass-panel hall-of-fame">
              <h3 className="panel-title-sm">LAST OPERATION <span>MVP</span></h3>
              {mvp ? (
                <div className="mvp-highlight">
                  <div className="mvp-avatar">
                    <span className="rank-medal">🥇</span>
                  </div>
                  <div className="mvp-name">{mvp.name}</div>
                  <div className="mvp-stats">{mvp.score} PTS • {mvp.category}</div>
                </div>
              ) : (
                <p style={{ opacity: 0.5, fontSize: '12px' }}>AWAITING NEXT HERO</p>
              )}
            </div>

            <div className="glass-panel system-status">
              <h3 className="panel-title-sm">SYSTEM <span>STATUS</span></h3>
              <div className="status-grid">
                {systemStatus.map((s, idx) => (
                  <div key={idx} className="status-item">
                    <span className={`${s.type} ${s.status}`}></span>
                    <span className="label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
