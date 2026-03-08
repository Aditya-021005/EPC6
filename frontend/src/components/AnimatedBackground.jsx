import { useEffect, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import useSound from '../hooks/useSound';
import './AnimatedBackground.css';
import './VolumeHUD.css';

export default function AnimatedBackground() {
  const { globalVolume, setGlobalVolume, isUnlocked, unlockAudio } = useAudio();
  const { play: playAmbient, stop: stopAmbient } = useSound('/sounds/ambient.mp3', { volume: 0.5, loop: true });

  useEffect(() => {
    if (globalVolume > 0) {
      playAmbient();
    } else {
      stopAmbient();
    }
  }, [globalVolume, playAmbient, stopAmbient]);

  useEffect(() => {
    const createParticle = () => {
      const isHex = Math.random() > 0.7;
      const particle = document.createElement('div');

      if (isHex) {
        const hexCodes = ['0', '1', 'A', 'B', 'F', 'X', '7', '01', '10', 'NULL', 'ROOT'];
        particle.className = 'particle-hex';
        particle.innerText = hexCodes[Math.floor(Math.random() * hexCodes.length)];
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = '-20px';
        particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
      } else {
        particle.className = 'particle-premium particle-glitch';
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.bottom = '-20px';
        particle.style.animationDuration = `${Math.random() * 3 + 2}s`;
      }

      const container = document.getElementById('bg-particles');
      if (container) {
        container.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove());
      }
    };

    const createStreak = () => {
      const streak = document.createElement('div');
      streak.className = 'streak-premium';
      streak.style.left = `${Math.random() * 100}vw`;
      streak.style.top = `${Math.random() * -30}vh`;
      streak.style.animationDuration = `${Math.random() * 1.5 + 1}s`;
      document.getElementById('bg-particles')?.appendChild(streak);
      streak.addEventListener('animationend', () => streak.remove());
    };

    // Higher frequency for more dynamic feel
    const particleInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) createParticle();
    }, 1500);

    const streakInterval = setInterval(() => {
      for (let i = 0; i < 2; i++) createStreak();
    }, 3000);

    // Initial batch
    for (let i = 0; i < 15; i++) {
      setTimeout(createParticle, Math.random() * 2000);
    }

    return () => {
      clearInterval(particleInterval);
      clearInterval(streakInterval);
    };
  }, []);

  return (
    <>
      <div className="bg-container">
        {/* 3D Moving grid */}
        <div className="cyber-grid-perspective">
          <div className="cyber-grid" />
        </div>

        {/* Dynamic ambient neon lights */}
        <div className="glow-node glow-cyan" />
        <div className="glow-node glow-magenta" />

        {/* Particle & Streak layer */}
        <div id="bg-particles" style={{ position: 'absolute', inset: 0 }} />

        {/* Digital Overlays */}
        <div className="scanlines" />
        <div className="noise" />
        <div className="vignette" />
      </div>

      {/* Sleek Volume Node */}
      <div className="volume-node-container">
        <div className="volume-slider-track">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={globalVolume}
            onChange={(e) => setGlobalVolume(parseFloat(e.target.value))}
            className="volume-slider-input"
          />
        </div>
        <button className="volume-icon-btn" title="AUDIO SETTINGS">
          <div className="volume-wave-bars">
            <div className={`bar ${globalVolume > 0 ? 'active' : ''}`} style={{ height: '40%', animationDelay: '0.1s' }}></div>
            <div className={`bar ${globalVolume > 0.3 ? 'active' : ''}`} style={{ height: '70%', animationDelay: '0.2s' }}></div>
            <div className={`bar ${globalVolume > 0.7 ? 'active' : ''}`} style={{ height: '100%', animationDelay: '0.3s' }}></div>
          </div>
        </button>
      </div>
    </>
  );
}
