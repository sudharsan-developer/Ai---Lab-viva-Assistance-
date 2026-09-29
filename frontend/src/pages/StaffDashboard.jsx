import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import axiosClient from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosClient.get('/staff/dashboard');
        setData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  const getPerformanceBadge = (level) => {
    const badges = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Average': 'bg-yellow-100 text-yellow-800',
      'Below Average': 'bg-orange-100 text-orange-800',
      'Poor': 'bg-red-100 text-red-800',
    };
    return badges[level] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    if (status === 'upcoming') return 'badge-upcoming px-2 py-1 rounded text-xs font-bold uppercase';
    if (status === 'active') return 'badge-active px-2 py-1 rounded text-xs font-bold uppercase';
    return 'badge-completed px-2 py-1 rounded text-xs font-bold uppercase';
  };

  // Safe chart data
  const chartData = data?.classPerformance?.length > 0 
    ? data.classPerformance.map(p => ({
        name: p.studentName.split(' ')[0], // First name for chart
        avg: p.averagePercentage,
        level: p.performanceLevel
      }))
    : [
        { name: 'Student 1', avg: 85, level: 'Excellent' },
        { name: 'Student 2', avg: 60, level: 'Average' },
      ];

  const getColorByLevel = (level) => {
    switch(level) {
      case 'Excellent': return '#10b981';
      case 'Good': return '#3b82f6';
      case 'Average': return '#eab308';
      case 'Below Average': return '#f97316';
      default: return '#ef4444';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d6a9f] rounded-xl p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, Prof. {user?.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">ID: {user?.staffId || 'STAFF-001'}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{user?.department || 'Computer Science'}</span>
              <span className="bg-orange-500 px-3 py-1 rounded-full text-sm font-bold shadow-sm">{user?.subjectName || 'Subject'}</span>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <button 
              onClick={() => navigate('/staff/schedule')}
              className="bg-white text-blue-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center"
            >
              <span className="mr-2">📅</span> Schedule New Viva
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card flex flex-col p-6">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl mr-3">👥</div>
            <p className="text-gray-500 font-medium">Total Students</p>
          </div>
          <p className="text-3xl font-bold text-gray-800 ml-13">{data?.totalStudents || 0}</p>
        </div>
        
        <div className="card flex flex-col p-6">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xl mr-3">📅</div>
            <p className="text-gray-500 font-medium">Vivas Scheduled</p>
          </div>
          <p className="text-3xl font-bold text-gray-800 ml-13">{data?.totalScheduled || 0}</p>
        </div>
        
        <div className="card flex flex-col p-6">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl mr-3">✅</div>
            <p className="text-gray-500 font-medium">Vivas Completed</p>
          </div>
          <p className="text-3xl font-bold text-gray-800 ml-13">{data?.totalCompleted || 0}</p>
        </div>
        
        <div className="card flex flex-col p-6">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl mr-3">📊</div>
            <p className="text-gray-500 font-medium">Class Average</p>
          </div>
          <p className="text-3xl font-bold text-gray-800 ml-13">{data?.classAveragePercentage || 0}%</p>
        </div>
      </div>

      {/* Main Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Schedules Table */}
          <div className="card overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Viva Schedules</h3>
              <button onClick={() => navigate('/staff/schedule')} className="text-sm text-blue-600 hover:underline font-medium">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Lab Topic</th>
                    <th className="px-4 py-3 font-medium">Date & Time</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.recentSchedules?.length > 0 ? (
                    data.recentSchedules.map((schedule, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{schedule.studentId?.name || 'Unknown'}</td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]">{schedule.labTopic}</td>
                        <td className="px-4 py-3 text-gray-500">
                          <div>{new Date(schedule.date).toLocaleDateString()}</div>
                          <div className="text-xs">{schedule.time} ({schedule.duration}m)</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={getStatusBadge(schedule.status)}>{schedule.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">No recent schedules found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Results */}
          <div className="card overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Latest Results</h3>
              <button onClick={() => navigate('/staff/performance')} className="text-sm text-blue-600 hover:underline font-medium">Full Report</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Topic</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium text-right">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.recentResults?.length > 0 ? (
                    data.recentResults.map((result, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{result.studentId?.name || 'Unknown'}</td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]">{result.scheduleId?.labTopic || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold">{result.percentage}%</span>
                          <span className="text-xs text-gray-500 ml-1">({result.score}/{result.totalQuestions})</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPerformanceBadge(result.performanceLevel)}`}>
                            {result.performanceLevel}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">No results available yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Col (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Class Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{fontSize: 12}} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                  />
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorByLevel(entry.level)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/staff/schedule')}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow transition-all group"
              >
                <div className="flex items-center text-gray-700 font-medium group-hover:text-blue-600">
                  <span className="mr-3 text-lg">📅</span> Schedule a Viva
                </div>
                <span className="text-gray-400 group-hover:text-blue-500">→</span>
              </button>
              
              <button 
                onClick={() => navigate('/staff/performance')}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow transition-all group"
              >
                <div className="flex items-center text-gray-700 font-medium group-hover:text-blue-600">
                  <span className="mr-3 text-lg">📊</span> View Full Reports
                </div>
                <span className="text-gray-400 group-hover:text-blue-500">→</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
