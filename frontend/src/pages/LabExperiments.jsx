import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axios';

/* ──────────────────────────────────────────────────────────────
   DOMAIN OPTIONS
────────────────────────────────────────────────────────────── */
const DOMAIN_OPTIONS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Data Structures & Algorithms',
  'Database Management',
  'Web Technologies',
  'Networking',
  'Operating Systems',
  'Software Engineering',
  'Cloud Computing',
  'IoT & Embedded Systems',
  'Cybersecurity',
  'Other',
];

/* ──────────────────────────────────────────────────────────────
   BADGE COLOURS per domain category
────────────────────────────────────────────────────────────── */
const domainColor = (domain) => {
  const map = {
    'Artificial Intelligence':       'bg-purple-100 text-purple-800 border-purple-200',
    'Machine Learning':              'bg-blue-100 text-blue-800 border-blue-200',
    'Deep Learning':                 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Natural Language Processing':   'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Computer Vision':               'bg-teal-100 text-teal-800 border-teal-200',
    'Data Structures & Algorithms':  'bg-orange-100 text-orange-800 border-orange-200',
    'Database Management':           'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Web Technologies':              'bg-green-100 text-green-800 border-green-200',
    'Networking':                    'bg-sky-100 text-sky-800 border-sky-200',
    'Operating Systems':             'bg-red-100 text-red-800 border-red-200',
    'Software Engineering':          'bg-pink-100 text-pink-800 border-pink-200',
    'Cloud Computing':               'bg-blue-100 text-blue-800 border-blue-200',
    'IoT & Embedded Systems':        'bg-amber-100 text-amber-800 border-amber-200',
    'Cybersecurity':                 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return map[domain] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const LabExperiments = () => {
  const navigate = useNavigate();

  /* ── state ── */
  const [experiments, setExperiments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [deleting,    setDeleting]    = useState(null);  // id being deleted
  const [search,      setSearch]      = useState('');
  const [msg,         setMsg]         = useState({ type: '', text: '' });

  /* ── form ── */
  const [name,   setName]   = useState('');
  const [domain, setDomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');

  /* ── fetch ── */
  const fetchExperiments = async () => {
    try {
      const res = await axiosClient.get('/lab');
      setExperiments(res.data || []);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load experiments.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExperiments(); }, []);

  /* ── add experiment ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    const finalDomain = domain === 'Other' ? customDomain.trim() : domain;
    if (!name.trim())  return setMsg({ type: 'error', text: 'Experiment name is required.' });
    if (!finalDomain)  return setMsg({ type: 'error', text: 'Domain is required.' });

    setSubmitting(true);
    try {
      const res = await axiosClient.post('/lab', { name: name.trim(), domain: finalDomain });
      setExperiments(prev => [res.data, ...prev]);
      setMsg({ type: 'success', text: `✅ "${res.data.name}" added successfully!` });
      setName('');
      setDomain('');
      setCustomDomain('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add experiment.' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (exp) => {
    if (!window.confirm(`Delete experiment "${exp.name}"? This cannot be undone.`)) return;
    setDeleting(exp._id);
    try {
      await axiosClient.delete(`/lab/${exp._id}`);
      setExperiments(prev => prev.filter(e => e._id !== exp._id));
      setMsg({ type: 'success', text: `Experiment "${exp.name}" deleted.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete.' });
    } finally {
      setDeleting(null);
    }
  };

  /* ── schedule viva from experiment ── */
  const handleSchedule = (exp) => {
    // Navigate to schedule page, pass experiment info via URL state
    navigate('/staff/schedule', {
      state: { prefillTopic: exp.name, prefillDomain: exp.domain },
    });
  };

  /* ── filtered list ── */
  const filtered = experiments.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.domain.toLowerCase().includes(search.toLowerCase())
  );

  /* ── loading ── */
  if (loading) return (
    <div className="flex justify-center items-center mt-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🧪 Lab Experiments</h1>
          <p className="text-gray-500 text-sm mt-1">
            Add experiments and directly schedule viva assessments.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-2 text-sm font-medium">
          📋 {experiments.length} experiment{experiments.length !== 1 ? 's' : ''} added
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ════════ ADD FORM ════════ */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <div className="flex items-center mb-6 border-b pb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl mr-3">
                🧪
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Add New Experiment</h2>
                <p className="text-xs text-gray-500">Fill in experiment details</p>
              </div>
            </div>

            {/* Message */}
            {msg.text && (
              <div className={`p-3 rounded-lg text-sm mb-5 ${
                msg.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4">

              {/* Experiment Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Experiment Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Bubble Sort Implementation"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required
                />
              </div>

              {/* Domain */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={domain}
                  onChange={e => { setDomain(e.target.value); setCustomDomain(''); }}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                  required
                >
                  <option value="">Select domain...</option>
                  {DOMAIN_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                {/* Custom domain input when "Other" selected */}
                {domain === 'Other' && (
                  <input
                    type="text"
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value)}
                    placeholder="Specify your domain..."
                    className="mt-2 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                )}
              </div>

              {/* Preview */}
              {name && domain && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                  <p className="font-bold mb-1">Preview</p>
                  <p>📋 <strong>{name}</strong></p>
                  <p>🏷️ {domain === 'Other' ? customDomain || 'Other' : domain}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 font-bold flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : '➕ Add Experiment'}
              </button>
            </form>
          </div>
        </div>

        {/* ════════ EXPERIMENTS LIST ════════ */}
        <div className="lg:col-span-2 space-y-4">

          {/* Search bar */}
          <div className="card p-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or domain..."
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="card text-center py-16 text-gray-400">
              <div className="text-6xl mb-4">🧪</div>
              <p className="font-medium text-gray-500">
                {search ? 'No experiments match your search.' : 'No experiments added yet.'}
              </p>
              <p className="text-sm mt-1">
                {!search && 'Use the form on the left to add your first experiment.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((exp, idx) => (
                <div
                  key={exp._id}
                  className="card hover:shadow-md transition-shadow duration-200 border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-4">

                    {/* Left: info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Index badge */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow">
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-base truncate">
                          {exp.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {/* Domain badge */}
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${domainColor(exp.domain)}`}>
                            🏷️ {exp.domain}
                          </span>

                          {/* Subject badge */}
                          {exp.subjectName && (
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                              📚 {exp.subjectName}
                            </span>
                          )}

                          {/* Date */}
                          <span className="text-xs text-gray-400">
                            🗓️ {new Date(exp.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Schedule Viva button */}
                      <button
                        onClick={() => handleSchedule(exp)}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm hover:shadow-md"
                        title="Schedule Viva for this experiment"
                      >
                        📅 Schedule Viva
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(exp)}
                        disabled={deleting === exp._id}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete experiment"
                      >
                        {deleting === exp._id
                          ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                          : '🗑️'
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats footer */}
          {experiments.length > 0 && (
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex flex-wrap gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-700">{experiments.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total Experiments</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-700">
                    {[...new Set(experiments.map(e => e.domain))].length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Unique Domains</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {filtered.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Showing</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LabExperiments;
