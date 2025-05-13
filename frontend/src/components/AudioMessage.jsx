
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioMessage = ({ audioData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const progressTimerRef = useRef(null);
  const waveformRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    const handleMetadataLoaded = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      clearInterval(progressTimerRef.current);
    };

    audio.addEventListener('loadedmetadata', handleMetadataLoaded);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
      audio.removeEventListener('ended', handleEnded);
      clearInterval(progressTimerRef.current);
    };
  }, []);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      clearInterval(progressTimerRef.current);
      setIsPlaying(false);
    } else {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });

      setIsPlaying(true);

      // Update progress every 50ms for smoother animation
      progressTimerRef.current = setInterval(() => {
        setCurrentTime(audio.currentTime);
      }, 50);
    }
  };

  // Generate random heights for waveform bars
  const generateWaveform = () => {
    const bars = [];
    const barCount = 27; // Total number of bars in the waveform
    
    for (let i = 0; i < barCount; i++) {
      // Varying heights for the middle section to create a waveform look
      let height;
      
      if (i < 3 || i > barCount - 4) {
        height = 3 + Math.floor(Math.random() * 2); // Shorter at edges
      } else if (i < 6 || i > barCount - 7) {
        height = 5 + Math.floor(Math.random() * 3); // Medium at near edges
      } else {
        height = 7 + Math.floor(Math.random() * 9); // Taller in middle
      }
      
      bars.push(height);
    }
    
    return bars;
  };
  
  // Create waveform array on component mount
  const waveformBars = useRef(generateWaveform()).current;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const activeBarCount = Math.floor((waveformBars.length * progressPercentage) / 100);

  return (
    <div className="flex items-center space-x-3 w-full max-w-md bg-green-50 rounded-md px-2 py-3">
      <audio ref={audioRef} src={audioData} className="hidden" />

      <button
        onClick={togglePlayback}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-green-600 rounded-full text-white"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col">
        <div 
          ref={waveformRef} 
          className="flex items-center justify-between h-8 mb-1 cursor-pointer"
          onClick={(e) => {
            if (audioRef.current && waveformRef.current) {
              const rect = waveformRef.current.getBoundingClientRect();
              const clickPosition = (e.clientX - rect.left) / rect.width;
              const newTime = duration * clickPosition;
              audioRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
          }}
        >
          {waveformBars.map((height, index) => (
            <div 
              key={index}
              className={`w-1 rounded-full ${
                index < activeBarCount ? 'bg-green-600' : 'bg-gray-300'
              }`}
              style={{ height: `${height}px` }}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-green-700 font-medium">{formatTime(currentTime)}</span>
          {isPlaying ? (
            <span className="text-gray-500">
              <span className="relative w-2 h-2 inline-block mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
              </span>
              PLAYING
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;