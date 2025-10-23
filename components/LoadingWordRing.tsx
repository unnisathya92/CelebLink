'use client';

import { useEffect, useState } from 'react';

const LOADING_WORDS = [
  'SherLOCKING',
  'Nostradamusing',
  'NeilGrassTysoning',
  'Analyzing',
  'Searching',
  'Connecting',
  'Discovering',
  'Processing',
  'Exploring',
  'Linking',
  'Matching',
  'Tracing',
  'Finding',
  'Scanning',
  'Detecting',
  'Mapping',
  'Correlating',
  'Investigating',
];

export default function LoadingWordRing() {
  const [currentWord, setCurrentWord] = useState(LOADING_WORDS[0]);
  const [displayedChars, setDisplayedChars] = useState<string[]>([]);

  useEffect(() => {
    // Change word every 2 seconds
    const wordInterval = setInterval(() => {
      const randomWord = LOADING_WORDS[Math.floor(Math.random() * LOADING_WORDS.length)];
      setCurrentWord(randomWord);
      setDisplayedChars([]);
    }, 2000);

    return () => clearInterval(wordInterval);
  }, []);

  useEffect(() => {
    // Animate letters appearing one by one
    if (displayedChars.length < currentWord.length) {
      const timeout = setTimeout(() => {
        setDisplayedChars([...displayedChars, currentWord[displayedChars.length]]);
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [currentWord, displayedChars]);

  const totalChars = currentWord.length;
  const radius = 50; // radius of the circle

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Rotating ring background */}
      <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-spin" style={{ animationDuration: '3s' }}></div>
      <div className="absolute inset-2 rounded-full border-2 border-accent/10 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>

      {/* Animated letters in a ring */}
      <div className="absolute inset-0">
        {displayedChars.map((char, index) => {
          const angle = (index / totalChars) * 2 * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <span
              key={`${currentWord}-${index}`}
              className="absolute text-accent font-bold text-lg animate-scale-in"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${(angle * 180) / Math.PI + 90}deg)`,
                opacity: 1 - (index / totalChars) * 0.5,
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Center pulsing dot */}
      <div className="w-3 h-3 rounded-full bg-accent animate-pulse shadow-glow"></div>
    </div>
  );
}
