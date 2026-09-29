import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/student/login', {
        username: username.trim().toLowerCase(),
        password,
      });
      const { user, token } = response.data;
      login(user, token, 'student');
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-gray-800">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 sidebar p-12 flex-col justify-center text-white">
        <div className="max-w-md mx-auto">
          <div className="text-7xl mb-6 text-center">🎓</div>
          <h1 className="text-4xl font-bold mb-3 text-center">Student Portal</h1>
          <p className="text-xl text-blue-200 mb-10 text-center">AI-Powered Viva Evaluation System</p>
          <ul className="space-y-5 mt-4">
            <li className="flex items-center text-lg">
              <span className="text-orange-400 mr-3 text-2xl">✓</span>
              AI-Powered MCQ Viva Sessions
            </li>
            <li className="flex items-center text-lg">
              <span className="text-orange-400 mr-3 text-2xl">✓</span>
              Interactive Voice Questions
            </li>
            <li className="flex items-center text-lg">
              <span className="text-orange-400 mr-3 text-2xl">✓</span>
              Instant Performance Evaluation
            </li>
            <li className="flex items-center text-lg">
              <span className="text-orange-400 mr-3 text-2xl">✓</span>
              AI Preparation Chatbot
            </li>
          </ul>
          <div className="mt-10 p-4 bg-white/10 rounded-xl text-sm text-blue-100">
            <p className="font-semibold mb-1">Login Instructions:</p>
            <p>Username: Your Register Number (e.g., <strong>25pca04001</strong>)</p>
            <p>Password: Provided by your staff</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">👩‍🎓</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back!</h2>
              <p className="text-gray-500 text-sm">Sign in to your student account</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">👤</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your register number"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-16 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-sm font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base font-bold rounded-xl mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                ) : 'Sign In →'}
              </button>
            </form>

            <div className="mt-6 text-center border-t pt-4">
              <Link
                to="/staff/login"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm"
              >
                Are you a staff member? Staff Login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
