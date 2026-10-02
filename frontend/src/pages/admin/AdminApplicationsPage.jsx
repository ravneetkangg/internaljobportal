import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RefreshCw, Filter, FileText, Building, Mail, Hash, AlertCircle } from 'lucide-react';

const STATUSES = [
  'Submitted',
  'Under Review',
  'Interview Scheduled',
  'Offered',
  'Rejected',
];

export default function AdminApplicationsPage({ filterJobId, onClearJobFilter }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApps = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAllApplications(filterJobId || undefined);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch candidate applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [filterJobId]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await api.updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = applications.filter((a) => {
    if (statusFilter === 'All') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Candidate Application Review</h1>
          <p className="page-subtitle">
            Review applicant profiles, notes, and progress candidates through hiring stages.
            {filterJobId && (
              <span style={{ marginLeft: 8, color: 'var(--primary)', fontWeight: 600 }}>
                (Filtered by Job #{filterJobId})
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {filterJobId && (
            <button className="btn btn-secondary btn-sm" onClick={onClearJobFilter}>
              Show All Requisitions
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={fetchApps}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="toolbar">
        <div style={{ position: 'relative' }}>
          <select
            className="form-control"
            style={{ paddingLeft: 34, minWidth: 190 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Pipeline Stages</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Filter
            size={15}
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)',
            }}
          />
        </div>

        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> of <strong>{applications.length}</strong> total candidates
        </span>
      </div>

      {loading ? (
        <div className="loading card">Loading candidate pipeline...</div>
      ) : filtered.length === 0 ? (
        <div className="empty card">
          <FileText className="empty-icon" />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
            No Candidates Found
          </h3>
          <p>There are no candidate applications for this filter selection.</p>
        </div>
      ) : (
        <div className="card table-wrapper" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Current Department</th>
                <th>Applied Position</th>
                <th>Application Date</th>
                <th>Cover Note</th>
                <th>Hiring Decision / Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong style={{ color: 'var(--text-main)', fontSize: 13.5 }}>
                      {app.applicantName}
                    </strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Mail size={12} />
                      {app.applicantEmail}
                    </div>
                  </td>
                  <td>
                    <span className="meta-chip">
                      <Building size={12} />
                      {app.applicantDepartment}
                    </span>
                    <div style={{ fontSize: 11.5, color: 'var(--text-light)', marginTop: 2 }}>
                      ID: {app.applicantEmployeeId}
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-main)' }}>{app.jobTitle}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Target: {app.jobDepartment}
                    </div>
                  </td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td style={{ maxWidth: 220, fontSize: 12.5, color: 'var(--text-main)' }}>
                    {app.coverNote || <span style={{ color: 'var(--text-light)' }}>No cover note</span>}
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{
                        padding: '6px 10px',
                        fontSize: 12.5,
                        minWidth: 160,
                        fontWeight: 500,
                      }}
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
