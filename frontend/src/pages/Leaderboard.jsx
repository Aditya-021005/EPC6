import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load leaderboard:', err);
        setLoading(false);
      });
  }, []);

  const getRankClass = (index) => {
    if (index === 0) return 'top-rank-1';
    if (index === 1) return 'top-rank-2';
    if (index === 2) return 'top-rank-3';
    return '';
  };

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getResultClass = (result) => {
    if (result === 'win') return 'res-win';
    if (result === 'loss') return 'res-loss';
    return 'res-tie';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="page-wrapper">
      <div className="page-content" style={{ maxWidth: 900 }}>
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">HALL OF <span>FAME</span></h1>
          <div className="leaderboard-subtitle">NEURAL LINK GLOBAL STANDINGS</div>
        </div>

        {loading ? (
          <div className="glass-container" style={{ maxWidth: 400, margin: '20px auto' }}>
            <div className="loading-pulse">SYNCING DATA...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="glass-container" style={{ maxWidth: 460, margin: '20px auto' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              NO NEURAL LINKS ESTABLISHED YET.
            </p>
            <button className="btn-primary-glitch" onClick={() => navigate('/categories')}>
              INITIALIZE PROTOCOL
            </button>
          </div>
        ) : (
          <div className="leaderboard-container">
            <div className="leaderboard-table-scroll">
              <table className="lb-table">
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>PILOT IDENTITY</th>
                    <th>COMBAT SCORE</th>
                    <th>RESULT</th>
                    <th>SECTOR</th>
                    <th>TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => (
                    <tr key={entry.id} className="lb-row-item">
                      <td className={`rank-col ${getRankClass(i)}`}>
                        {getMedal(i)}
                      </td>
                      <td>
                        <div className="player-info">
                          <span className="player-name">{entry.player}</span>
                          <span className="player-opponent">vs {entry.opponent} ({entry.opponentScore})</span>
                        </div>
                      </td>
                      <td>
                        <span className="score-display">{entry.score}</span>
                      </td>
                      <td>
                        <span className={`res-badge ${getResultClass(entry.result)}`}>
                          {entry.result}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--magenta)', fontSize: '12px', fontWeight: 600 }}>
                          {entry.category?.toUpperCase() || 'CORE'}
                        </span>
                      </td>
                      <td className="lb-date">
                        {formatDate(entry.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="button-row" style={{ marginTop: 40 }}>
          <button className="btn-back" onClick={() => navigate('/')}>
            ← TERMINAL EXIT
          </button>
          <button className="btn-primary-glitch" onClick={() => navigate('/categories')} style={{ padding: '12px 32px' }}>
            RE-LINK
          </button>
        </div>
      </div>
    </div>
  );
}
