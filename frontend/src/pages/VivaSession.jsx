import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axios';
import Timer from '../components/Timer';


/* ═══════════════════════════════════════════════════════════════
   SECURE EXAM BROWSER — constants
═══════════════════════════════════════════════════════════════ */
const MAX_VIOLATIONS = 3;   // auto-submit after this many tab-switches

/* ═══════════════════════════════════════════════════════════════
   VIOLATION MODAL
═══════════════════════════════════════════════════════════════ */
const ViolationModal = ({ count, max, onDismiss, autoSubmit }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  }}>
    <div style={{
      background: '#fff', borderRadius: '20px', padding: '40px 36px',
      maxWidth: '420px', width: '90%', textAlign: 'center',
      boxShadow: '0 24px 80px rgba(220,38,38,0.35)',
      border: '3px solid #ef4444',
    }}>
      <div style={{ fontSize: '52px', marginBottom: '12px' }}>🚨</div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>
        Security Violation Detected!
      </h2>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '18px', lineHeight: 1.6 }}>
        {autoSubmit
          ? 'You have reached the maximum number of violations. Your exam is being submitted automatically.'
          : 'Tab switching, window change, or a restricted action was detected.'}
      </p>
      <div style={{
        background: '#fef2f2', border: '1px solid #fecaca',
        borderRadius: '12px', padding: '12px 16px', marginBottom: '22px',
      }}>
        <span style={{ color: '#991b1b', fontWeight: 700, fontSize: '13px' }}>
          ⚠️ Violation {count} of {max}
        </span>
        {!autoSubmit && (
          <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
            {max - count} more violation{max - count !== 1 ? 's' : ''} will auto-submit your exam.
          </p>
        )}
      </div>
      {!autoSubmit && (
        <button
          onClick={onDismiss}
          style={{
            width: '100%', padding: '13px',
            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
            color: '#fff', border: 'none', borderRadius: '12px',
            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
          }}
        >
          I Understand — Return to Exam
        </button>
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   FULLSCREEN REQUEST SCREEN
═══════════════════════════════════════════════════════════════ */
const FullscreenGate = ({ onEnter }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9998,
    background: 'linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
  }}>
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '24px', padding: '48px 40px',
      maxWidth: '460px', width: '100%', textAlign: 'center',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔒</div>
      <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
        Secure Exam Browser
      </h2>
      <p style={{ color: 'rgba(148,163,184,0.85)', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
        This viva uses a <strong style={{color:'#60a5fa'}}>Secure Exam Browser</strong>.<br/>
        The following is <strong style={{color:'#f87171'}}>strictly prohibited</strong> during the exam:
      </p>
      <ul style={{
        textAlign: 'left', color: 'rgba(203,213,225,0.9)',
        fontSize: '13px', lineHeight: 2, marginBottom: '28px',
        listStyle: 'none', padding: 0,
      }}>
        {[
          '🚫 Switching tabs or windows',
          '🚫 Copy, paste, or screenshot',
          '🚫 Opening developer tools',
          '🚫 Right-clicking anywhere',
          '🚫 Pressing restricted keyboard shortcuts',
          '🚫 Exiting fullscreen mode',
        ].map(rule => (
          <li key={rule} style={{
            background: 'rgba(239,68,68,0.08)', borderRadius: '8px',
            padding: '4px 12px', marginBottom: '4px',
          }}>{rule}</li>
        ))}
      </ul>
      <div style={{
        background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)',
        borderRadius: '10px', padding: '10px 14px', marginBottom: '24px',
        color: '#fbbf24', fontSize: '12px', fontWeight: 600,
      }}>
        ⚠️ After {MAX_VIOLATIONS} violations, your exam will be submitted automatically.
      </div>
      <button
        onClick={onEnter}
        style={{
          width: '100%', padding: '15px',
          background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
          color: '#fff', border: 'none', borderRadius: '14px',
          fontWeight: 800, fontSize: '16px', cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(124,58,237,0.45)',
          transition: 'opacity .2s',
        }}
      >
        🚀 Enter Secure Exam — Start Fullscreen
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN VIVA SESSION
═══════════════════════════════════════════════════════════════ */
const VivaSession = () => {
  const { scheduleId } = useParams();
  const navigate       = useNavigate();

  /* ── exam data ── */
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState(null);
  const [questions,    setQuestions]    = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers,      setAnswers]      = useState({});
  const [revealed,     setRevealed]     = useState({});
  const [scheduleInfo, setScheduleInfo] = useState(null);

  /* ── secure browser state ── */
  const [showGate,       setShowGate]       = useState(true);   // fullscreen gate
  const [examStarted,    setExamStarted]    = useState(false);
  const [violations,     setViolations]     = useState(0);
  const [showViolation,  setShowViolation]  = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const violationsRef  = useRef(0);  // ref so event handlers always read latest
  const submittingRef  = useRef(false);

  /* ═══════ Load questions ═══════ */
  useEffect(() => {
    const startSession = async () => {
      try {
        const response = await axiosClient.post(`/viva/start/${scheduleId}`);
        setQuestions(response.data.questions || []);
        const schedRes = await axiosClient.get('/viva/schedules');
        const found = (schedRes.data || []).find(s => s._id === scheduleId);
        setScheduleInfo(found || null);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to start viva session. It may have expired or already been completed.'
        );
      } finally {
        setLoading(false);
      }
    };
    startSession();
  }, [scheduleId]);

  /* ═══════ Submit handler ═══════ */
  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const formattedAnswers = questions.map((_, index) => ({
        questionIndex: index,
        selectedIndex: answers[index] !== undefined ? answers[index] : null,
      }));
      const response = await axiosClient.post(`/viva/submit/${scheduleId}`, { answers: formattedAnswers });
      const resultId = response.data._id;
      // Exit fullscreen cleanly
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      navigate(resultId ? `/student/result/${resultId}` : '/student/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit viva. Please try again.');
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [questions, answers, scheduleId, navigate]);

  /* ═══════ SECURE BROWSER LOGIC ═══════ */
  const triggerViolation = useCallback((reason) => {
    if (submittingRef.current) return;
    violationsRef.current += 1;
    const count = violationsRef.current;
    console.warn(`[SecureExam] Violation #${count}: ${reason}`);
    setViolations(count);
    setShowViolation(true);
    if (count >= MAX_VIOLATIONS) {
      setAutoSubmitting(true);
      // auto-submit after brief delay so modal is visible
      setTimeout(() => handleSubmit(), 2500);
    }
  }, [handleSubmit]);

  /* Enter fullscreen + start exam */
  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Some browsers may deny; proceed anyway
    }
    setShowGate(false);
    setExamStarted(true);
  }, []);

  /* Attach security event listeners once exam starts */
  useEffect(() => {
    if (!examStarted) return;

    /* 1. Visibility change (tab switch / minimise) */
    const onVisibilityChange = () => {
      if (document.hidden) triggerViolation('Tab hidden / switched');
    };

    /* 2. Window blur (alt-tab, window switch) */
    const onBlur = () => triggerViolation('Window lost focus');

    /* 3. Fullscreen exit */
    const onFsChange = () => {
      if (!document.fullscreenElement && !submittingRef.current) {
        triggerViolation('Exited fullscreen');
        // re-request fullscreen automatically
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };

    /* 4. Block keyboard shortcuts */
    const onKeyDown = (e) => {
      const key = e.key?.toLowerCase();
      // Dev tools, copy, paste, screenshot, print, etc.
      if (
        e.key === 'F12' ||
        (e.ctrlKey && ['c','v','u','a','p','s','f','j','i'].includes(key)) ||
        (e.ctrlKey && e.shiftKey && ['i','j','c','k'].includes(key)) ||
        (e.altKey && key === 'tab') ||
        e.key === 'PrintScreen' ||
        e.key === 'Meta'
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation(`Restricted key: ${e.key}`);
      }
      // Escape in fullscreen
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };

    /* 5. Block right-click */
    const onContextMenu = (e) => {
      e.preventDefault();
      triggerViolation('Right-click attempted');
    };

    /* 6. Block copy/cut/paste events */
    const onCopy  = (e) => { e.preventDefault(); triggerViolation('Copy attempted'); };
    const onCut   = (e) => { e.preventDefault(); triggerViolation('Cut attempted'); };
    const onPaste = (e) => { e.preventDefault(); };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCut);
    document.addEventListener('paste', onPaste);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('paste', onPaste);
    };
  }, [examStarted, triggerViolation]);

  /* ═══════ MCQ interaction ═══════ */
  const handleOptionSelect = (optionIndex) => {
    if (revealed[currentIndex] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    setRevealed(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNext = () => { if (currentIndex < questions.length - 1) setCurrentIndex(p => p + 1); };
  const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(p => p - 1); };

  /* ═══════ Loading ═══════ */
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 mb-6 relative">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100"/>
        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"/>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">AI is generating your questions...</h2>
      <p className="text-gray-500 max-w-md">Please wait while we prepare a personalised viva session.</p>
    </div>
  );

  /* ═══════ Error ═══════ */
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
        <div className="text-6xl text-red-500 mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
        <p className="text-gray-600 bg-red-50 p-3 rounded-lg mb-8">{error}</p>
        <button onClick={() => navigate('/student/schedules')} className="btn-primary px-6 py-2">
          Back to Schedules
        </button>
      </div>
    </div>
  );

  /* ═══════ Fullscreen Gate ═══════ */
  if (showGate) return <FullscreenGate onEnter={enterFullscreen} />;

  const currentQ        = questions[currentIndex];
  const optionLabels    = ['A', 'B', 'C', 'D'];
  const hasAnsweredCurrent = revealed[currentIndex] !== undefined;
  const answeredCount   = Object.keys(answers).length;

  /* Option style helpers */
  const getOptionStyle = (optIdx) => {
    if (!hasAnsweredCurrent) {
      return answers[currentIndex] === optIdx
        ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.01]'
        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50 cursor-pointer';
    }
    const correctIdx   = currentQ?.correctIndex;
    if (optIdx === correctIdx) return 'border-green-500 bg-green-50 shadow-md';
    if (optIdx === revealed[currentIndex] && optIdx !== correctIdx) return 'border-red-500 bg-red-50 shadow-md';
    return 'border-gray-100 bg-gray-50 opacity-60';
  };

  const getOptionBadgeStyle = (optIdx) => {
    if (!hasAnsweredCurrent) {
      return answers[currentIndex] === optIdx
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600';
    }
    const correctIdx = currentQ?.correctIndex;
    if (optIdx === correctIdx) return 'bg-green-500 text-white';
    if (optIdx === revealed[currentIndex] && optIdx !== correctIdx) return 'bg-red-500 text-white';
    return 'bg-gray-100 text-gray-400';
  };

  const getOptionLabel = (optIdx) => {
    if (!hasAnsweredCurrent) return null;
    const correctIdx = currentQ?.correctIndex;
    const selected   = revealed[currentIndex];
    if (optIdx === correctIdx && optIdx === selected)
      return <span className="ml-auto text-xs font-bold text-green-600 shrink-0">✓ Correct!</span>;
    if (optIdx === correctIdx)
      return <span className="ml-auto text-xs font-bold text-green-600 shrink-0">✓ Correct Answer</span>;
    if (optIdx === selected)
      return <span className="ml-auto text-xs font-bold text-red-600 shrink-0">✗ Wrong</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ userSelect: 'none' }}>

      {/* ── Violation Modal ── */}
      {showViolation && (
        <ViolationModal
          count={violations}
          max={MAX_VIOLATIONS}
          autoSubmit={autoSubmitting}
          onDismiss={() => setShowViolation(false)}
        />
      )}

      {/* ── TOP BAR ── */}
      <div className="bg-[#1e3a5f] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex-1 truncate">
            <h1 className="font-bold text-base truncate">{scheduleInfo?.subjectName || 'Viva Session'}</h1>
            <p className="text-blue-200 text-xs truncate">{scheduleInfo?.labTopic}</p>
          </div>

          {/* Secure badge + violation counter */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-green-700/70 text-green-100 text-xs font-bold px-3 py-1 rounded-full">
              🔒 Secure
            </span>
            {violations > 0 && (
              <span className="flex items-center gap-1 bg-red-600/80 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                ⚠️ {violations}/{MAX_VIOLATIONS} violations
              </span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 bg-black/20 rounded-full px-4 py-1 text-sm font-medium shrink-0">
            <span>Q {currentIndex + 1} / {questions.length}</span>
            <span className="text-blue-300">•</span>
            <span className="text-green-300">{answeredCount} answered</span>
          </div>

          <div className="flex-shrink-0">
            <Timer duration={scheduleInfo?.duration || 30} onTimeUp={handleSubmit} />
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col">

        {/* Question number badge */}
        <div className="mb-6">
          <span className="inline-block bg-orange-100 text-orange-800 font-bold px-3 py-1 rounded-md text-sm mb-3">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-snug">
            {currentQ?.questionText}
          </h2>
        </div>

        {/* OPTIONS */}
        <div className="space-y-3 mb-8">
          {currentQ?.options?.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              disabled={hasAnsweredCurrent || submitting}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center group
                ${getOptionStyle(idx)}
                ${hasAnsweredCurrent ? 'cursor-default' : ''}
              `}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold shrink-0 transition-colors
                ${getOptionBadgeStyle(idx)}`}>
                {optionLabels[idx]}
              </div>
              <span className={`text-base flex-1 ${
                hasAnsweredCurrent
                  ? idx === currentQ?.correctIndex
                    ? 'text-green-800 font-semibold'
                    : idx === revealed[currentIndex]
                      ? 'text-red-800 font-semibold'
                      : 'text-gray-500'
                  : answers[currentIndex] === idx
                    ? 'text-blue-900 font-medium'
                    : 'text-gray-700'
              }`}>
                {opt}
              </span>
              {getOptionLabel(idx)}
            </button>
          ))}
        </div>

        {/* Answer feedback */}
        {hasAnsweredCurrent && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-semibold text-center ${
            revealed[currentIndex] === currentQ?.correctIndex
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {revealed[currentIndex] === currentQ?.correctIndex
              ? '✓ Correct! Well done.'
              : `✗ Wrong. Correct: ${optionLabels[currentQ?.correctIndex]} — ${currentQ?.options?.[currentQ?.correctIndex]}`}
          </div>
        )}

        <div className="flex-1" />

        {/* NAVIGATION */}
        <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0 || submitting}
            className={`px-5 py-3 rounded-xl font-semibold transition-colors ${
              currentIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ← Previous
          </button>

          {/* Dot navigator */}
          <div className="hidden md:flex space-x-1.5 overflow-x-auto max-w-xs">
            {questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isCurrent  = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full flex-shrink-0 transition-all ${
                    isCurrent
                      ? 'ring-2 ring-offset-1 ring-blue-500 bg-blue-500 scale-125'
                      : isAnswered
                        ? 'bg-green-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  title={`Q${idx + 1}${isAnswered ? ' (answered)' : ''}`}
                />
              );
            })}
          </div>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Submitting...
                </>
              ) : 'Submit Viva ✔️'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={submitting}
              className="px-6 py-3 bg-[#2d6a9f] text-white rounded-xl font-semibold hover:bg-[#1e3a5f] shadow-md transition-all"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VivaSession;
