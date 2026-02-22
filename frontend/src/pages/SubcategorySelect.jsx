import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Selection.css';

export default function SubcategorySelect() {
  const { categoryId: categorySlug } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/categories/${categorySlug}/subcategories`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error('Failed to load subcategories:', err));
  }, [categorySlug]);


  if (!data) {
    return (
      <div className="page-wrapper">
        <div className="glass-container" style={{ maxWidth: 400 }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="selection-revamp-container">
        <div className="mission-header">
          <h1 className="section-title">{data.categoryName} <span>SECTOR</span></h1>
          <p className="card-subtitle">SELECT MISSION MODULE FOR DEPLOYMENT</p>
        </div>

        <div className="category-grid" style={{ width: '100%' }}>
          {data.subcategories.map((sub, idx) => (
            <div
              key={sub.id}
              className="subcategory-card"
              style={{
                animationDelay: `${idx * 0.1}s`,
                opacity: sub.questionCount === 0 ? 0.35 : undefined,
                cursor: sub.questionCount === 0 ? 'not-allowed' : 'pointer',
              }}
              onClick={() => {
                if (sub.questionCount > 0) {
                  navigate(`/register/${sub.quizId}`);
                }
              }}
            >
              <div className="sector-status">
                {sub.questionCount > 0 ? 'LINK READY' : 'LINK OFFLINE'}
              </div>
              <div className="card-title">{sub.name}</div>
              <div className="q-count">
                {sub.questionCount > 0 ? `${sub.questionCount} INTELLIGENCE TARGETS` : 'ENCRYPTED'}
              </div>
            </div>
          ))}
        </div>

        <div className="button-row" style={{ marginTop: 40 }}>
          <button className="btn-back" onClick={() => navigate('/categories')}>
            ← BACK TO SECTORS
          </button>
        </div>
      </div>
    </div>
  );
}
