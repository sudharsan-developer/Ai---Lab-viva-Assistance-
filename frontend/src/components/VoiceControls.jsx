import React, { useState, useEffect } from 'react';

const VoiceControls = ({ questionText, options, questionNumber }) => {
  const [isSupported, setIsSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }
    
    // Cleanup on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-read when question changes
  useEffect(() => {
    if (isSupported && questionText) {
      handleStop();
      setTimeout(() => {
        handlePlay();
      }, 500); // small delay for UI transition
    }
  }, [questionNumber, questionText, isSupported]); // auto-read on question change

  const buildSpeechText = () => {
    let text = `Question ${questionNumber}. ${questionText}. `;
    if (options && options.length > 0) {
      const labels = ['A', 'B', 'C', 'D'];
      options.forEach((opt, idx) => {
        text += `Option ${labels[idx]}: ${opt}. `;
      });
    }
    return text;
  };

  const handlePlay = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    
    const text = buildSpeechText();
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleReplay = () => {
    handleStop();
    setTimeout(handlePlay, 100);
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-orange-500 bg-orange-50 px-3 py-2 rounded">
        Voice synthesis is not supported in this browser.
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-blue-50/50 p-2 rounded-full border border-blue-100 shadow-sm w-fit mx-auto mt-6">
      {!isPlaying ? (
        <button 
          onClick={handlePlay}
          className="flex items-center space-x-1 px-4 py-2 bg-white text-blue-600 rounded-full hover:bg-blue-100 transition-colors shadow-sm text-sm font-medium"
          title="Read Question"
        >
          <span>🔊</span> <span>Read</span>
        </button>
      ) : (
        <>
          {isPaused ? (
            <button 
              onClick={handleResume}
              className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-100 transition-colors shadow-sm"
              title="Resume"
            >
              ▶️
            </button>
          ) : (
            <button 
              onClick={handlePause}
              className="p-2 bg-white text-yellow-600 rounded-full hover:bg-yellow-100 transition-colors shadow-sm"
              title="Pause"
            >
              ⏸️
            </button>
          )}
          
          <button 
            onClick={handleStop}
            className="p-2 bg-white text-red-600 rounded-full hover:bg-red-100 transition-colors shadow-sm"
            title="Stop"
          >
            ⏹️
          </button>
          
          <div className="w-px h-6 bg-blue-200 mx-1"></div>
          
          <button 
            onClick={handleReplay}
            className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-100 transition-colors shadow-sm"
            title="Replay"
          >
            🔁
          </button>
          
          <div className="px-3 py-1 flex items-center space-x-1">
            <span className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceControls;
