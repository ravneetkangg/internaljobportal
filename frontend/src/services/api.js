// API service interacting directly with ASP.NET Web API backend (/api)

const BASE = '/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => '');
    data = text ? { message: text } : null;
  }

  if (!res.ok) {
    const msg = data?.message || data?.Message || `Request failed with status ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: ({ name, email, password, employeeId, department }) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, employeeId, department }),
    }),

  me: () => request('/auth/me'),

  logout: () =>
    request('/auth/logout', { method: 'POST' }).catch(() => {}),

  // Jobs
  getJobs: (status) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/jobs${query}`);
  },

  getJob: (id) => request(`/jobs/${id}`),

  createJob: (jobData) =>
    request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),

  updateJob: (id, jobData) =>
    request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    }),

  deleteJob: (id) =>
    request(`/jobs/${id}`, {
      method: 'DELETE',
    }),

  // Applications
  apply: (jobId, coverNote) =>
    request('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, coverNote }),
    }),

  getMyApplications: () => request('/applications/my'),

  getAllApplications: (jobId) => {
    const query = jobId ? `?jobId=${encodeURIComponent(jobId)}` : '';
    return request(`/applications${query}`);
  },

  updateApplicationStatus: (id, status) =>
    request(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};
