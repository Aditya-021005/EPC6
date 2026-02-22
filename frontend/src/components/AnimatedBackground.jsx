import { useEffect } from 'react';

export default function AnimatedBackground() {
  useEffect(() => {
    const createParticle = () => {
      const type = Math.random() > 0.5 ? 'glitch' : 'binary';
      const particle = document.createElement('div');

      if (type === 'glitch') {
        particle.className = 'particle-premium particle-glitch';
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.bottom = '0';
        particle.style.animationDuration = `${Math.random() * 4 + 3}s`;
      } else {
        particle.className = 'particle-premium particle-binary';
        particle.innerText = Math.random() > 0.5 ? '0' : '1';
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.bottom = '0';
        particle.style.animationDuration = `${Math.random() * 6 + 4}s`;
      }

      document.getElementById('bg-particles')?.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove());
    };

    const createStreak = () => {
      const streak = document.createElement('div');
      streak.className = 'streak-premium';
      streak.style.left = `${Math.random() * 100}vw`;
      streak.style.top = `${Math.random() * -20}vh`;
      streak.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
      document.getElementById('bg-particles')?.appendChild(streak);
      streak.addEventListener('animationend', () => streak.remove());
    };

    // Create particles
    const particleInterval = setInterval(() => {
      for (let i = 0; i < 2; i++) createParticle();
    }, 2000);

    // Create streaks
    const streakInterval = setInterval(() => {
      createStreak();
    }, 4000);

    // Initial batch
    for (let i = 0; i < 10; i++) {
      setTimeout(createParticle, Math.random() * 3000);
    }

    return () => {
      clearInterval(particleInterval);
      clearInterval(streakInterval);
    };
  }, []);

  return (
    <div className="bg-container">
      {/* 3D Moving grid */}
      <div className="cyber-grid-perspective">
        <div className="cyber-grid" />
      </div>

      {/* Dynamic ambient lights */}
      <div className="glow-node glow-cyan" />
      <div className="glow-node glow-magenta" />

      {/* Particle & Streak layer */}
      <div id="bg-particles" style={{ position: 'absolute', inset: 0 }} />

      {/* CRT Overlay Effects */}
      <div className="scanlines" />
      <div className="noise" />
    </div>
  );
}
