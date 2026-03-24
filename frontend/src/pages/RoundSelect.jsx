import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSound from '../hooks/useSound';
import './Selection.css';
import './RoundSelect.css';

export default function RoundSelect() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.4 });

  // Read round state from localStorage
  const roundCount = parseInt(localStorage.getItem('roundCount') || '3');
  const currentRound = parseInt(localStorage.getItem('currentRound') || '1');
  const pickerId = parseInt(localStorage.getItem('roundPicker') || '1');
  const player1 = localStorage.getItem('player1') || 'Player 1';
  const player2 = localStorage.getItem('player2') || 'Player 2';
  const pickerName = pickerId === 1 ? player1 : player2;

  // Load categories
  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { setCategories(data); setLoading(false); })
      .catch(err => { console.error('Failed to load categories:', err); setLoading(false); });
  }, []);

  // Load subcategories when a category is selected
  useEffect(() => {
    if (!selectedCategory) return;
    setSubcategories(null);
    fetch(`/api/categories/${selectedCategory.slug}/subcategories`, { cache: 'no-store' })
      .then(res => res.json())
      .then(d => setSubcategories(d))
      .catch(err => console.error('Failed to load subcategories:', err));
  }, [selectedCategory]);

  const handleCategoryClick = (cat) => {
    playClick();
    setSelectedCategory(cat);
  };

  const handleSubcategoryClick = (sub) => {
    if (sub.questionCount === 0) return;
    playClick();

    // Store round category info for game-over breakdown
    const roundScores = JSON.parse(localStorage.getItem('roundScores') || '[]');
    // We'll store the category name when the round ends in Game.jsx
    localStorage.setItem('roundCategory', selectedCategory.name);
    localStorage.setItem('roundSubcategory', sub.name);

    setFadeOut(true);
    setTimeout(() => navigate(`/game/${sub.quizId}`), 500);
  };

  const CARD_THEMES = ['cyan', 'magenta', 'gold', 'cyan', 'gold', 'magenta'];

  return (
    <div className="page-wrapper">
      <div className={`rs-container ${fadeOut ? 'rs-fade-out' : ''}`}>
        {/* Round Badge */}
        <div className="rs-round-badge">
          <div className="rs-round-indicator">
            {Array.from({ length: roundCount }).map((_, i) => (
              <div
                key={i}
                className={`rs-round-dot ${i + 1 < currentRound ? 'completed' : ''} ${i + 1 === currentRound ? 'current' : ''}`}
              />
            ))}
          </div>
          <div className="rs-round-text">
            ROUND <span className="rs-round-num">{currentRound}</span> OF <span>{roundCount}</span>
          </div>
        </div>

        {/* Picker Info */}
        <div className="rs-picker-info">
          <div className={`rs-picker-avatar ${pickerId === 1 ? 'cyan-glow' : 'magenta-glow'}`}>
            {pickerName[0].toUpperCase()}
          </div>
          <div className="rs-picker-text">
            <span className={`rs-picker-name ${pickerId === 1 ? 'cyan-text' : 'magenta-text'}`}>{pickerName}</span>
            <span className="rs-picker-action">
              {currentRound === 1 ? 'SELECTS THE OPENING SECTOR' : 'WON LAST ROUND — SELECTS NEXT SECTOR'}
            </span>
          </div>
        </div>

        {/* Step 1: Category Selection */}
        {!selectedCategory ? (
          <>
            <h2 className="rs-step-title">SELECT <span>SECTOR</span></h2>
            <div className="sel-grid rs-grid">
              {loading ? (
                <div className="sel-empty">
                  <div className="sel-loading-pulse" />
                  <span>SCANNING DATABASE...</span>
                </div>
              ) : categories.length > 0 ? (
                categories.map((cat, idx) => (
                  <div
                    key={cat.slug}
                    className={`sel-card theme-${CARD_THEMES[idx % CARD_THEMES.length]}`}
                    style={{ animationDelay: `${idx * 0.06}s` }}
                    onMouseEnter={playHover}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <div className="sel-card-accent" />
                    <div className="sel-card-header">
                      <span className="sel-sector-id">SEC-{(idx + 1).toString().padStart(2, '0')}</span>
                      <span className="sel-card-status">● ACTIVE</span>
                    </div>
                    <div className="sel-card-name">{cat.name}</div>
                    <div className="sel-card-footer">
                      <span className="sel-card-meta">{cat.subcategoryCount || '—'} MODULES</span>
                      <span className="sel-card-arrow">→</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sel-empty">
                  <span>NO SECTORS AVAILABLE</span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Step 2: Subcategory Selection */
          <>
            <div className="rs-breadcrumb">
              <button className="rs-back-step" onClick={() => { playClick(); setSelectedCategory(null); }}>
                ← BACK TO SECTORS
              </button>
              <span className="rs-crumb-sep">/</span>
              <span className="rs-crumb-current">{selectedCategory.name}</span>
            </div>
            <h2 className="rs-step-title">SELECT <span>MODULE</span></h2>
            <div className="sel-grid sub-grid rs-grid">
              {!subcategories ? (
                <div className="sel-empty">
                  <div className="sel-loading-pulse" />
                  <span>LOADING MODULES...</span>
                </div>
              ) : subcategories.subcategories.length > 0 ? (
                subcategories.subcategories.map((sub, idx) => {
                  const isOffline = sub.questionCount === 0;
                  return (
                    <div
                      key={sub.id}
                      className={`sel-card sub-card ${isOffline ? 'offline' : 'theme-cyan'}`}
                      style={{ animationDelay: `${idx * 0.06}s` }}
                      onMouseEnter={!isOffline ? playHover : undefined}
                      onClick={() => handleSubcategoryClick(sub)}
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
                })
              ) : (
                <div className="sel-empty">
                  <span>NO MODULES AVAILABLE</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
