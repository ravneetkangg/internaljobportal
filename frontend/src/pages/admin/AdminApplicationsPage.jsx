import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

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
      setError(err.message || 'Failed to fetch applications.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1 className="page-title">Candidate Applications</h1>
          <p className="page-subtitle">
            Review employee applications across positions and update statuses.
            {filterJobId && (
              <span style={{ marginLeft: 8, color: '#1d4ed8', fontWeight: 600 }}>
                (Filtered by Job #{filterJobId})
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {filterJobId && (
            <button className="btn btn-secondary btn-sm" onClick={onClearJobFilter}>
              Show All Jobs
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={fetchApps}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 13, color: '#666' }}>
          Showing {filtered.length} of {applications.length} applications
        </span>
      </div>

      {loading ? (
        <div className="loading">Loading applications...</div>
      ) : filtered.length === 0 ? (
        <div className="empty card">
          <p>No applications match the selected criteria.</p>
        </div>
      ) : (
        <div className="card table-wrapper" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Current Role</th>
                <th>Applied For</th>
                <th>Applied Date</th>
                <th>Cover Note</th>
                <th>Application Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.applicantName}</strong>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                      {app.applicantEmail}
                    </div>
                  </td>
                  <td>
                    <div>{app.applicantDepartment}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      ID: {app.applicantEmployeeId}
                    </div>
                  </td>
                  <td>
                    <strong>{app.jobTitle}</strong>
                    <div style={{ fontSize: 11, color: '#666' }}>
                      {app.jobDepartment}
                    </div>
                  </td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td style={{ maxWidth: 220, fontSize: 12, color: '#444' }}>
                    {app.coverNote || <span style={{ color: '#aaa' }}>No cover note</span>}
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{
                        padding: '4px 8px',
                        fontSize: 12,
                        minWidth: 150,
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
