import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Customer Support',
  'Human Resources',
  'Finance',
  'Operations',
];

export default function AdminJobsPage({ onViewApplicationsForJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: '',
    workType: 'Hybrid',
    description: '',
    status: 'Open',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      // Admin sees All jobs (open and closed)
      const data = await api.getJobs('All');
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      department: 'Engineering',
      location: 'HQ (San Francisco, CA)',
      workType: 'Hybrid',
      description: '',
      status: 'Open',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      workType: job.workType,
      description: job.description,
      status: job.status,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      if (editingJob) {
        await api.updateJob(editingJob.id, formData);
      } else {
        await api.createJob(formData);
      }
      setModalOpen(false);
      fetchJobs();
    } catch (err) {
      setFormError(err.message || 'Failed to save job posting.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteJob(id);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Failed to delete job.');
    }
  };

  const toggleStatus = async (job) => {
    const nextStatus = job.status === 'Open' ? 'Closed' : 'Open';
    try {
      await api.updateJob(job.id, {
        title: job.title,
        department: job.department,
        location: job.location,
        workType: job.workType,
        description: job.description,
        status: nextStatus,
      });
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1 className="page-title">Manage Job Postings</h1>
          <p className="page-subtitle">
            Admin console: Create, edit, close, and review postings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchJobs}>
            Refresh
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Post New Job
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading postings...</div>
      ) : jobs.length === 0 ? (
        <div className="empty card">
          <p>No job postings yet. Click "+ Post New Job" to create your first internal role.</p>
        </div>
      ) : (
        <div className="card table-wrapper" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Department</th>
                <th>Location / Type</th>
                <th>Status</th>
                <th>Applications</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <strong>{job.title}</strong>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                      Created {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{job.department}</td>
                  <td>
                    {job.location} · <span style={{ color: '#666' }}>{job.workType}</span>
                  </td>
                  <td>
                    <span className={`badge ${job.status === 'Open' ? 'badge-open' : 'badge-closed'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewApplicationsForJob(job.id)}
                    >
                      {job.applicationCount || 0} View
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleStatus(job)}
                      >
                        {job.status === 'Open' ? 'Close' : 'Reopen'}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEditModal(job)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(job.id, job.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}

              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label htmlFor="job-title">Job Title</label>
                  <input
                    id="job-title"
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="job-dept">Department</label>
                    <select
                      id="job-dept"
                      className="form-control"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="job-type">Work Type</label>
                    <select
                      id="job-type"
                      className="form-control"
                      value={formData.workType}
                      onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="job-location">Location</label>
                    <input
                      id="job-location"
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA or Remote (US)"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="job-status">Status</label>
                    <select
                      id="job-status"
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="job-desc">Job Description & Requirements</label>
                  <textarea
                    id="job-desc"
                    className="form-control"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter full job duties, expectations, required skills..."
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : editingJob ? 'Save Changes' : 'Create Job'}
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
