import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Selection.css';

const ITEMS_PER_PAGE = 6;

export default function CategorySelect() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="page-wrapper">
      <div className="selection-revamp-container">
        <div className="mission-header">
          <h1 className="section-title">MISSION <span>SELECT</span></h1>
          <p className="card-subtitle">CHOOSE YOUR SECTOR OF OPERATION</p>
        </div>

        <div className="search-uplink-wrapper">
          <span className="search-icon">📡</span>
          <input
            type="text"
            className="search-uplink"
            placeholder="SCANNING FOR SECTORS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-grid" style={{ minHeight: '340px', width: '100%' }}>
          {paginatedCategories.length > 0 ? (
            paginatedCategories.map((cat, idx) => (
              <div
                key={cat.slug}
                className="category-card"
                style={{ animationDelay: `${idx * 0.1}s` }}
                onClick={() => navigate(`/categories/${cat.slug}`)}
              >
                <div className="sector-status">SECTOR {cat.id.toString().padStart(2, '0')}: ACTIVE</div>
                <div className="card-title">{cat.name}</div>
                <div className="card-subtitle">{cat.subcategoryCount} Mission Modules Available</div>
              </div>
            ))
          ) : (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              NO CORRESPONDING SECTORS FOUND.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination-row">
            <button
              className="btn-tactical-nav"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              PREVIOUS
            </button>
            <div className="page-indicator">
              PAGE <span>{currentPage}</span> OF {totalPages}
            </div>
            <button
              className="btn-tactical-nav"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              NEXT
            </button>
          </div>
        )}

        <div className="button-row" style={{ marginTop: 40 }}>
          <button className="btn-back" onClick={() => navigate('/')}>
            ← ABORT MISSION
          </button>
        </div>
      </div>
    </div>
  );
}
