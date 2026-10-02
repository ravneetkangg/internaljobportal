import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Modal state for viewing details & applying
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getJobs('Open');
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load open jobs from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setCoverNote('');
    setApplySuccess('');
    setApplyError('');
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplySuccess('');
    setApplyError('');

    try {
      await api.apply(selectedJob.id, coverNote);
      setApplySuccess('Your application has been submitted successfully!');
      setTimeout(() => {
        setSelectedJob(null);
        fetchJobs();
      }, 1500);
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const departments = ['All', ...new Set(jobs.map((j) => j.department).filter(Boolean))];

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      searchTerm === '' ||
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.description && j.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = departmentFilter === 'All' || j.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1 className="page-title">Open Internal Positions</h1>
          <p className="page-subtitle">
            Explore career opportunities within the company and apply directly.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by job title or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === 'All' ? 'All Departments' : d}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={fetchJobs}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading positions...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty card">
          <p>No open positions match your criteria at this moment.</p>
        </div>
      ) : (
        <div className="job-list">
          {filteredJobs.map((job) => (
            <div key={job.id} className="job-item">
              <div className="job-item-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="job-item-title">{job.title}</span>
                  <span className="badge badge-open">Open</span>
                </div>
                <div className="job-item-meta">
                  <span><strong>Dept:</strong> {job.department}</span>
                  <span>•</span>
                  <span><strong>Location:</strong> {job.location || 'Not specified'}</span>
                  <span>•</span>
                  <span><strong>Type:</strong> {job.workType || 'Full-time'}</span>
                </div>
                <p
                  className="desc-text"
                  style={{
                    marginTop: 10,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {job.description}
                </p>
              </div>

              <div className="job-item-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => openApplyModal(job)}
                >
                  View & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View & Apply Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedJob.title}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedJob(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: 16 }}>
                <span className="badge badge-open">Open</span>
                <div className="job-item-meta" style={{ marginTop: 8 }}>
                  <span><strong>Department:</strong> {selectedJob.department}</span>
                  <span>•</span>
                  <span><strong>Location:</strong> {selectedJob.location}</span>
                  <span>•</span>
                  <span><strong>Type:</strong> {selectedJob.workType}</span>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Job Description
                </label>
                <div className="desc-text card" style={{ background: '#f9fafb' }}>
                  {selectedJob.description}
                </div>
              </div>

              <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 4 }}>
                  Applying as:
                </p>
                <p style={{ fontSize: 12, color: '#166534' }}>
                  {user?.name} ({user?.email}) · ID: {user?.employeeId} · Dept: {user?.department}
                </p>
              </div>

              {applySuccess && <div className="alert alert-success">{applySuccess}</div>}
              {applyError && <div className="alert alert-error">{applyError}</div>}

              <form onSubmit={handleApply}>
                <div className="form-group">
                  <label htmlFor="cover-note">
                    Cover Note / Internal Transfer Statement (optional)
                  </label>
                  <textarea
                    id="cover-note"
                    className="form-control"
                    rows={4}
                    placeholder="Briefly describe why you are interested in this position and relevant experience..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedJob(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={applying}
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
