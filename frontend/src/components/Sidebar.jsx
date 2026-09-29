import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ role }) => {
  const { user, logout } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', icon: '🏠', label: 'Dashboard'    },
    { to: '/student/schedules', icon: '📅', label: 'My Schedules' },
    { to: '/student/report',    icon: '📋', label: 'Test Report'  },
    { to: '/student/chatbot',   icon: '🤖', label: 'AI Chatbot'   },
  ];

  const staffLinks = [
    { to: '/staff/dashboard',    icon: '🏠', label: 'Dashboard'           },
    { to: '/staff/experiments',  icon: '🧪', label: 'Lab Experiments'     },
    { to: '/staff/schedule',     icon: '📅', label: 'Schedule Viva'       },
    { to: '/staff/performance',  icon: '📊', label: 'Performance Reports' },
  ];

  const links = role === 'student' ? studentLinks : staffLinks;

  return (
    <div className="sidebar w-64 text-white flex flex-col h-full shrink-0 shadow-xl z-10">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-1">🎓 VivaAI</h1>
        <p className="text-sm text-blue-200">Examination System</p>
      </div>

      <nav className="flex-1 mt-6">
        <ul className="space-y-2 px-4">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white text-[#1e3a5f] font-semibold'
                      : 'hover:bg-white/10'
                  }`
                }
              >
                <span className="mr-3 text-xl">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left text-red-200 hover:text-red-100 mt-8"
            >
              <span className="mr-3 text-xl">🚪</span>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      <div className="p-4 bg-black/20 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate">{user?.name || 'User'}</span>
            <span className="text-xs text-blue-200 capitalize">{role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
