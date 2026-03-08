import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSound from '../hooks/useSound';
import './Selection.css';

export default function SubcategorySelect() {
  const { categoryId: categorySlug } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.4 });

  useEffect(() => {
    fetch(`/api/categories/${categorySlug}/subcategories`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error('Failed to load subcategories:', err));
  }, [categorySlug]);

  if (!data) {
    return (
      <div className="page-wrapper">
        <div className="sel-container">
          <div className="sel-empty">
            <div className="sel-loading-pulse" />
            <span>ESTABLISHING UPLINK...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="sel-container">
        <div className="sel-header">
          <div className="sel-badge">
            <span className="sel-badge-dot magenta-dot" />
            <span>SECTOR INTEL</span>
          </div>
          <h1 className="sel-title">{data.categoryName} <span>SECTOR</span></h1>
          <p className="sel-desc">SELECT MISSION MODULE FOR DEPLOYMENT</p>
        </div>

        <div className="sel-grid sub-grid">
          {data.subcategories.map((sub, idx) => {
            const isOffline = sub.questionCount === 0;
            return (
              <div
                key={sub.id}
                className={`sel-card sub-card ${isOffline ? 'offline' : 'theme-cyan'}`}
                style={{ animationDelay: `${idx * 0.08}s` }}
                onMouseEnter={!isOffline ? playHover : undefined}
                onClick={() => {
                  if (!isOffline) {
                    playClick();
                    navigate(`/register/${sub.quizId}`);
                  }
                }}
              >
                <div className="sel-card-accent" />
                <div className="sel-card-header">
                  <span className="sel-sector-id">MOD-{(idx + 1).toString().padStart(2, '0')}</span>
                  <span className={`sel-card-status ${isOffline ? 'status-offline' : ''}`}>
                    {isOffline ? '○ OFFLINE' : '● READY'}
                  </span>
                </div>
                <div className="sel-card-name">{sub.name}</div>
                <div className="sel-card-footer">
                  <span className="sel-card-meta">
                    {isOffline ? 'ENCRYPTED' : `${sub.questionCount} TARGETS`}
                  </span>
                  {!isOffline && <span className="sel-card-arrow">→</span>}
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="sel-back-btn"
          onMouseEnter={playHover}
          onClick={() => { playClick(); navigate('/categories'); }}
        >
          <span>←</span> BACK TO SECTORS
        </button>
      </div>
    </div>
  );
}
