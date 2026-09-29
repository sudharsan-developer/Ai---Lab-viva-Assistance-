import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axios';

const StudentVivaView = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axiosClient.get('/viva/schedules');
        // Sort by date (closest first for upcoming/active)
        const sorted = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setSchedules(sorted);
      } catch (err) {
        setError('Failed to fetch schedules. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const filteredSchedules = filter === 'All' 
    ? schedules 
    : schedules.filter(s => s.status.toLowerCase() === filter.toLowerCase());

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">My Viva Schedules</h1>
        
        {/* Filters */}
        <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          {['All', 'Upcoming', 'Active', 'Completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {filteredSchedules.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-500">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No schedules found</h3>
          <p>You don't have any {filter !== 'All' ? filter.toLowerCase() : ''} viva schedules at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule) => (
            <div key={schedule._id} className="card flex flex-col h-full border border-gray-100 hover:shadow-lg transition-shadow">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                  schedule.status === 'upcoming' ? 'badge-upcoming' :
                  schedule.status === 'active' ? 'badge-active' : 'badge-completed'
                }`}>
                  {schedule.status}
                </span>
                <span className="text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  {schedule.duration} mins
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-1">{schedule.subjectName}</h3>
                <p className="text-gray-600 text-sm mb-4">{schedule.labTopic}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="w-5 text-center mr-2">📅</span>
                    {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="w-5 text-center mr-2">⏰</span>
                    {schedule.time}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 mt-auto">
                {schedule.status === 'active' && (
                  <button 
                    onClick={() => navigate(`/student/viva/${schedule._id}`)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2.5 rounded-lg font-bold shadow-md shadow-green-500/30 transition-transform transform hover:-translate-y-0.5 flex justify-center items-center"
                  >
                    <span className="mr-2">🚀</span> Start Viva Now
                  </button>
                )}
                
                {schedule.status === 'upcoming' && (
                  <button 
                    onClick={() => navigate('/student/chatbot')}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-lg font-semibold transition-colors border border-blue-200 flex justify-center items-center"
                  >
                    <span className="mr-2">⏳</span> Prepare with AI
                  </button>
                )}
                
                {schedule.status === 'completed' && schedule.resultId && (
                  <button 
                    onClick={() => navigate(`/student/result/${schedule.resultId}`)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold transition-colors flex justify-center items-center"
                  >
                    <span className="mr-2">📊</span> View Result
                  </button>
                )}

                {schedule.status === 'completed' && !schedule.resultId && (
                  <button disabled className="w-full bg-gray-100 text-gray-400 py-2.5 rounded-lg font-semibold cursor-not-allowed">
                    Result Pending
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentVivaView;
