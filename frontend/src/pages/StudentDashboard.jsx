import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axiosClient from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosClient.get('/student/dashboard');
        setData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  if (error) return <div className="text-red-500 text-center mt-10 bg-red-50 p-4 rounded-lg">{error}</div>;

  // ── Helper functions ──────────────────────────────────────────────────
  const getPerformanceBadge = (level) => {
    const badges = {
      'Excellent': 'bg-green-100 text-green-800 border-green-200',
      'Good':      'bg-blue-100 text-blue-800 border-blue-200',
      'Average':   'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return badges[level] || 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getPerformanceEmoji = (level) => {
    const emojis = { 'Excellent': '🌟', 'Good': '👍', 'Average': '😐' };
    return emojis[level] || '📊';
  };

  const getBarColor = (pct) => {
    if (pct >= 75) return '#10b981';
    if (pct >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
  };

  // Chart data: use subjectPerformance from API; fallback to empty bar
  const chartData = data?.subjectPerformance?.length > 0
    ? data.subjectPerformance
    : [];

  const COLORS = ['#2d6a9f', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Student info — year always shows 2nd Year
  const studentYear = data?.student?.yearLabel || '2nd Year';
  const department = data?.student?.department || user?.department || 'Computer Applications';

  return (
    <div className="space-y-6">

      {/* ── WELCOME BANNER ── */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d6a9f] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.name || data?.student?.name}! 👋</h1>
          <p className="text-blue-200 text-sm mb-4">Ready for your next viva challenge?</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              🎓 {department}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              📅 {studentYear}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm font-mono">
              🪪 {user?.studentId || data?.student?.studentId}
            </span>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white opacity-5"></div>
        <div className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full bg-white opacity-5"></div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: '📝', label: 'Vivas Completed',
            value: data?.totalVivasCompleted ?? 0,
            bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
          },
          {
            icon: '🎯', label: 'Average Score',
            value: `${data?.averagePercentage ?? 0}%`,
            bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600',
          },
          {
            icon: '⏳', label: 'Upcoming Vivas',
            value: data?.upcomingVivas?.length ?? 0,
            bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-orange-600',
          },
          {
            icon: getPerformanceEmoji(data?.overallPerformanceLevel),
            label: 'Overall Level',
            value: data?.overallPerformanceLevel || 'N/A',
            bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
          },
        ].map(({ icon, label, value, bg, iconBg, iconColor }) => (
          <div key={label} className={`card flex items-center p-5 ${bg} border border-white`}>
            <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center text-2xl mr-4 shrink-0`}>
              {icon}
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium">{label}</p>
              <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 3: Upcoming + Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left — Upcoming Viva */}
        <div className="lg:col-span-7">
          <div className="card h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">📅 Upcoming Viva</h3>
            {data?.upcomingVivas?.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingVivas.slice(0, 2).map((v, i) => (
                  <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {v.status === 'active' ? '🟢 ACTIVE NOW' : '⏳ UPCOMING'}
                        </span>
                        <h4 className="text-base font-bold text-blue-900 mt-1">{v.subjectName}</h4>
                        <p className="text-sm text-gray-600">{v.labTopic}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-gray-800">{v.date}</p>
                        <p className="text-gray-500">{v.time} • {v.duration} min</p>
                      </div>
                    </div>
                    {v.status === 'active' && (
                      <button onClick={() => navigate('/student/schedules')} className="w-full btn-primary py-2 text-sm">
                        🚀 Start Viva Now
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => navigate('/student/schedules')} className="w-full text-center text-sm text-blue-600 hover:underline mt-1">
                  View all schedules →
                </button>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-3">📅</p>
                <p className="font-medium">No upcoming viva scheduled.</p>
                <p className="text-sm mt-2 text-blue-500">Use the AI Chatbot to practice anytime!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right — Chart */}
        <div className="lg:col-span-5">
          <div className="card h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Subject Performance</h3>
            {chartData.length > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      formatter={(val, name, props) => [`${val}%`, props.payload.fullSubject || 'Score']}
                      cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, idx) => (
                        <Cell key={idx} fill={getBarColor(entry.percentage)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-gray-400">
                <p className="text-4xl mb-2">📈</p>
                <p className="text-sm">Complete a viva to see your performance chart</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── VIVA SCORES & PERFORMANCE ── */}
      <div className="card overflow-hidden">
        <div className="flex justify-between items-center mb-1 px-1">
          <div>
            <h3 className="text-lg font-bold text-gray-800">🏆 Viva Scores & Performance</h3>
            <p className="text-xs text-gray-500 mt-0.5">All your completed viva results from the database</p>
          </div>
          <Link to="/student/schedules" className="text-sm text-blue-600 hover:underline font-medium">
            View Schedules →
          </Link>
        </div>

        {data?.allResults?.length > 0 ? (
          <>
            {/* Performance Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Highest Score</p>
                <p className="text-3xl font-black text-green-600">
                  {Math.max(...data.allResults.map(r => r.percentage ?? 0))}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Average Score</p>
                <p className="text-3xl font-black text-blue-600">{data.averagePercentage ?? 0}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Lowest Score</p>
                <p className="text-3xl font-black text-orange-500">
                  {Math.min(...data.allResults.map(r => r.percentage ?? 0))}%
                </p>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-y border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Subject</th>
                    <th className="px-4 py-3 font-semibold">Lab Topic</th>
                    <th className="px-4 py-3 font-semibold">Staff</th>
                    <th className="px-4 py-3 font-semibold text-center">Correct</th>
                    <th className="px-4 py-3 font-semibold text-center">Wrong</th>
                    <th className="px-4 py-3 font-semibold text-center">Score</th>
                    <th className="px-4 py-3 font-semibold text-center">%</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold text-right">Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.allResults.map((r, idx) => (
                    <tr
                      key={r._id || idx}
                      onClick={() => r._id && navigate(`/student/result/${r._id}`)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 text-sm">{r.subjectName}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[160px]">
                        <p className="truncate text-xs" title={r.labTopic}>{r.labTopic}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{r.staffName}</td>
                      <td className="px-4 py-3 text-center font-bold text-green-600">{r.correctAnswers}</td>
                      <td className="px-4 py-3 text-center font-bold text-red-500">{r.incorrectAnswers}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-gray-800">{r.score}</span>
                        <span className="text-gray-400 text-xs">/{r.totalQuestions}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-gray-800">{r.percentage}%</span>
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${r.percentage}%`, backgroundColor: getBarColor(r.percentage) }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(r.date)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getPerformanceBadge(r.performanceLevel)}`}>
                          {r.performanceLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
              Click any row to view full result details
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-semibold text-gray-600 text-base">No viva results yet.</p>
            <p className="text-sm mt-2">Complete your first viva to see scores and performance data here.</p>
            <button onClick={() => navigate('/student/schedules')} className="mt-4 btn-primary px-6 py-2 text-sm">
              View My Schedules
            </button>
          </div>
        )}
      </div>

      {/* ── AI CHATBOT QUICK ACCESS ── */}
      <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="text-6xl shrink-0">🤖</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Practice with AI Before Your Next Viva</h3>
            <p className="text-sm text-gray-600">Chat with the AI assistant to revise concepts, clear doubts and prepare better.</p>
          </div>
          <button
            onClick={() => navigate('/student/chatbot')}
            className="btn-primary px-6 py-3 shrink-0 flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            Start Preparing →
          </button>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
