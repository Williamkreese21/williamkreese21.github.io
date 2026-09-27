import React, { useEffect, useState } from 'react';

const hackerLines = [
  "Checking authority...",
  "Initializing system...",
  "Optimizing system...",
  "Checking data...",
  "Accessing data...",
  "Synchronizing data...",
  "Loading data...",
  "Waiting..."
];

export function HackerLoader({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<{text: string, status: 'loading'|'ok'|'done'}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinner, setSpinner] = useState(0);
  const spinners = ['|', '/', '-', '\\'];

  // Terminal Spinner Effect
  useEffect(() => {
    const intId = setInterval(() => {
      setSpinner(s => (s + 1) % 4);
    }, 100);
    return () => clearInterval(intId);
  }, []);

  // Sequence Progression
  useEffect(() => {
    if (currentIndex < hackerLines.length) {
      setLines(prev => [...prev, { text: hackerLines[currentIndex], status: 'loading' }]);
      
      const timer = setTimeout(() => {
        setLines(prev => {
          const newLines = [...prev];
          newLines[newLines.length - 1].status = 'ok';
          return newLines;
        });
        setCurrentIndex(prev => prev + 1);
      }, Math.floor(Math.random() * 300) + 200); // Random loading time between 200-500ms
      
      return () => clearTimeout(timer);
    } else if (currentIndex === hackerLines.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, { text: "Complete.", status: 'done' }]);
        setTimeout(onComplete, 600); // Hold final screen for a moment before fading
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, onComplete]);

  return (
    <div className="w-full h-full p-8 md:p-16 font-mono text-[11px] md:text-[13px] leading-none text-brand flex flex-col justify-center items-center tracking-[0.25em] uppercase">
      <div className="flex flex-col gap-1.5 w-fit text-left origin-center">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span>{line.text}</span>
            {line.status === 'ok' && <span className="text-white ml-2">ok</span>}
            {line.status === 'loading' && <span className="ml-2">{spinners[spinner]}</span>}
          </div>
        ))}
        {/* Blinking CLI Cursor */}
        <div className="mt-2 w-3 h-5 bg-brand animate-[pulse_1s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
