import { useCallback, useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';

const useSound = (src, options = {}) => {
  const { volume: localVolume = 1, loop = false } = options;
  const { globalVolume, isUnlocked } = useAudio();
  const audioRef = useRef(null);
  const wasBlockedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.preload = 'auto'; // Reduce lag by preloading

    // Set initial volume immediately
    audio.volume = globalVolume * localVolume;

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src, loop]);

  // Sync volume with global volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = globalVolume * localVolume;
    }
  }, [globalVolume, localVolume]);

  const play = useCallback(() => {
    if (!audioRef.current) return;

    // Reset and play
    audioRef.current.currentTime = 0;
    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.catch(err => {
        if (err.name === 'NotAllowedError') {
          console.warn(`[useSound] Playback blocked for ${src}. Will retry after unlock.`);
          wasBlockedRef.current = true;
        }
      });
    }
  }, [src]);

  // Retry playback once system is unlocked if it was previously blocked
  useEffect(() => {
    if (isUnlocked && wasBlockedRef.current && audioRef.current) {
      console.log(`[useSound] System unlocked, retrying blocked playback for ${src}`);
      wasBlockedRef.current = false;
      audioRef.current.play().catch(() => { });
    }
  }, [isUnlocked, src]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      wasBlockedRef.current = false;
    }
  }, []);

  return { play, stop };
};

export default useSound;
