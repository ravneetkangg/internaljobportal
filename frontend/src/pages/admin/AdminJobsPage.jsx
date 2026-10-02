import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Building,
  MapPin,
  Clock,
  Briefcase,
  X,
  AlertCircle
} from 'lucide-react';

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
      const data = await api.getJobs('All');
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch job postings.');
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
      location: 'San Francisco, CA (HQ)',
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
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
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
      alert(err.message || 'Failed to update job status.');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Manage Job Postings</h1>
          <p className="page-subtitle">
            Create, edit, toggle requisitions, and monitor candidate application counts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchJobs}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <Plus size={15} />
            <span>Post New Requisition</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading card">Loading requisitions...</div>
      ) : jobs.length === 0 ? (
        <div className="empty card">
          <Briefcase className="empty-icon" />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
            No Job Postings Yet
          </h3>
          <p>Click "Post New Requisition" above to publish your company's first internal opening.</p>
        </div>
      ) : (
        <div className="card table-wrapper" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Position Title</th>
                <th>Department</th>
                <th>Location / Mode</th>
                <th>Status</th>
                <th>Candidates</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>{job.title}</strong>
                    <div style={{ fontSize: 11.5, color: 'var(--text-light)', marginTop: 2 }}>
                      Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className="meta-chip">
                      <Building size={12} />
                      {job.department}
                    </span>
                  </td>
                  <td>
                    <span className="meta-chip">
                      <MapPin size={12} />
                      {job.location} · {job.workType}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${job.status === 'Open' ? 'badge-open' : 'badge-closed'}`}>
                      {job.status === 'Open' ? '● Open' : '○ Closed'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewApplicationsForJob(job.id)}
                    >
                      <Eye size={13} />
                      <span>{job.applicationCount || 0} Review</span>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleStatus(job)}
                        title={job.status === 'Open' ? 'Close job' : 'Reopen job'}
                      >
                        {job.status === 'Open' ? (
                          <>
                            <XCircle size={13} color="var(--danger)" />
                            <span>Close</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} color="var(--success)" />
                            <span>Reopen</span>
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEditModal(job)}
                        title="Edit job"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(job.id, job.title)}
                        title="Delete job"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modern Create / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingJob ? 'Edit Job Requisition' : 'Post New Internal Requisition'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {formError && (
                <div className="alert alert-error">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label htmlFor="job-title">Job Title</label>
                  <input
                    id="job-title"
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Staff Full Stack Engineer"
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
                    <label htmlFor="job-type">Work Arrangement</label>
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
                    <label htmlFor="job-location">Location / Office</label>
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
                    <label htmlFor="job-status">Listing Status</label>
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
                  <label htmlFor="job-desc">Job Description & Qualifications</label>
                  <textarea
                    id="job-desc"
                    className="form-control"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Responsibilities, team context, required skills and technologies..."
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
                    {saving ? 'Saving...' : editingJob ? 'Save Changes' : 'Publish Requisition'}
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
