import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [globalVolume, setGlobalVolume] = useState(1.0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlockAudio = useCallback(() => {
    if (isUnlocked) return;

    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      
      // Use silent oscillator to definitively wake up the system
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      gainNode.gain.value = 0; // Silent
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(0);
      oscillator.stop(0.001);

      if (context.state === 'suspended') {
        context.resume();
      }

      setIsUnlocked(true);
      console.log('[AudioContext] Audio system force-unlocked via silent oscillator');
    } catch (e) {
      console.error('[AudioContext] Failed to unlock audio:', e);
    }
  }, [isUnlocked]);

  // Sync volume with localStorage & force reset if needed
  useEffect(() => {
    const savedVolume = localStorage.getItem('globalVolume');
    
    // Force reset to 1.0 if it's currently 0 or too low (since UI is gone)
    if (savedVolume !== null && parseFloat(savedVolume) > 0.4) {
      setGlobalVolume(parseFloat(savedVolume));
    } else {
      console.log('[AudioContext] Initializing/Resetting volume to 1.0 (Full Power)');
      setGlobalVolume(1.0);
      localStorage.setItem('globalVolume', '1.0');
    }
  }, []);

  // Global click listener to unlock audio on first interaction
  useEffect(() => {
    if (isUnlocked) return;

    const handleGlobalClick = () => {
      unlockAudio();
    };

    window.addEventListener('mousedown', handleGlobalClick, { once: true });
    window.addEventListener('touchstart', handleGlobalClick, { once: true });
    window.addEventListener('keydown', handleGlobalClick, { once: true });
    
    return () => {
      window.removeEventListener('mousedown', handleGlobalClick);
      window.removeEventListener('touchstart', handleGlobalClick);
      window.removeEventListener('keydown', handleGlobalClick);
    };
  }, [unlockAudio, isUnlocked]);

  const handleVolumeChange = (newVolume) => {
    setGlobalVolume(newVolume);
    localStorage.setItem('globalVolume', newVolume);
  };

  return (
    <AudioContext.Provider value={{
      globalVolume,
      setGlobalVolume: handleVolumeChange,
      isUnlocked,
      unlockAudio
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
