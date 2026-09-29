import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axios';

const StaffPerformance = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await axiosClient.get('/results/staff');
        setResults(response.data);
      } catch (err) {
        setError('Failed to fetch performance reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  const getBadgeClass = (level) => {
    const map = {
      'Excellent': 'bg-green-100 text-green-800 border-green-200',
      'Good':      'bg-blue-100 text-blue-800 border-blue-200',
      'Average':   'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return map[level] || 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getBarColor = (pct) => {
    if (pct >= 75) return '#10b981'; // green — Excellent
    if (pct >= 50) return '#3b82f6'; // blue  — Good
    return '#eab308';                // yellow — Average
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10 p-4 bg-red-50 rounded-lg max-w-lg mx-auto">{error}</div>;
  }

  // ── Aggregate stats — all fields read directly (flat, no .studentId?.name) ──
  const totalExams = results.length;
  const passResults = results.filter(r => (r.percentage ?? 0) >= 50).length;
  const passRate = totalExams ? Math.round((passResults / totalExams) * 100) : 0;
  const avgScore = totalExams
    ? Math.round(results.reduce((acc, r) => acc + (r.percentage ?? 0), 0) / totalExams)
    : 0;

  const sorted = [...results].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
  const topPerformer = sorted.length > 0 ? (sorted[0].studentName || 'N/A') : 'N/A';

  // ── Filtered results ──
  const filteredResults = results.filter(r => {
    const matchSearch =
      (r.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.studentRegId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.subjectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.labTopic || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = levelFilter === 'All' || r.performanceLevel === levelFilter;
    return matchSearch && matchLevel;
  });

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginated = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Performance Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Results from MongoDB — updated in real time</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Exams', value: totalExams, color: 'from-blue-500 to-blue-600', light: 'text-blue-100' },
          { label: 'Pass Rate', value: `${passRate}%`, color: 'from-green-500 to-green-600', light: 'text-green-100' },
          { label: 'Class Average', value: `${avgScore}%`, color: 'from-orange-500 to-orange-600', light: 'text-orange-100' },
          { label: 'Top Performer', value: topPerformer, color: 'from-purple-500 to-purple-600', light: 'text-purple-100' },
        ].map(({ label, value, color, light }) => (
          <div key={label} className={`card bg-gradient-to-br ${color} text-white p-6 border-none shadow-lg`}>
            <p className={`${light} text-xs font-semibold uppercase tracking-wider mb-1`}>{label}</p>
            <p className="text-3xl font-bold truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">

        {/* Filter bar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by student name, ID, subject or topic..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Filter:</span>
            <select
              value={levelFilter}
              onChange={e => { setLevelFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="All">All Levels</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Student</th>
                <th className="px-5 py-4 font-semibold">Reg. No.</th>
                <th className="px-5 py-4 font-semibold">Subject</th>
                <th className="px-5 py-4 font-semibold">Lab Topic</th>
                <th className="px-5 py-4 font-semibold text-center">Correct</th>
                <th className="px-5 py-4 font-semibold text-center">Wrong</th>
                <th className="px-5 py-4 font-semibold text-center">Score</th>
                <th className="px-5 py-4 font-semibold text-center">%</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold text-right">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length > 0 ? (
                paginated.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    {/* All fields read flat — no .studentId?.name */}
                    <td className="px-5 py-4 font-semibold text-gray-800">{r.studentName || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">{r.studentRegId || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-700">{r.subjectName || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-[180px] truncate" title={r.labTopic}>{r.labTopic || 'N/A'}</td>
                    <td className="px-5 py-4 text-center font-bold text-green-600">{r.correctAnswers ?? 0}</td>
                    <td className="px-5 py-4 text-center font-bold text-red-500">{r.incorrectAnswers ?? 0}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-gray-800">{r.score ?? r.marks ?? r.correctAnswers ?? 0}</span>
                      <span className="text-gray-400 text-xs"> /{r.totalQuestions || 20}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-gray-800">{r.percentage ?? 0}%</span>
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getBarColor(r.percentage ?? 0)}`}
                            style={{ width: `${r.percentage ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(r.submittedAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeClass(r.performanceLevel)}`}>
                        {r.performanceLevel || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="font-medium">
                      {results.length === 0
                        ? 'No students have completed a viva yet.'
                        : 'No results match your search criteria.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredResults.length)} of {filteredResults.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-gray-600 disabled:opacity-40 hover:bg-gray-50 text-sm"
              >Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1 rounded border text-sm ${currentPage === p ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >{p}</button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-gray-600 disabled:opacity-40 hover:bg-gray-50 text-sm"
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPerformance;
