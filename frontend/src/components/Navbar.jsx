import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, role } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('schedules')) return 'My Schedules';
    if (path.includes('chatbot')) return 'AI Preparation Assistant';
    if (path.includes('result')) return 'Viva Result';
    if (path.includes('schedule')) return 'Schedule Viva';
    if (path.includes('performance')) return 'Performance Reports';
    return 'Portal';
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm h-16 shrink-0 flex items-center justify-between px-6 z-0">
      <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
      
      <div className="flex items-center space-x-6">
        <div className="text-sm text-gray-500 hidden md:block">
          {currentDate}
        </div>
        <div className="flex items-center space-x-3 border-l pl-6">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-700">{user?.name}</div>
            <div className="text-xs text-blue-600 capitalize bg-blue-50 inline-block px-2 py-0.5 rounded-full mt-0.5">
              {role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
