import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, ArrowRight, User, Mail, Hash, Building2, Lock } from 'lucide-react';

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

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: 'Engineering',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div className="brand-icon-box" style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)' }}>
            <UserPlus size={20} strokeWidth={2.4} />
          </div>
          <div>
            <h1>Create Employee Account</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Self-register for internal job transfers</p>
          </div>
        </div>

        <p className="auth-subtitle">Fill in your official organization credentials</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-name"
                type="text"
                name="name"
                className="form-control"
                style={{ paddingLeft: 34 }}
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                required
              />
              <User
                size={16}
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Work Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-email"
                type="email"
                name="email"
                className="form-control"
                style={{ paddingLeft: 34 }}
                value={formData.email}
                onChange={handleChange}
                placeholder="jane.doe@company.com"
                required
              />
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-empid">Employee ID</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-empid"
                  type="text"
                  name="employeeId"
                  className="form-control"
                  style={{ paddingLeft: 34 }}
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="EMP-1042"
                  required
                />
                <Hash
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 11,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-light)',
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-dept">Department</label>
              <div style={{ position: 'relative' }}>
                <select
                  id="reg-dept"
                  name="department"
                  className="form-control"
                  style={{ paddingLeft: 34 }}
                  value={formData.department}
                  onChange={handleChange}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <Building2
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 11,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-light)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type="password"
                name="password"
                className="form-control"
                style={{ paddingLeft: 34 }}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Already registered?{' '}
          <button type="button" onClick={onSwitchToLogin}>
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
