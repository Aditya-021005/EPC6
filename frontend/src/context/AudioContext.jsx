import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [globalVolume, setGlobalVolume] = useState(0.8);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlockAudio = useCallback(() => {
    if (isUnlocked) return;

    // Create a dummy buffer to unlock audio on mobile/desktop browsers
    const context = new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') {
      context.resume();
    }

    setIsUnlocked(true);
    console.log('[AudioContext] Audio system unlocked via user gesture');
  }, [isUnlocked]);

  // Sync volume with localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('globalVolume');
    if (savedVolume !== null) {
      setGlobalVolume(parseFloat(savedVolume));
    }
  }, []);

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
