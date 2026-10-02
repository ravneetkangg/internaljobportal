import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Building,
  Clock,
  Send,
  X,
  Briefcase,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Modal state
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
      setError(err.message || 'Failed to load open positions.');
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
      setApplySuccess('Your application has been successfully submitted to HR!');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Internal Career Opportunities</h1>
          <p className="page-subtitle">
            Explore open requisitions across departments and apply using your employee profile.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar / Search filters */}
      <div className="toolbar">
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: 36 }}
            placeholder="Search roles by title, keyword, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)',
            }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <select
            className="form-control"
            style={{ paddingLeft: 34, minWidth: 180 }}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
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

        <button className="btn btn-secondary btn-sm" onClick={fetchJobs} title="Refresh jobs">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="loading card">Fetching available positions from server...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty card">
          <Briefcase className="empty-icon" />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
            No Positions Found
          </h3>
          <p>We couldn't find any positions matching your search or filters.</p>
        </div>
      ) : (
        <div className="job-list">
          {filteredJobs.map((job) => (
            <div key={job.id} className="job-item">
              <div className="job-item-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className="job-item-title">{job.title}</span>
                  <span className="badge badge-open">Active Opening</span>
                </div>

                <div className="job-item-meta">
                  <span className="meta-chip">
                    <Building size={13} />
                    {job.department}
                  </span>
                  <span className="meta-chip">
                    <MapPin size={13} />
                    {job.location || 'HQ'}
                  </span>
                  <span className="meta-chip">
                    <Clock size={13} />
                    {job.workType || 'Hybrid'}
                  </span>
                </div>

                <p
                  className="desc-text"
                  style={{
                    marginTop: 12,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
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
                  <span>Apply Now</span>
                  <Send size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern View & Apply Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedJob.title}</h2>
                <div className="job-item-meta" style={{ marginTop: 4 }}>
                  <span className="meta-chip">
                    <Building size={12} />
                    {selectedJob.department}
                  </span>
                  <span className="meta-chip">
                    <MapPin size={12} />
                    {selectedJob.location}
                  </span>
                  <span className="meta-chip">
                    <Clock size={12} />
                    {selectedJob.workType}
                  </span>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedJob(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 8, fontSize: 13 }}>
                  Role Overview & Requirements
                </label>
                <div className="desc-text card" style={{ background: 'var(--bg-main)', borderStyle: 'dashed' }}>
                  {selectedJob.description}
                </div>
              </div>

              <div
                className="card"
                style={{
                  background: 'var(--success-light)',
                  borderColor: 'var(--success-border)',
                  marginBottom: 20,
                  padding: 16,
                }}
              >
                <p style={{ fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 2 }}>
                  Submitting Application As:
                </p>
                <p style={{ fontSize: 12.5, color: '#166534' }}>
                  {user?.name} · {user?.email} (ID: {user?.employeeId} · {user?.department})
                </p>
              </div>

              {applySuccess && (
                <div className="alert alert-success">
                  <CheckCircle size={16} />
                  <span>{applySuccess}</span>
                </div>
              )}
              {applyError && (
                <div className="alert alert-error">
                  <AlertCircle size={16} />
                  <span>{applyError}</span>
                </div>
              )}

              <form onSubmit={handleApply}>
                <div className="form-group">
                  <label htmlFor="cover-note">
                    Internal Transfer Statement / Notes to Hiring Manager
                  </label>
                  <textarea
                    id="cover-note"
                    className="form-control"
                    rows={4}
                    placeholder="Briefly highlight your current projects, skills, or why you want to move into this role..."
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
                    <Send size={14} />
                    <span>{applying ? 'Submitting Application...' : 'Confirm & Apply'}</span>
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
