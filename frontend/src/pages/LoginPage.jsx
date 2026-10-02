import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@company.com');
    setPassword('Admin@123');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div className="brand-icon-box" style={{ width: 40, height: 40 }}>
            <Briefcase size={22} strokeWidth={2.4} />
          </div>
          <div>
            <h1>Internal Career Portal</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Organization Talent Mobility</p>
          </div>
        </div>

        <p className="auth-subtitle">Sign in with your enterprise credentials</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Work Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="form-control"
                style={{ paddingLeft: 34 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@company.com"
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

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                className="form-control"
                style={{ paddingLeft: 34 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <div style={{ marginTop: 14 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fillAdmin}
            style={{ width: '100%', padding: '8px 12px' }}
          >
            <ShieldCheck size={14} color="var(--primary)" />
            <span>Auto-fill Admin Credentials</span>
          </button>
        </div>

        <div className="auth-footer">
          New employee?{' '}
          <button type="button" onClick={onSwitchToRegister}>
            Create your account
          </button>
        </div>
      </div>
    </div>
  );
}
