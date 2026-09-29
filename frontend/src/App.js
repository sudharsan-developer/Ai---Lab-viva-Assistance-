import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import StudentLogin from './pages/StudentLogin';
import StaffLogin from './pages/StaffLogin';
import StudentDashboard from './pages/StudentDashboard';
import StudentVivaView from './pages/StudentVivaView';
import ChatbotPage from './pages/ChatbotPage';
import VivaSession from './pages/VivaSession';
import VivaResult from './pages/VivaResult';
import TestReport from './pages/TestReport';
import StaffDashboard from './pages/StaffDashboard';
import VivaSchedulePage from './pages/VivaSchedulePage';
import StaffPerformance from './pages/StaffPerformance';
import LabExperiments from './pages/LabExperiments';

const StudentLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      <Sidebar role="student" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const StaffLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      <Sidebar role="staff" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/student/login" element={<LoginPage />} />
      <Route path="/staff/login"   element={<LoginPage />} />

      {/* Student Routes */}
      <Route path="/student/*" element={<ProtectedRoute role="student" />}>
        <Route path="dashboard" element={<StudentLayout><StudentDashboard /></StudentLayout>} />
        <Route path="schedules" element={<StudentLayout><StudentVivaView /></StudentLayout>} />
        <Route path="chatbot" element={<StudentLayout><ChatbotPage /></StudentLayout>} />
        <Route path="viva/:scheduleId" element={<VivaSession />} /> {/* Full screen, no layout */}
        <Route path="result/:resultId" element={<StudentLayout><VivaResult /></StudentLayout>} />
        <Route path="report"           element={<StudentLayout><TestReport /></StudentLayout>} />
      </Route>

      <Route path="/staff/*" element={<ProtectedRoute role="staff" />}>
        <Route path="dashboard"   element={<StaffLayout><StaffDashboard /></StaffLayout>} />
        <Route path="experiments" element={<StaffLayout><LabExperiments /></StaffLayout>} />
        <Route path="schedule"    element={<StaffLayout><VivaSchedulePage /></StaffLayout>} />
        <Route path="performance" element={<StaffLayout><StaffPerformance /></StaffLayout>} />
      </Route>
    </Routes>
  );
}

export default App;
