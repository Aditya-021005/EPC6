import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSound from '../hooks/useSound';
import './Selection.css';

const ITEMS_PER_PAGE = 6;

// Color themes for cards
const CARD_THEMES = ['cyan', 'magenta', 'gold', 'cyan', 'gold', 'magenta'];

export default function CategorySelect() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.4 });

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { setCategories(data); setLoading(false); })
      .catch(err => { console.error('Failed to load categories:', err); setLoading(false); });
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return (
    <div className="page-wrapper">
      <div className="sel-container">
        {/* Header */}
        <div className="sel-header">
          <div className="sel-badge">
            <span className="sel-badge-dot" />
            <span>TACTICAL DATABASE</span>
          </div>
          <h1 className="sel-title">MISSION <span>SELECT</span></h1>
          <p className="sel-desc">CHOOSE YOUR SECTOR OF OPERATION</p>
        </div>

        {/* Search */}
        <div className="sel-search-wrap">
          <div className="sel-search-icon">⌕</div>
          <input
            type="text"
            className="sel-search"
            placeholder="SCAN SECTORS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="sel-search-line" />
        </div>

        {/* Grid */}
        <div className="sel-grid">
          {loading ? (
            <div className="sel-empty">
              <div className="sel-loading-pulse" />
              <span>SCANNING DATABASE...</span>
            </div>
          ) : paginatedCategories.length > 0 ? (
            paginatedCategories.map((cat, idx) => (
              <div
                key={cat.slug}
                className={`sel-card theme-${CARD_THEMES[idx % CARD_THEMES.length]}`}
                style={{ animationDelay: `${idx * 0.08}s` }}
                onMouseEnter={playHover}
                onClick={() => { playClick(); navigate(`/categories/${cat.slug}`); }}
              >
                <div className="sel-card-accent" />
                <div className="sel-card-header">
                  <span className="sel-sector-id">SEC-{((currentPage - 1) * ITEMS_PER_PAGE + idx + 1).toString().padStart(2, '0')}</span>
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
              <span>NO SECTORS MATCH YOUR QUERY</span>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="sel-pagination">
            <button
              className="sel-page-btn"
              disabled={currentPage === 1}
              onMouseEnter={playHover}
              onClick={() => { playClick(); setCurrentPage(prev => prev - 1); }}
            >
              ← PREV
            </button>
            <div className="sel-page-info">
              <span className="sel-page-current">{currentPage}</span>
              <span className="sel-page-sep">/</span>
              <span>{totalPages}</span>
            </div>
            <button
              className="sel-page-btn"
              disabled={currentPage === totalPages}
              onMouseEnter={playHover}
              onClick={() => { playClick(); setCurrentPage(prev => prev + 1); }}
            >
              NEXT →
            </button>
          </div>
        )}

        {/* Back */}
        <button
          className="sel-back-btn"
          onMouseEnter={playHover}
          onClick={() => { playClick(); navigate('/'); }}
        >
          <span>←</span> ABORT MISSION
        </button>
      </div>
    </div>
  );
}
