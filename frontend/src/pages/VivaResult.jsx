import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axios';

const VivaResult = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resultId) {
      setError('No result ID provided.');
      setLoading(false);
      return;
    }
    const fetchResult = async () => {
      try {
        const res = await axiosClient.get(`/results/${resultId}`);
        setResult(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load result. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your result...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Could Not Load Result</h2>
          <p className="text-red-600 mb-6 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="btn-primary px-6 py-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-600">Result not found.</p>
          <button onClick={() => navigate('/student/dashboard')} className="btn-primary mt-4 px-6 py-2">
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  // All fields read directly from flat result document (no .scheduleId references)
  const {
    studentName,
    studentRegId,
    staffName,
    subjectName,
    labTopic,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    score,
    percentage,
    performanceLevel,
    answers = [],
    submittedAt,
  } = result;

  const displayScore = score ?? correctAnswers ?? 0;
  const displayWrong = incorrectAnswers ?? (totalQuestions - displayScore);
  const skippedCount = answers.filter(a => a.selectedIndex === null || a.selectedIndex === undefined).length;
  const actualWrong = displayWrong - skippedCount;

  const getPerformanceStyle = (level) => {
    const map = {
      'Excellent': { bg: 'bg-green-500',  light: 'bg-green-50',  text: 'text-green-800',  border: 'border-green-200' },
      'Good':      { bg: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200' },
      'Average':   { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
    };
    return map[level] || map['Average'];
  };

  const perf = getPerformanceStyle(performanceLevel);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  const getRecommendation = () => {
    if (percentage >= 80) return "Outstanding! You have a strong grasp of the topic. Keep it up!";
    if (percentage >= 60) return "Good effort! Review the incorrect answers to improve further.";
    return "Needs more preparation. Focus on basics and use the AI chatbot to practice.";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* ── SUCCESS BANNER ── */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-3xl">🎉</span>
        <div>
          <p className="font-bold text-green-800 text-lg">Viva Submitted Successfully!</p>
          <p className="text-green-700 text-sm">Your result has been saved and is visible to your staff.</p>
        </div>
      </div>

      {/* ── HERO CARD ── */}
      <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 ${perf.bg.replace('bg-', 'border-')}`}>
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">

            {/* Left: Student & Subject Info */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Student</p>
                <p className="text-2xl font-bold text-gray-800">{studentName || 'N/A'}</p>
                {studentRegId && <p className="text-sm text-gray-500 font-mono">{studentRegId}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Subject</p>
                  <p className="font-semibold text-gray-700">{subjectName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Lab Topic</p>
                  <p className="font-semibold text-gray-700">{labTopic || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Staff</p>
                  <p className="font-semibold text-gray-700">{staffName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Submission Date</p>
                  <p className="font-semibold text-gray-700">{formatDate(submittedAt)}</p>
                </div>
              </div>
            </div>

            {/* Right: Score Circle */}
            <div className="flex flex-col items-center justify-center">
              <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center ${perf.light} border-4 ${perf.border} shadow-inner`}>
                <span className="text-4xl font-black text-gray-800">{percentage}%</span>
                <span className="text-sm text-gray-500 font-medium mt-1">{displayScore} / {totalQuestions}</span>
              </div>
              <span className={`mt-3 px-4 py-1.5 rounded-full text-sm font-bold border ${perf.light} ${perf.text} ${perf.border}`}>
                {performanceLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '📋', label: 'Total Questions', value: totalQuestions, color: 'text-gray-800' },
          { icon: '✅', label: 'Correct Answers', value: correctAnswers ?? displayScore, color: 'text-green-600' },
          { icon: '❌', label: 'Wrong Answers', value: actualWrong >= 0 ? actualWrong : displayWrong, color: 'text-red-500' },
          { icon: '⏭️', label: 'Skipped', value: skippedCount, color: 'text-gray-400' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
            <div className="text-3xl mb-2">{icon}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* ── SCORE SUMMARY BAR ── */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-gray-700">Score: {displayScore} / {totalQuestions}</span>
          <span className="font-bold text-gray-700">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-700 ${
              performanceLevel === 'Excellent' ? 'bg-green-500' : performanceLevel === 'Good' ? 'bg-blue-500' : 'bg-yellow-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-gray-600 italic">{performanceLevel === 'Excellent'
          ? "Outstanding! You have a strong grasp of the topic. Keep it up!"
          : performanceLevel === 'Good'
          ? "Good effort! Review the incorrect answers to improve further."
          : "Needs more preparation. Focus on basics and use the AI chatbot to practice."}</p>
      </div>

      {/* ── QUESTION REVIEW ── */}
      {answers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800 text-lg">📝 Question Review</h3>
            <p className="text-sm text-gray-500 mt-0.5">Green = Correct answer &nbsp;|&nbsp; Red = Your wrong answer</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
            {answers.map((ans, idx) => {
              const isSkipped = ans.selectedIndex === null || ans.selectedIndex === undefined;
              const optionLabels = ['A', 'B', 'C', 'D'];
              return (
                <div key={idx} className={`p-5 ${ans.isCorrect ? 'bg-green-50/20' : isSkipped ? 'bg-gray-50' : 'bg-red-50/20'}`}>
                  {/* Question */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5
                      ${ans.isCorrect ? 'bg-green-500' : isSkipped ? 'bg-gray-400' : 'bg-red-500'}`}>
                      {idx + 1}
                    </span>
                    <p className="text-gray-800 font-medium text-sm leading-relaxed">
                      {ans.questionText || `Question ${idx + 1}`}
                    </p>
                  </div>

                  {/* Options grid */}
                  {ans.options && ans.options.length > 0 && (
                    <div className="ml-10 grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {ans.options.map((opt, optIdx) => {
                        const isCorrectOpt = optIdx === ans.correctIndex;
                        const isStudentOpt = optIdx === ans.selectedIndex;
                        let optClass = 'bg-gray-50 border-gray-200 text-gray-700';
                        if (isCorrectOpt) optClass = 'bg-green-100 border-green-400 text-green-800 font-semibold';
                        else if (isStudentOpt && !ans.isCorrect) optClass = 'bg-red-100 border-red-400 text-red-800 font-semibold';

                        return (
                          <div key={optIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${optClass}`}>
                            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                              ${isCorrectOpt ? 'bg-green-500 text-white' : isStudentOpt && !ans.isCorrect ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                              {optionLabels[optIdx]}
                            </span>
                            <span>{opt}</span>
                            {isCorrectOpt && <span className="ml-auto text-green-600 font-bold text-xs">✓ Correct</span>}
                            {isStudentOpt && !ans.isCorrect && <span className="ml-auto text-red-600 font-bold text-xs">✗ Wrong</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Result label */}
                  <div className="ml-10 text-xs font-semibold">
                    {isSkipped ? (
                      <span className="text-gray-400">⏭ Skipped</span>
                    ) : ans.isCorrect ? (
                      <span className="text-green-600">✓ Correct — {ans.studentAnswer}</span>
                    ) : (
                      <span className="text-red-600">✗ You chose: {ans.studentAnswer} &nbsp;|&nbsp; Correct: {ans.correctAnswer}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ACTIONS ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="flex-1 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-xl font-bold transition-colors"
        >
          🏠 Dashboard
        </button>
        <button
          onClick={() => navigate('/student/schedules')}
          className="flex-1 btn-primary py-3 rounded-xl font-bold"
        >
          📅 All Schedules
        </button>
      </div>
    </div>
  );
};

export default VivaResult;
