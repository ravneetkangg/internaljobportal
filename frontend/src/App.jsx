import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';

export default function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [view, setView] = useState(''); // set according to user role
  const [adminJobFilter, setAdminJobFilter] = useState(null);

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="loading">Loading Internal Job Portal...</div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <RegisterPageWrapper onSwitchToRegister={() => setAuthView('register')} />;
  }

  // Determine active view fallback
  const currentView = view || (user.role === 'admin' ? 'admin-jobs' : 'jobs');

  const handleViewApplicationsForJob = (jobId) => {
    setAdminJobFilter(jobId);
    setView('admin-applications');
  };

  const handleClearJobFilter = () => {
    setAdminJobFilter(null);
  };

  return (
    <div className="page">
      <Navbar currentView={currentView} setView={setView} />
      <main className="main">
        {user.role === 'admin' ? (
          <>
            {currentView === 'admin-jobs' && (
              <AdminJobsPage onViewApplicationsForJob={handleViewApplicationsForJob} />
            )}
            {currentView === 'admin-applications' && (
              <AdminApplicationsPage
                filterJobId={adminJobFilter}
                onClearJobFilter={handleClearJobFilter}
              />
            )}
          </>
        ) : (
          <>
            {currentView === 'jobs' && <JobsPage />}
            {currentView === 'my-applications' && <MyApplicationsPage />}
          </>
        )}
      </main>
    </div>
  );
}

function RegisterPageWrapper({ onSwitchToRegister }) {
  return <LoginPage onSwitchToRegister={onSwitchToRegister} />;
}
