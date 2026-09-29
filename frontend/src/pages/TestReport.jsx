import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TestReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);
  const [search,  setSearch]    = useState('');
  const [sortBy,  setSortBy]    = useState('date_desc');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axiosClient.get('/student/dashboard');
        setResults(res.data.allResults || []);
      } catch {
        setError('Failed to load your test reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  /* ── Helpers ── */
  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return d; }
  };

  const getLevel = (pct) => {
    if (pct >= 75) return { label: 'Excellent', bg: 'bg-green-100', text: 'text-green-800', bar: '#10b981' };
    if (pct >= 50) return { label: 'Good',      bg: 'bg-blue-100',  text: 'text-blue-800',  bar: '#3b82f6' };
    return               { label: 'Average',    bg: 'bg-yellow-100',text: 'text-yellow-800',bar: '#eab308' };
  };

  /* ── Stats ── */
  const total   = results.length;
  const avgPct  = total ? Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / total) : 0;
  const highest = total ? Math.max(...results.map(r => r.percentage || 0)) : 0;
  const lowest  = total ? Math.min(...results.map(r => r.percentage || 0)) : 0;
  const excellent = results.filter(r => (r.percentage || 0) >= 75).length;
  const good      = results.filter(r => (r.percentage || 0) >= 50 && (r.percentage || 0) < 75).length;
  const average   = results.filter(r => (r.percentage || 0) < 50).length;

  /* ── Filter + Sort ── */
  const filtered = results
    .filter(r => {
      const q = search.toLowerCase();
      return !q ||
        (r.subjectName || '').toLowerCase().includes(q) ||
        (r.labTopic    || '').toLowerCase().includes(q) ||
        (r.staffName   || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc')  return new Date(b.date || 0) - new Date(a.date || 0);
      if (sortBy === 'date_asc')   return new Date(a.date || 0) - new Date(b.date || 0);
      if (sortBy === 'pct_desc')   return (b.percentage || 0) - (a.percentage || 0);
      if (sortBy === 'pct_asc')    return (a.percentage || 0) - (b.percentage || 0);
      return 0;
    });

  /* ── Loading ── */
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"/>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── PAGE HEADER ── */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d6a9f] rounded-2xl p-7 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">📋</span>
            <h1 className="text-2xl font-bold">My Test Report</h1>
          </div>
          <p className="text-blue-200 text-sm">
            Complete record of all your viva marks and performance
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              🎓 {user?.name}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-mono">
              🪪 {user?.studentId}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              📅 2nd Year · Computer Applications
            </span>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white opacity-5"/>
        <div className="absolute -right-2 -bottom-8 w-28 h-28 rounded-full bg-white opacity-5"/>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: '📝', label: 'Total Tests',  value: total,    color: 'bg-blue-50  border-blue-100'   },
          { icon: '🎯', label: 'Average Score', value: `${avgPct}%`, color: 'bg-green-50 border-green-100' },
          { icon: '🏆', label: 'Highest',      value: `${highest}%`,color: 'bg-purple-50 border-purple-100'},
          { icon: '📉', label: 'Lowest',       value: `${lowest}%`, color: 'bg-orange-50 border-orange-100'},
          { icon: '🌟', label: 'Excellent',    value: excellent,color: 'bg-emerald-50 border-emerald-100'},
          { icon: '📊', label: 'Good',         value: good,     color: 'bg-sky-50 border-sky-100'     },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className={`card ${color} border p-4 flex flex-col items-center text-center`}>
            <span className="text-2xl mb-1">{icon}</span>
            <span className="text-xs text-gray-500 font-medium">{label}</span>
            <span className="text-2xl font-black text-gray-800 mt-0.5">{value}</span>
          </div>
        ))}
      </div>

      {/* ── PERFORMANCE BREAKDOWN BAR ── */}
      {total > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
            Performance Breakdown
          </h3>
          <div className="flex rounded-full overflow-hidden h-4 mb-3">
            {excellent > 0 && (
              <div
                title={`Excellent: ${excellent}`}
                style={{ width: `${(excellent/total)*100}%`, background:'#10b981' }}
              />
            )}
            {good > 0 && (
              <div
                title={`Good: ${good}`}
                style={{ width: `${(good/total)*100}%`, background:'#3b82f6' }}
              />
            )}
            {average > 0 && (
              <div
                title={`Average: ${average}`}
                style={{ width: `${(average/total)*100}%`, background:'#eab308' }}
              />
            )}
          </div>
          <div className="flex gap-4 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"/>Excellent ({excellent})</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/>Good ({good})</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"/>Average ({average})</span>
          </div>
        </div>
      )}

      {/* ── TABLE CARD ── */}
      <div className="card overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">📄 Detailed Test Marks</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {total} test(s)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subject, topic…"
                className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
              />
            </div>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="pct_desc">Highest Score</option>
              <option value="pct_asc">Lowest Score</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Lab Topic</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3 text-center">✅ Correct</th>
                  <th className="px-4 py-3 text-center">❌ Wrong</th>
                  <th className="px-4 py-3 text-center">Marks</th>
                  <th className="px-4 py-3 text-center">Score %</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Level</th>
                  <th className="px-4 py-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r, idx) => {
                  const lv = getLevel(r.percentage || 0);
                  return (
                    <tr
                      key={r._id || idx}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>

                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-800">{r.subjectName || '—'}</span>
                      </td>

                      <td className="px-4 py-3 max-w-[160px]">
                        <span className="text-gray-600 text-xs truncate block" title={r.labTopic}>
                          {r.labTopic || '—'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {r.staffName || '—'}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-green-600 text-base">
                          {r.correctAnswers ?? '—'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-red-500 text-base">
                          {r.incorrectAnswers ?? '—'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="font-black text-gray-800 text-base">
                          {r.score ?? r.correctAnswers ?? '—'}
                        </span>
                        <span className="text-gray-400 text-xs">/{r.totalQuestions || 20}</span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-black text-gray-800">{r.percentage ?? 0}%</span>
                          <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${r.percentage || 0}%`, backgroundColor: lv.bar }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {fmtDate(r.date)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${lv.bg} ${lv.text}`}>
                          {lv.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => r._id && navigate(`/student/result/${r._id}`)}
                          disabled={!r._id}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline disabled:text-gray-300 disabled:cursor-not-allowed"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals row */}
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 text-xs font-bold text-gray-600">
                <tr>
                  <td className="px-4 py-3" colSpan={4}>Total / Average</td>
                  <td className="px-4 py-3 text-center text-green-700">
                    {results.reduce((s, r) => s + (r.correctAnswers || 0), 0)}
                  </td>
                  <td className="px-4 py-3 text-center text-red-600">
                    {results.reduce((s, r) => s + (r.incorrectAnswers || 0), 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {results.reduce((s, r) => s + (r.score || r.correctAnswers || 0), 0)}
                    <span className="font-normal text-gray-400">/{(r => r * 20)(total)}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-blue-700">{avgPct}%</td>
                  <td colSpan={3}/>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-5xl mb-4">📭</span>
            <p className="font-semibold text-gray-600 text-lg mb-1">
              {search ? 'No matching results' : 'No test reports yet'}
            </p>
            <p className="text-sm">
              {search
                ? 'Try a different search term.'
                : 'Complete your first viva to see marks here.'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/student/schedules')}
                className="mt-5 btn-primary px-6 py-2 text-sm"
              >
                View My Schedules
              </button>
            )}
          </div>
        )}

        {/* Footer note */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
            Click <strong>View →</strong> on any row to open the full result with question-by-question review
          </div>
        )}
      </div>

    </div>
  );
};

export default TestReport;
