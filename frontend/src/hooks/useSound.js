import { useCallback, useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';

const useSound = (src, options = {}) => {
  const { volume: localVolume = 1, loop = false } = options;
  const { globalVolume } = useAudio();
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
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
        // Silent catch for autoplay restrictions
        // Console logging is handled in AudioContext for initialization
      });
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, stop };
};

export default useSound;
