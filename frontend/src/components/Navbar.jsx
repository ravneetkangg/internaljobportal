import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentView, setView }) {
  const { user, logout } = useAuth();

  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-brand">Internal Career Portal</div>

        <div className="nav-links">
          {user?.role === 'admin' ? (
            <>
              <button
                className={currentView === 'admin-jobs' ? 'active' : ''}
                onClick={() => setView('admin-jobs')}
              >
                Manage Postings
              </button>
              <button
                className={currentView === 'admin-applications' ? 'active' : ''}
                onClick={() => setView('admin-applications')}
              >
                Applications
              </button>
            </>
          ) : (
            <>
              <button
                className={currentView === 'jobs' ? 'active' : ''}
                onClick={() => setView('jobs')}
              >
                Open Positions
              </button>
              <button
                className={currentView === 'my-applications' ? 'active' : ''}
                onClick={() => setView('my-applications')}
              >
                My Applications
              </button>
            </>
          )}
        </div>

        <div className="nav-right">
          <div>
            <span className="user-name">{user?.name}</span>
            <span style={{ opacity: 0.8, marginLeft: 6 }}>
              ({user?.role === 'admin' ? 'Admin' : `${user?.employeeId} · ${user?.department}`})
            </span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
