import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axiosClient from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ── helper: "HH:MM" → minutes since midnight ── */
const toMins = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

/* ── helper: minutes → "HH:MM" ── */
const toHHMM = (mins) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
};

/* ── helper: "HH:MM" → "hh:mm AM/PM" ── */
const fmt12 = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr   = ((h % 12) || 12);
  return `${hr}:${String(m).padStart(2,'0')} ${ampm}`;
};

const DURATION_OPTIONS = [
  { value: 15,  label: '15 minutes'  },
  { value: 20,  label: '20 minutes'  },
  { value: 30,  label: '30 minutes'  },
  { value: 40,  label: '40 minutes'  },
  { value: 45,  label: '45 minutes'  },
  { value: 60,  label: '1 hour'      },
  { value: 90,  label: '1.5 hours'   },
  { value: 120, label: '2 hours'     },
];

const VivaSchedulePage = () => {
  const { user }     = useAuth();
  const location     = useLocation();
  const prefillTopic = location.state?.prefillTopic || '';

  const [labTopics,     setLabTopics]     = useState([]);
  const [schedules,     setSchedules]     = useState([]);
  const [subjectData,   setSubjectData]   = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading,       setLoading]       = useState(true);

  /* ── form state — pre-fill topic if coming from Lab Experiments ── */
  const [labTopic,  setLabTopic]  = useState(prefillTopic);
  const [date,      setDate]      = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime,   setEndTime]   = useState('');
  const [duration,  setDuration]  = useState('30');

  /* ── when startTime or duration changes, auto-update endTime ── */
  const recalcEnd = useCallback((st, dur) => {
    if (!st) return;
    const endMins = toMins(st) + Number(dur);
    setEndTime(toHHMM(endMins));
  }, []);

  const handleStartChange = (val) => {
    setStartTime(val);
    recalcEnd(val, duration);
  };

  const handleDurationChange = (val) => {
    setDuration(val);
    recalcEnd(startTime, val);
  };

  /* ── when endTime changes manually, recalc duration ── */
  const handleEndChange = (val) => {
    setEndTime(val);
    if (startTime && val) {
      const diff = toMins(val) - toMins(startTime);
      if (diff > 0) {
        // find nearest option or keep custom
        const nearest = DURATION_OPTIONS.reduce((prev, cur) =>
          Math.abs(cur.value - diff) < Math.abs(prev.value - diff) ? cur : prev
        );
        if (Math.abs(nearest.value - diff) <= 5) setDuration(String(nearest.value));
        else setDuration(String(diff)); // custom value
      }
    }
  };

  /* ── computed duration display ── */
  const computedDuration = (() => {
    if (startTime && endTime) {
      const diff = toMins(endTime) - toMins(startTime);
      if (diff > 0) return diff;
    }
    return Number(duration);
  })();

  const [submitting, setSubmitting] = useState(false);
  const [message,    setMessage]    = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      const [subjectRes, schedulesRes, studentsRes] = await Promise.all([
        axiosClient.get('/staff/subject'),
        axiosClient.get('/viva/schedules'),
        axiosClient.get('/staff/students'),
      ]);

      setSubjectData(subjectRes.data);
      setLabTopics(subjectRes.data.labTopics || []);
      setTotalStudents(studentsRes.data.length || 0);

      // Deduplicate by labTopic + vivaDate + vivaTime
      const raw   = schedulesRes.data;
      const seen  = new Set();
      const deduped = raw.filter((s) => {
        const key = `${s.labTopic}__${s.vivaDate}__${s.vivaTime}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setSchedules(deduped);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load data. Please refresh.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!labTopic)  return setMessage({ type: 'error', text: 'Please select a lab topic.'     });
    if (!date)      return setMessage({ type: 'error', text: 'Please select a date.'           });
    if (!startTime) return setMessage({ type: 'error', text: 'Please set the start time.'      });
    if (!endTime)   return setMessage({ type: 'error', text: 'Please set the end time.'        });

    if (toMins(endTime) <= toMins(startTime))
      return setMessage({ type: 'error', text: 'End time must be after start time.' });

    setSubmitting(true);
    try {
      const res = await axiosClient.post('/viva/schedule', {
        subjectId:   subjectData?._id,
        labTopic,
        vivaDate:    date,
        vivaTime:    startTime,
        vivaEndTime: endTime,
        duration:    computedDuration,
      });
      setMessage({ type: 'success', text: `✅ ${res.data.message}` });
      setLabTopic('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setDuration('30');
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to schedule viva.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (schedule, newStatus) => {
    try {
      await axiosClient.patch(`/viva/schedule/${schedule._id}/status`, { status: newStatus });
      fetchData();
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (schedule) => {
    if (window.confirm(`Delete the viva for "${schedule.labTopic}" on ${schedule.vivaDate} for ALL students?`)) {
      try {
        await axiosClient.delete(`/viva/schedule/${schedule._id}`);
        setMessage({ type: 'success', text: 'Schedule deleted for all students.' });
        fetchData();
      } catch {
        alert('Failed to delete schedule');
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center mt-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"/>
    </div>
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Viva Schedule Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            One schedule applies to <strong>all {totalStudents} students</strong> automatically.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-2 text-sm font-medium">
          👥 {totalStudents} Students Enrolled
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ════════ FORM CARD ════════ */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">

            {/* Card header */}
            <div className="flex items-center mb-6 border-b pb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl mr-3">📅</div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Schedule New Viva</h2>
                <p className="text-xs text-gray-500">Applies to all {totalStudents} students</p>
              </div>
            </div>

            {/* Pre-fill notice from Lab Experiments */}
            {prefillTopic && (
              <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2.5 text-sm text-green-800">
                <span className="text-lg leading-none mt-0.5">🧪</span>
                <div>
                  <p className="font-bold">Scheduling from Lab Experiments</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Experiment: <strong>"{prefillTopic}"</strong> — just pick the date, time, and duration.
                  </p>
                </div>
              </div>
            )}

            {/* Message */}
            {message.text && (
              <div className={`p-3 rounded-lg text-sm mb-5 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Subject — read-only */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={user?.subjectName || subjectData?.name || ''}
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-gray-500 cursor-not-allowed text-sm"
                />
              </div>

              {/* Lab Topic */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Lab Topic / Experiment <span className="text-red-500">*</span>
                </label>

                {/* ── LOCKED: came from Lab Experiments page ── */}
                {prefillTopic ? (
                  <div>
                    <div className="w-full border-2 border-blue-400 bg-blue-50 rounded-lg p-2.5 text-sm text-blue-800 font-semibold flex items-center gap-2">
                      <span>🧪</span>
                      <span className="flex-1">{labTopic}</span>
                      <span className="text-xs font-normal text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">From Lab</span>
                    </div>
                    <p className="text-xs text-blue-500 mt-1">
                      Pre-filled from Lab Experiments. <button type="button" onClick={() => { setLabTopic(''); window.history.replaceState({}, ''); }} className="underline hover:text-blue-700">Change manually</button>
                    </p>
                  </div>
                ) : labTopics.length > 0 ? (
                  /* ── SELECT from predefined topics ── */
                  <select
                    value={labTopic}
                    onChange={(e) => setLabTopic(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                    required
                  >
                    <option value="">Select a topic...</option>
                    {labTopics.map((topic, idx) => (
                      <option key={idx} value={topic}>{topic}</option>
                    ))}
                  </select>
                ) : (
                  /* ── FREE TEXT input ── */
                  <input
                    type="text"
                    value={labTopic}
                    onChange={(e) => setLabTopic(e.target.value)}
                    placeholder="Enter lab topic..."
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required
                />
              </div>

              {/* ── Start Time & End Time ── */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">⏰ Test Timing</p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Start Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => handleStartChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                      required
                    />
                    {startTime && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">{fmt12(startTime)}</p>
                    )}
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => handleEndChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                      required
                    />
                    {endTime && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">{fmt12(endTime)}</p>
                    )}
                  </div>
                </div>

                {/* Duration dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Duration per Student
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Live timing summary */}
                {startTime && endTime && toMins(endTime) > toMins(startTime) && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200 text-sm">
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"/>
                        <span className="font-semibold">{fmt12(startTime)}</span>
                        <span className="text-gray-400 text-xs mx-1">→</span>
                        <span className="font-semibold">{fmt12(endTime)}</span>
                      </span>
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {computedDuration} min slot
                      </span>
                    </div>
                  </div>
                )}

                {/* Error: end before start */}
                {startTime && endTime && toMins(endTime) <= toMins(startTime) && (
                  <p className="text-red-600 text-xs font-medium">
                    ⚠️ End time must be after start time.
                  </p>
                )}
              </div>

              {/* Info notice */}
              <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-700 border border-amber-100">
                📢 This viva will be assigned to <strong>all {totalStudents} students</strong> simultaneously.
                Each student gets <strong>{computedDuration} minutes</strong> for their viva.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 mt-2 font-bold"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Scheduling for all students...
                  </span>
                ) : `📅 Schedule for All ${totalStudents} Students`}
              </button>
            </form>
          </div>
        </div>

        {/* ════════ SCHEDULES TABLE ════════ */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Scheduled Vivas</h2>
              <p className="text-xs text-gray-500 mt-0.5">Each entry applies to all {totalStudents} students</p>
            </div>
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {schedules.length} batch{schedules.length !== 1 ? 'es' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-5 py-4 font-semibold">Lab Topic</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Time Slot</th>
                  <th className="px-5 py-4 font-semibold">Duration</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schedules.length > 0 ? (
                  schedules.map((schedule) => (
                    <tr key={schedule._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-800">{schedule.labTopic}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{schedule.subjectName}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-gray-700 font-medium">
                          {new Date(schedule.vivaDate + 'T00:00:00').toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"/>
                          <span className="font-semibold text-gray-700">{fmt12(schedule.vivaTime)}</span>
                          {schedule.vivaEndTime && (
                            <>
                              <span className="text-gray-400 text-xs">→</span>
                              <span className="font-semibold text-gray-700">{fmt12(schedule.vivaEndTime)}</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 ml-3.5">
                          {schedule.vivaTime}
                          {schedule.vivaEndTime ? ` – ${schedule.vivaEndTime}` : ''}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-full border border-blue-100">
                          {schedule.duration} min
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={schedule.status}
                          onChange={(e) => handleStatusChange(schedule, e.target.value)}
                          className={`text-xs font-bold uppercase tracking-wide rounded-md px-2 py-1 outline-none cursor-pointer border ${
                            schedule.status === 'upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            schedule.status === 'active'   ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(schedule)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete for all students"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-gray-400">
                      <div className="text-5xl mb-3">📭</div>
                      <p className="font-medium">No vivas scheduled yet.</p>
                      <p className="text-sm mt-1">Use the form to schedule a viva for all students.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VivaSchedulePage;
