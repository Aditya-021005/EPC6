import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
      <div className="page-content">
        <h1 className="section-title">{data.categoryName}</h1>
        <div className="subcategory-list">
          {data.subcategories.map(sub => (
            <div
              key={sub.id}
              className="subcategory-card"
              onClick={() => {
                if (sub.questionCount > 0) {
                  navigate(`/register/${sub.quizId}`);
                }
              }}
              style={{
                opacity: sub.questionCount === 0 ? 0.35 : undefined,
                cursor: sub.questionCount === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <div>{sub.name}</div>
              <div className="q-count">
                {sub.questionCount > 0 ? `${sub.questionCount} questions` : 'Coming soon'}
              </div>
            </div>
          ))}
        </div>
        <div className="button-row" style={{ marginTop: 28 }}>
          <button className="btn-back" onClick={() => navigate('/categories')}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
