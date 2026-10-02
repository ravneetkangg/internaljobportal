import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RefreshCw, FileText, Calendar, Building, MapPin, AlertCircle } from 'lucide-react';

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
        return <span className="badge badge-submitted">● Submitted</span>;
      case 'Under Review':
        return <span className="badge badge-under-review">● Under Review</span>;
      case 'Interview Scheduled':
        return <span className="badge badge-interview">● Interview Scheduled</span>;
      case 'Offered':
        return <span className="badge badge-offered">● Offer Extended</span>;
      case 'Rejected':
        return <span className="badge badge-rejected">● Closed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">My Application History</h1>
          <p className="page-subtitle">
            Track status updates and reviews for your internal career moves.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchMyApps}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading card">Retrieving application history...</div>
      ) : applications.length === 0 ? (
        <div className="empty card">
          <FileText className="empty-icon" />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
            No Active Applications
          </h3>
          <p>You haven't submitted any internal applications yet.</p>
        </div>
      ) : (
        <div className="card table-wrapper" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Job Position</th>
                <th>Target Department</th>
                <th>Location</th>
                <th>Date Applied</th>
                <th>Current Status</th>
                <th>Cover Note</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong style={{ color: 'var(--text-main)' }}>{app.jobTitle}</strong>
                  </td>
                  <td>
                    <span className="meta-chip">
                      <Building size={12} />
                      {app.jobDepartment}
                    </span>
                  </td>
                  <td>
                    <span className="meta-chip">
                      <MapPin size={12} />
                      {app.jobLocation || 'HQ'}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                      <Calendar size={13} />
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td style={{ maxWidth: 260, fontSize: 12.5, color: 'var(--text-muted)' }}>
                    {app.coverNote || <span style={{ color: 'var(--text-light)' }}>—</span>}
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
