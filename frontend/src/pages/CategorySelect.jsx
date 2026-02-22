import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CategorySelect() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <h1 className="section-title">Select <span>Category</span></h1>
        <div className="category-grid">
          {categories.map(cat => (
            <div
              key={cat.slug}
              className="category-card"
              onClick={() => navigate(`/categories/${cat.slug}`)}
            >
              <div>{cat.name}</div>
              <div className="card-subtitle">{cat.subcategoryCount} sets</div>
            </div>
          ))}
        </div>
        <div className="button-row" style={{ marginTop: 36 }}>
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
