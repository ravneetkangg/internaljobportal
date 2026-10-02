import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, FileText, PlusCircle, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ currentView, setView }) {
  const { user, logout } = useAuth();

  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-brand">
          <div className="brand-icon-box">
            <Briefcase size={18} strokeWidth={2.4} />
          </div>
          <span>Internal Career Portal</span>
        </div>

        <div className="nav-links">
          {user?.role === 'admin' ? (
            <>
              <button
                className={currentView === 'admin-jobs' ? 'active' : ''}
                onClick={() => setView('admin-jobs')}
              >
                <Briefcase size={15} />
                Manage Postings
              </button>
              <button
                className={currentView === 'admin-applications' ? 'active' : ''}
                onClick={() => setView('admin-applications')}
              >
                <FileText size={15} />
                Applications
              </button>
            </>
          ) : (
            <>
              <button
                className={currentView === 'jobs' ? 'active' : ''}
                onClick={() => setView('jobs')}
              >
                <Briefcase size={15} />
                Open Positions
              </button>
              <button
                className={currentView === 'my-applications' ? 'active' : ''}
                onClick={() => setView('my-applications')}
              >
                <FileText size={15} />
                My Applications
              </button>
            </>
          )}
        </div>

        <div className="nav-right">
          <div className="user-badge-pill">
            <div className="user-avatar-circle">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                {user?.name}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {user?.role === 'admin' ? 'System Administrator' : `${user?.employeeId} · ${user?.department}`}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={logout} title="Sign Out">
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
