import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSound from '../hooks/useSound';
import './Leaderboard.css';

const INITIAL_SHOW = 5;
const LOAD_MORE = 5;

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_SHOW);
  const navigate = useNavigate();

  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.4 });

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

  const getResultClass = (result) => {
    if (result === 'win') return 'lb-res-win';
    if (result === 'loss') return 'lb-res-loss';
    return 'lb-res-tie';
  };

  const getTheme = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'cyan';
    if (index === 2) return 'magenta';
    return '';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const visibleEntries = entries.slice(0, visibleCount);
  const hasMore = visibleCount < entries.length;
  const remaining = entries.length - visibleCount;

  return (
    <div className="page-wrapper">
      <div className="lb-container">

        {/* Header */}
        <div className="lb-header">
          <div className="lb-badge">
            <span className="lb-badge-dot" />
            <span>GLOBAL STANDINGS</span>
          </div>
          <h1 className="lb-title">HALL OF <span>FAME</span></h1>
          <p className="lb-desc">NEURAL LINK COMBAT RECORDS</p>
          {entries.length > 0 && (
            <div className="lb-count">{entries.length} RECORDS FOUND</div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="sel-empty">
            <div className="sel-loading-pulse" />
            <span>SYNCING DATA...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="lb-empty-state">
            <div className="lb-empty-icon">📡</div>
            <p className="lb-empty-text">NO NEURAL LINKS ESTABLISHED YET</p>
            <button
              className="lb-action-btn lb-primary"
              onClick={() => { playClick(); navigate('/categories'); }}
              onMouseEnter={playHover}
            >
              <span>⚔</span> INITIALIZE PROTOCOL
            </button>
          </div>
        ) : (
          <>
            <div className="lb-list">
              {visibleEntries.map((entry, i) => (
                <div
                  key={entry.id}
                  className={`lb-entry ${getTheme(i) ? `lb-top lb-theme-${getTheme(i)}` : ''}`}
                  style={{ animationDelay: `${(i < INITIAL_SHOW ? i : (i - visibleCount + LOAD_MORE)) * 0.06}s` }}
                  onMouseEnter={playHover}
                >
                  <div className="lb-entry-accent" />

                  <div className="lb-rank-cell">
                    <span className={`lb-rank-num ${i < 3 ? 'lb-top-rank' : ''}`}>{getMedal(i)}</span>
                  </div>

                  <div className="lb-entry-main">
                    <div className="lb-entry-top-row">
                      <span className="lb-player-name">{entry.player}</span>
                      <span className={`lb-result-badge ${getResultClass(entry.result)}`}>
                        {entry.result?.toUpperCase()}
                      </span>
                    </div>
                    <div className="lb-entry-bottom-row">
                      <span className="lb-opponent">vs {entry.opponent} ({entry.opponentScore})</span>
                      <span className="lb-meta-sep">•</span>
                      <span className="lb-sector">{entry.category?.toUpperCase() || 'CORE'}</span>
                      <span className="lb-meta-sep">•</span>
                      <span className="lb-date-text">{formatDate(entry.date)}</span>
                    </div>
                  </div>

                  <div className="lb-score-cell">
                    <span className="lb-score-value">{entry.score}</span>
                    <span className="lb-score-label">PTS</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <button
                className="lb-load-more"
                onClick={() => { playClick(); setVisibleCount(prev => prev + LOAD_MORE); }}
                onMouseEnter={playHover}
              >
                <span className="lb-load-icon">↓</span>
                <span>DECRYPT {remaining > LOAD_MORE ? LOAD_MORE : remaining} MORE RECORDS</span>
                <span className="lb-load-count">{remaining} remaining</span>
              </button>
            )}

            {!hasMore && entries.length > INITIAL_SHOW && (
              <div className="lb-end-marker">
                <span className="lb-end-line" />
                <span className="lb-end-text">ALL RECORDS DECRYPTED</span>
                <span className="lb-end-line" />
              </div>
            )}
          </>
        )}

        {/* Bottom Buttons */}
        <div className="lb-bottom-actions">
          <button
            className="sel-back-btn"
            onMouseEnter={playHover}
            onClick={() => { playClick(); navigate('/'); }}
          >
            <span>←</span> RETURN TO BASE
          </button>
          <button
            className="lb-action-btn lb-primary"
            onMouseEnter={playHover}
            onClick={() => { playClick(); navigate('/categories'); }}
          >
            <span>⚔</span> RE-LINK
          </button>
        </div>

      </div>
    </div>
  );
}
