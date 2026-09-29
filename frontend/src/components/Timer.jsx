import React, { useEffect, useState } from 'react';

const Timer = ({ duration, onTimeUp, onTick }) => {
  // duration is in minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (onTick) onTick(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp, onTick]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isWarning = timeLeft <= 120 && timeLeft > 60; // under 2 mins
  const isDanger = timeLeft <= 60; // under 1 min

  let textClass = 'text-white';
  let containerClass = '';

  if (isDanger) {
    textClass = 'text-red-400 font-bold';
    containerClass = 'timer-ring';
  } else if (isWarning) {
    textClass = 'text-yellow-300';
  }

  return (
    <div className={`flex items-center space-x-2 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm ${containerClass}`}>
      <span className="text-xl">⏱️</span>
      <span className={`font-mono text-xl tracking-wider ${textClass}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default Timer;
