import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

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

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getResultBadge = (result) => {
    if (result === 'win') return <span className="badge badge-win">W</span>;
    if (result === 'loss') return <span className="badge badge-loss">L</span>;
    return <span className="badge badge-tie">T</span>;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-wrapper">
      <div className="page-content" style={{ maxWidth: 780 }}>
        <h1 className="section-title">🏆 <span>Leaderboard</span></h1>

        {loading ? (
          <div className="glass-container" style={{ maxWidth: 400, margin: '0 auto' }}>
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="glass-container" style={{ maxWidth: 460, margin: '0 auto' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              No games played yet. Be the first!
            </p>
            <button className="btn-primary" onClick={() => navigate('/categories')}>
              PLAY NOW
            </button>
          </div>
        ) : (
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th>vs</th>
                  <th>Category</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={entry.id} className={`lb-row ${i < 3 ? 'lb-top3' : ''}`}>
                    <td className="lb-rank">{getMedal(i)}</td>
                    <td className="lb-player">{entry.player}</td>
                    <td className="lb-score">{entry.score}</td>
                    <td>{getResultBadge(entry.result)}</td>
                    <td className="lb-opponent">
                      {entry.opponent} <span className="lb-oppscore">({entry.opponentScore})</span>
                    </td>
                    <td className="lb-category">{entry.category}</td>
                    <td className="lb-date">{formatDate(entry.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="button-row" style={{ marginTop: 32 }}>
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Home
          </button>
          <button className="btn-game" onClick={() => navigate('/categories')}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
