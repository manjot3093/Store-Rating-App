import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { extractApiError } from '../utils/validation';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <span className="w-9 h-9 rounded-md bg-ink flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-4.5 h-4.5 text-clay-400">
              <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display font-semibold text-xl">Storehouse</span>
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <div className="eyebrow mb-1.5">Welcome back</div>
            <h1 className="font-display text-2xl font-semibold text-ink">Sign in to your account</h1>
          </div>

          {error && (
            <div className="mb-5">
              <Alert type="error" onClose={() => setError('')}>{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                className="field-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="field-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink/60 mt-6">
          New here?{' '}
          <Link to="/signup" className="text-brand-600 font-semibold hover:underline">
            Create a normal user account
          </Link>
        </p>

        <div className="mt-8 card p-4 text-[13px] text-ink/60 leading-relaxed">
          <div className="eyebrow mb-1.5">Demo credentials (after running the seed script)</div>
          <div className="font-mono text-[12.5px] space-y-0.5">
            <div>admin@storeratings.com / Admin@1234</div>
            <div>owner.greenleaf@storeratings.com / Owner@1234</div>
            <div>demo.user@storeratings.com / DemoUser@1234</div>
          </div>
        </div>
      </div>
    </div>
  );
}
