import { useState, useEffect } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15 + 3;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setHide(true);
            setTimeout(() => onComplete?.(), 600);
          }, 300);
          return 100;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`loading-screen ${hide ? 'hide' : ''}`}>
      <div className="loader-circle">
        <div className="loader-progress" style={{ height: `${progress}%` }} />
        <span className="loader-text">{Math.round(progress)}%</span>
      </div>
      <div className="loader-label">Loading Quiz</div>
    </div>
  );
}
