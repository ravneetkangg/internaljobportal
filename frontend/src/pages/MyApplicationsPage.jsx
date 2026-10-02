import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyApps = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApps();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <span className="badge badge-submitted">Submitted</span>;
      case 'Under Review':
        return <span className="badge badge-under-review">Under Review</span>;
      case 'Interview Scheduled':
        return <span className="badge badge-interview">Interview Scheduled</span>;
      case 'Offered':
        return <span className="badge badge-offered">Offered</span>;
      case 'Rejected':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">
            Track the status of your internal job applications.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchMyApps}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <div className="empty card">
          <p>You have not applied for any positions yet.</p>
        </div>
      ) : (
        <div className="card table-wrapper" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Department</th>
                <th>Location</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Cover Note</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td><strong>{app.jobTitle}</strong></td>
                  <td>{app.jobDepartment}</td>
                  <td>{app.jobLocation || '—'}</td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td style={{ maxWidth: 260, fontSize: 12, color: '#555' }}>
                    {app.coverNote || '—'}
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
